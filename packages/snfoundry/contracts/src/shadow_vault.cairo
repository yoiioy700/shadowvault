#[starknet::interface]
pub trait IShadowVault<TContractState> {
    // === Vault Operations ===
    fn deposit(ref self: TContractState, amount: u256);
    fn withdraw(ref self: TContractState, amount: u256);
    fn get_balance(self: @TContractState, user: starknet::ContractAddress) -> u256;

    // === Dead Man's Switch ===
    fn heartbeat(ref self: TContractState);
    fn get_last_heartbeat(self: @TContractState, user: starknet::ContractAddress) -> u64;
    fn get_heartbeat_interval(self: @TContractState, user: starknet::ContractAddress) -> u64;
    fn set_heartbeat_interval(ref self: TContractState, interval: u64);
    fn is_dead(self: @TContractState, user: starknet::ContractAddress) -> bool;

    // === Beneficiary Management ===
    fn set_beneficiary(
        ref self: TContractState, beneficiary: starknet::ContractAddress, share_bps: u16,
    );
    fn remove_beneficiary(ref self: TContractState, beneficiary: starknet::ContractAddress);
    fn get_beneficiary_count(self: @TContractState, user: starknet::ContractAddress) -> u32;
    fn get_beneficiary_at(
        self: @TContractState, user: starknet::ContractAddress, index: u32,
    ) -> (starknet::ContractAddress, u16);

    // === Distribution ===
    fn trigger_distribution(ref self: TContractState, user: starknet::ContractAddress);

    // === AI Agent ===
    fn set_agent(ref self: TContractState, agent: starknet::ContractAddress);
    fn get_agent(
        self: @TContractState, user: starknet::ContractAddress,
    ) -> starknet::ContractAddress;
    fn agent_execute(
        ref self: TContractState,
        user: starknet::ContractAddress,
        amount: u256,
        recipient: starknet::ContractAddress,
    );
}

