use contracts::shadow_vault::{IShadowVaultDispatcher, IShadowVaultDispatcherTrait};
use openzeppelin_token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};
use openzeppelin_utils::serde::SerializedAppend;
use snforge_std::{
    CheatSpan, ContractClassTrait, DeclareResultTrait, cheat_block_timestamp, cheat_caller_address,
    declare,
};
use starknet::ContractAddress;

// STRK token on Sepolia
const STRK_TOKEN: felt252 = 0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d;

// Test addresses
const OWNER: ContractAddress = 0x02dA5254690b46B9C4059C25366D1778839BE63C142d899F0306fd5c312A5918
    .try_into()
    .unwrap();

const USER1: ContractAddress = 0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
    .try_into()
    .unwrap();

const BENEFICIARY1: ContractAddress =
    0x0111111111111111111111111111111111111111111111111111111111111111
    .try_into()
    .unwrap();

const BENEFICIARY2: ContractAddress =
    0x0222222222222222222222222222222222222222222222222222222222222222
    .try_into()
    .unwrap();

const AGENT: ContractAddress = 0x0333333333333333333333333333333333333333333333333333333333333333
    .try_into()
    .unwrap();

fn deploy_shadow_vault() -> ContractAddress {
    let strk_address: ContractAddress = STRK_TOKEN.try_into().unwrap();
    let mut calldata = array![];
    calldata.append_serde(OWNER);
    calldata.append_serde(strk_address);
    let contract = declare("ShadowVault").unwrap().contract_class();
    let (contract_address, _) = contract.deploy(@calldata).unwrap();
    contract_address
}

// ==================== VAULT TESTS ====================

#[test]
#[fork("SEPOLIA_LATEST")]
fn test_deposit() {
    let contract_address = deploy_shadow_vault();
    let dispatcher = IShadowVaultDispatcher { contract_address };
    let strk_address: ContractAddress = STRK_TOKEN.try_into().unwrap();
    let erc20 = IERC20Dispatcher { contract_address: strk_address };
    let amount: u256 = 1000;

    // Approve and deposit
    cheat_caller_address(strk_address, OWNER, CheatSpan::TargetCalls(1));
    erc20.approve(contract_address, amount);

    cheat_caller_address(contract_address, OWNER, CheatSpan::TargetCalls(1));
    dispatcher.deposit(amount);

    assert(dispatcher.get_balance(OWNER) == amount, 'Balance should be 1000');
}

#[test]
#[fork("SEPOLIA_LATEST")]
fn test_withdraw() {
    let contract_address = deploy_shadow_vault();
    let dispatcher = IShadowVaultDispatcher { contract_address };
    let strk_address: ContractAddress = STRK_TOKEN.try_into().unwrap();
    let erc20 = IERC20Dispatcher { contract_address: strk_address };
    let deposit_amount: u256 = 1000;
    let withdraw_amount: u256 = 400;

    // Approve and deposit first
    cheat_caller_address(strk_address, OWNER, CheatSpan::TargetCalls(1));
    erc20.approve(contract_address, deposit_amount);
    cheat_caller_address(contract_address, OWNER, CheatSpan::TargetCalls(1));
    dispatcher.deposit(deposit_amount);

    // Withdraw
    cheat_caller_address(contract_address, OWNER, CheatSpan::TargetCalls(1));
    dispatcher.withdraw(withdraw_amount);

    assert(dispatcher.get_balance(OWNER) == 600, 'Balance should be 600');
}

// ==================== HEARTBEAT TESTS ====================

#[test]
#[fork("SEPOLIA_LATEST")]
fn test_heartbeat() {
    let contract_address = deploy_shadow_vault();
    let dispatcher = IShadowVaultDispatcher { contract_address };
    let strk_address: ContractAddress = STRK_TOKEN.try_into().unwrap();
    let erc20 = IERC20Dispatcher { contract_address: strk_address };

    // Deposit to activate vault
    cheat_caller_address(strk_address, OWNER, CheatSpan::TargetCalls(1));
    erc20.approve(contract_address, 100);
    cheat_caller_address(contract_address, OWNER, CheatSpan::TargetCalls(1));
    dispatcher.deposit(100);

    // Should not be dead initially
    assert(!dispatcher.is_dead(OWNER), 'Should not be dead');

    // Send heartbeat
    cheat_caller_address(contract_address, OWNER, CheatSpan::TargetCalls(1));
    dispatcher.heartbeat();

    let last_hb = dispatcher.get_last_heartbeat(OWNER);
    assert(last_hb > 0, 'Heartbeat should be recorded');
}

#[test]
#[fork("SEPOLIA_LATEST")]
fn test_is_dead_after_timeout() {
    let contract_address = deploy_shadow_vault();
    let dispatcher = IShadowVaultDispatcher { contract_address };
    let strk_address: ContractAddress = STRK_TOKEN.try_into().unwrap();
    let erc20 = IERC20Dispatcher { contract_address: strk_address };

    // Set short interval for testing (1 day)
    cheat_caller_address(contract_address, OWNER, CheatSpan::TargetCalls(1));
    dispatcher.set_heartbeat_interval(86400); // 1 day

    // Deposit to activate
    cheat_caller_address(strk_address, OWNER, CheatSpan::TargetCalls(1));
    erc20.approve(contract_address, 100);
    cheat_caller_address(contract_address, OWNER, CheatSpan::TargetCalls(1));
    dispatcher.deposit(100);

    // Not dead yet
    assert(!dispatcher.is_dead(OWNER), 'Should not be dead yet');

    // Simulate time passing: 2 days later
    cheat_block_timestamp(contract_address, 86400 * 2 + 99999999999, CheatSpan::Indefinite);
    assert(dispatcher.is_dead(OWNER), 'Should be dead after timeout');
}