#[starknet::contract]
pub mod ShadowVault {
    use openzeppelin_access::ownable::OwnableComponent;
    use openzeppelin_token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};
    use starknet::storage::{
        Map, StorageMapReadAccess, StorageMapWriteAccess, StoragePointerReadAccess,
        StoragePointerWriteAccess,
    };
    use starknet::{ContractAddress, get_block_timestamp, get_caller_address, get_contract_address};
    use super::IShadowVault;

    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);

    #[abi(embed_v0)]
    impl OwnableImpl = OwnableComponent::OwnableImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    // Default heartbeat interval: 30 days in seconds
    pub const DEFAULT_HEARTBEAT_INTERVAL: u64 = 2592000;
    // Basis points denominator (10000 = 100%)
    pub const BPS_DENOMINATOR: u256 = 10000;
    // Maximum number of beneficiaries per vault (prevents unbounded loop DoS)
    pub const MAX_BENEFICIARIES: u32 = 20;

    // ==================== EVENTS ====================

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        #[flat]
        OwnableEvent: OwnableComponent::Event,
        DepositMade: DepositMade,
        WithdrawalMade: WithdrawalMade,
        HeartbeatRecorded: HeartbeatRecorded,
        BeneficiarySet: BeneficiarySet,
        BeneficiaryRemoved: BeneficiaryRemoved,
        DistributionTriggered: DistributionTriggered,
        AgentSet: AgentSet,
        AgentExecuted: AgentExecuted,
    }

    #[derive(Drop, starknet::Event)]
    pub struct DepositMade {
        #[key]
        pub user: ContractAddress,
        pub amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    pub struct WithdrawalMade {
        #[key]
        pub user: ContractAddress,
        pub amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    pub struct HeartbeatRecorded {
        #[key]
        pub user: ContractAddress,
        pub timestamp: u64,
    }

    #[derive(Drop, starknet::Event)]
    pub struct BeneficiarySet {
        #[key]
        pub user: ContractAddress,
        pub beneficiary: ContractAddress,
        pub share_bps: u16,
    }

    #[derive(Drop, starknet::Event)]
    pub struct BeneficiaryRemoved {
        #[key]
        pub user: ContractAddress,
        pub beneficiary: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    pub struct DistributionTriggered {
        #[key]
        pub user: ContractAddress,
        pub total_distributed: u256,
    }

    #[derive(Drop, starknet::Event)]
    pub struct AgentSet {
        #[key]
        pub user: ContractAddress,
        pub agent: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    pub struct AgentExecuted {
        #[key]
        pub user: ContractAddress,
        pub agent: ContractAddress,
        pub amount: u256,
        pub recipient: ContractAddress,
    }

    // ==================== STORAGE ====================

    #[storage]
    struct Storage {
        // Vault
        balances: Map<ContractAddress, u256>,
        token_address: ContractAddress,
        // Dead Man's Switch
        last_heartbeat: Map<ContractAddress, u64>,
        heartbeat_interval: Map<ContractAddress, u64>,
        is_activated: Map<ContractAddress, bool>,
        has_been_distributed: Map<ContractAddress, bool>,
        // Beneficiaries: user -> index -> data
        beneficiary_count: Map<ContractAddress, u32>,
        beneficiary_address: Map<(ContractAddress, u32), ContractAddress>,
        beneficiary_share: Map<(ContractAddress, u32), u16>,
        // AI Agent
        user_agent: Map<ContractAddress, ContractAddress>,
        // Ownable
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
    }

    // ==================== CONSTRUCTOR ====================

    #[constructor]
    fn constructor(
        ref self: ContractState, owner: ContractAddress, token_address: ContractAddress,
    ) {
        self.ownable.initializer(owner);
        self.token_address.write(token_address);
    }

    // ==================== IMPLEMENTATION ====================

    #[abi(embed_v0)]
    impl ShadowVaultImpl of IShadowVault<ContractState> {
        // === Vault Operations ===

        fn deposit(ref self: ContractState, amount: u256) {
            assert(amount > 0, 'Amount must be > 0');
            let caller = get_caller_address();
            let token = IERC20Dispatcher { contract_address: self.token_address.read() };

            // Transfer tokens from user to vault
            let success = token.transfer_from(caller, get_contract_address(), amount);
            assert(success, 'transfer_from failed');

            // Update balance
            let current_balance = self.balances.read(caller);
            self.balances.write(caller, current_balance + amount);

            // Activate vault and record heartbeat if first deposit
            if !self.is_activated.read(caller) {
                self.is_activated.write(caller, true);
                self.last_heartbeat.write(caller, get_block_timestamp());
                if self.heartbeat_interval.read(caller) == 0 {
                    self.heartbeat_interval.write(caller, DEFAULT_HEARTBEAT_INTERVAL);
                }
            }

            self.emit(DepositMade { user: caller, amount });
        }

        fn withdraw(ref self: ContractState, amount: u256) {
            let caller = get_caller_address();
            assert(!self.is_dead(caller), 'Vault is in dead state'); // tambah ini
            let current_balance = self.balances.read(caller);
            assert(amount > 0, 'Amount must be > 0');
            assert(current_balance >= amount, 'Insufficient balance');

            self.balances.write(caller, current_balance - amount);

            let token = IERC20Dispatcher { contract_address: self.token_address.read() };
            token.transfer(caller, amount);

            self.last_heartbeat.write(caller, get_block_timestamp());

            self.emit(WithdrawalMade { user: caller, amount });
        }

        fn get_balance(self: @ContractState, user: ContractAddress) -> u256 {
            self.balances.read(user)
        }

        // === Dead Man's Switch ===

        fn heartbeat(ref self: ContractState) {
            let caller = get_caller_address();
            assert(self.is_activated.read(caller), 'Vault not activated');

            let timestamp = get_block_timestamp();
            self.last_heartbeat.write(caller, timestamp);

            self.emit(HeartbeatRecorded { user: caller, timestamp });
        }

        fn get_last_heartbeat(self: @ContractState, user: ContractAddress) -> u64 {
            self.last_heartbeat.read(user)
        }

        fn get_heartbeat_interval(self: @ContractState, user: ContractAddress) -> u64 {
            let interval = self.heartbeat_interval.read(user);
            if interval == 0 {
                DEFAULT_HEARTBEAT_INTERVAL
            } else {
                interval
            }
        }

        fn set_heartbeat_interval(ref self: ContractState, interval: u64) {
            assert(interval >= 86400, 'Min interval is 1 day');
            let caller = get_caller_address();
            self.heartbeat_interval.write(caller, interval);
        }

        fn is_dead(self: @ContractState, user: ContractAddress) -> bool {
            if !self.is_activated.read(user) {
                return false;
            }
            if self.has_been_distributed.read(user) {
                return true;
            }
            let last_hb = self.last_heartbeat.read(user);
            let interval = self.heartbeat_interval.read(user);
            let effective_interval = if interval == 0 {
                DEFAULT_HEARTBEAT_INTERVAL
            } else {
                interval
            };
            let current_time = get_block_timestamp();
            current_time > last_hb + effective_interval
        }

        // === Beneficiary Management ===

        fn set_beneficiary(ref self: ContractState, beneficiary: ContractAddress, share_bps: u16) {
            let caller = get_caller_address();
            assert(share_bps > 0 && share_bps <= 10000, 'Invalid share bps');
            assert(!self.has_been_distributed.read(caller), 'Already distributed');

            let count = self.beneficiary_count.read(caller);
            assert(count < MAX_BENEFICIARIES, 'Max beneficiaries reached');
            let mut found = false;
            let mut found_index: u32 = 0;
            let mut total_existing_shares: u32 = 0;
            let mut i: u32 = 0;

            while i < count {
                let addr = self.beneficiary_address.read((caller, i));
                let share = self.beneficiary_share.read((caller, i));
                if addr == beneficiary {
                    found = true;
                    found_index = i;
                } else {
                    total_existing_shares += share.into(); // exclude current beneficiary dari total
                }
                i += 1;
            }

            // Validate total won't exceed 10000 bps (using u32 to prevent overflow)
            assert(total_existing_shares + share_bps.into() <= 10000_u32, 'Total shares exceed 100%');

            if found {
                self.beneficiary_share.write((caller, found_index), share_bps);
            } else {
                self.beneficiary_address.write((caller, count), beneficiary);
                self.beneficiary_share.write((caller, count), share_bps);
                self.beneficiary_count.write(caller, count + 1);
            }

            self.emit(BeneficiarySet { user: caller, beneficiary, share_bps });
        }

        fn remove_beneficiary(ref self: ContractState, beneficiary: ContractAddress) {
            let caller = get_caller_address();
            let count = self.beneficiary_count.read(caller);

            let mut i: u32 = 0;
            let mut found = false;
            while i < count {
                let addr = self.beneficiary_address.read((caller, i));
                if addr == beneficiary {
                    found = true;
                    // Move last element to this position (swap-and-pop)
                    if i < count - 1 {
                        let last_addr = self.beneficiary_address.read((caller, count - 1));
                        let last_share = self.beneficiary_share.read((caller, count - 1));
                        self.beneficiary_address.write((caller, i), last_addr);
                        self.beneficiary_share.write((caller, i), last_share);
                    }
                    // Clear last slot
                    let zero_addr: ContractAddress = 0.try_into().unwrap();
                    self.beneficiary_address.write((caller, count - 1), zero_addr);
                    self.beneficiary_share.write((caller, count - 1), 0);
                    self.beneficiary_count.write(caller, count - 1);
                    break;
                }
                i += 1;
            }

            assert(found, 'Beneficiary not found');
            self.emit(BeneficiaryRemoved { user: caller, beneficiary });
        }

        fn get_beneficiary_count(self: @ContractState, user: ContractAddress) -> u32 {
            self.beneficiary_count.read(user)
        }

        fn get_beneficiary_at(
            self: @ContractState, user: ContractAddress, index: u32,
        ) -> (ContractAddress, u16) {
            let count = self.beneficiary_count.read(user);
            assert(index < count, 'Index out of bounds');
            let addr = self.beneficiary_address.read((user, index));
            let share = self.beneficiary_share.read((user, index));
            (addr, share)
        }

        // === Distribution ===

        fn trigger_distribution(ref self: ContractState, user: ContractAddress) {
            assert(self.is_activated.read(user), 'Vault not activated');
            assert(!self.has_been_distributed.read(user), 'Already distributed');

            let last_hb = self.last_heartbeat.read(user);
            let interval = self.heartbeat_interval.read(user);
            let effective_interval = if interval == 0 {
                DEFAULT_HEARTBEAT_INTERVAL
            } else {
                interval
            };
            let current_time = get_block_timestamp();
            assert(current_time > last_hb + effective_interval, 'User is still alive');

            let total_balance = self.balances.read(user);
            assert(total_balance > 0, 'No funds to distribute');

            let count = self.beneficiary_count.read(user);
            assert(count > 0, 'No beneficiaries set');

            // CEI: update state BEFORE external calls to prevent reentrancy
            self.balances.write(user, 0);
            self.has_been_distributed.write(user, true);

            let token = IERC20Dispatcher { contract_address: self.token_address.read() };
            let mut total_distributed: u256 = 0;
            let mut i: u32 = 0;
            while i < count {
                let ben_addr = self.beneficiary_address.read((user, i));
                let share_bps: u256 = self.beneficiary_share.read((user, i)).into();

                // Last beneficiary gets remaining balance to avoid dust
                let amount = if i == count - 1 {
                    total_balance - total_distributed
                } else {
                    (total_balance * share_bps) / BPS_DENOMINATOR
                };

                if amount > 0 {
                    token.transfer(ben_addr, amount);
                    total_distributed += amount;
                }
                i += 1;
            }

            self.emit(DistributionTriggered { user, total_distributed });
        }

        // === AI Agent ===

        fn set_agent(ref self: ContractState, agent: ContractAddress) {
            let caller = get_caller_address();
            self.user_agent.write(caller, agent);
            self.emit(AgentSet { user: caller, agent });
        }

        fn get_agent(self: @ContractState, user: ContractAddress) -> ContractAddress {
            self.user_agent.read(user)
        }

        fn agent_execute(
            ref self: ContractState,
            user: ContractAddress,
            amount: u256,
            recipient: ContractAddress,
        ) {
            let caller = get_caller_address();
            let authorized_agent = self.user_agent.read(user);
            assert(caller == authorized_agent, 'Not authorized agent');
            assert(!self.is_dead(user), 'Vault is in dead state');
            assert(amount > 0, 'Amount must be > 0');

            let current_balance = self.balances.read(user);
            assert(current_balance >= amount, 'Insufficient balance');

            // Update balance and transfer
            self.balances.write(user, current_balance - amount);
            let token = IERC20Dispatcher { contract_address: self.token_address.read() };
            token.transfer(recipient, amount);

            // Record heartbeat on agent activity (proves system is alive)
            self.last_heartbeat.write(user, get_block_timestamp());

            self.emit(AgentExecuted { user, agent: caller, amount, recipient });
        }
    }
}