// ==================== BENEFICIARY TESTS ====================

#[test]
fn test_set_beneficiary() {
    let contract_address = deploy_shadow_vault();
    let dispatcher = IShadowVaultDispatcher { contract_address };

    cheat_caller_address(contract_address, OWNER, CheatSpan::TargetCalls(1));
    dispatcher.set_beneficiary(BENEFICIARY1, 5000); // 50%

    cheat_caller_address(contract_address, OWNER, CheatSpan::TargetCalls(1));
    dispatcher.set_beneficiary(BENEFICIARY2, 5000); // 50%

    assert(dispatcher.get_beneficiary_count(OWNER) == 2, 'Should have 2 beneficiaries');

    let (addr, share) = dispatcher.get_beneficiary_at(OWNER, 0);
    assert(addr == BENEFICIARY1, 'Should be BENEFICIARY1');
    assert(share == 5000, 'Should be 50%');
}

#[test]
fn test_remove_beneficiary() {
    let contract_address = deploy_shadow_vault();
    let dispatcher = IShadowVaultDispatcher { contract_address };

    cheat_caller_address(contract_address, OWNER, CheatSpan::TargetCalls(1));
    dispatcher.set_beneficiary(BENEFICIARY1, 5000);
    cheat_caller_address(contract_address, OWNER, CheatSpan::TargetCalls(1));
    dispatcher.set_beneficiary(BENEFICIARY2, 5000);

    // Remove first
    cheat_caller_address(contract_address, OWNER, CheatSpan::TargetCalls(1));
    dispatcher.remove_beneficiary(BENEFICIARY1);

    assert(dispatcher.get_beneficiary_count(OWNER) == 1, 'Should have 1 beneficiary');

    // The remaining one should be BENEFICIARY2 (swapped from last position)
    let (addr, _) = dispatcher.get_beneficiary_at(OWNER, 0);
    assert(addr == BENEFICIARY2, 'Should be BENEFICIARY2');
}

// ==================== DISTRIBUTION TEST ====================

#[test]
#[fork("SEPOLIA_LATEST")]
fn test_trigger_distribution() {
    let contract_address = deploy_shadow_vault();
    let dispatcher = IShadowVaultDispatcher { contract_address };
    let strk_address: ContractAddress = STRK_TOKEN.try_into().unwrap();
    let erc20 = IERC20Dispatcher { contract_address: strk_address };

    // Setup: short interval
    cheat_caller_address(contract_address, OWNER, CheatSpan::TargetCalls(1));
    dispatcher.set_heartbeat_interval(86400);

    // Set beneficiaries: 60% + 40%
    cheat_caller_address(contract_address, OWNER, CheatSpan::TargetCalls(1));
    dispatcher.set_beneficiary(BENEFICIARY1, 6000);
    cheat_caller_address(contract_address, OWNER, CheatSpan::TargetCalls(1));
    dispatcher.set_beneficiary(BENEFICIARY2, 4000);

    // Deposit
    let deposit_amount: u256 = 10000;
    cheat_caller_address(strk_address, OWNER, CheatSpan::TargetCalls(1));
    erc20.approve(contract_address, deposit_amount);
    cheat_caller_address(contract_address, OWNER, CheatSpan::TargetCalls(1));
    dispatcher.deposit(deposit_amount);

    // Time travel past deadline
    cheat_block_timestamp(contract_address, 86400 * 2 + 99999999999, CheatSpan::Indefinite);

    // Trigger distribution (anyone can call)
    dispatcher.trigger_distribution(OWNER);

    // Verify distribution
    let ben1_balance = erc20.balance_of(BENEFICIARY1);
    let ben2_balance = erc20.balance_of(BENEFICIARY2);
    assert(ben1_balance == 6000, 'Ben1 should get 6000');
    assert(ben2_balance == 4000, 'Ben2 should get 4000');
}

// ==================== AI AGENT TESTS ====================

#[test]
fn test_set_agent() {
    let contract_address = deploy_shadow_vault();
    let dispatcher = IShadowVaultDispatcher { contract_address };

    cheat_caller_address(contract_address, OWNER, CheatSpan::TargetCalls(1));
    dispatcher.set_agent(AGENT);

    assert(dispatcher.get_agent(OWNER) == AGENT, 'Agent should be set');
}

#[test]
#[should_panic(expected: 'Not authorized agent')]
fn test_unauthorized_agent() {
    let contract_address = deploy_shadow_vault();
    let dispatcher = IShadowVaultDispatcher { contract_address };

    // Try to execute without being authorized
    cheat_caller_address(contract_address, USER1, CheatSpan::TargetCalls(1));
    dispatcher.agent_execute(OWNER, 100, BENEFICIARY1);
}
