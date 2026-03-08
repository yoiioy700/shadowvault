"use client";

import { BalanceCard } from "./BalanceCard";
import { HeartbeatPanel } from "./HeartbeatPanel";
import { BeneficiariesList } from "./BeneficiariesList";
import { AgentPanel } from "./AgentPanel";
import { DistributionPanel } from "./DistributionPanel";

const CONTRACT_ADDRESS = "0x25ba5a7e97e079e1fb7e580e63701fe00ae9ef4e2686e2f4cac0600b1993e34";

export const VaultDashboard = () => {
    return (
        <div className="w-full min-h-screen bg-[#020202] text-white pt-12 pb-24 px-4 sm:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-3">
                            Your Vault
                        </h1>
                        <p className="text-lg text-white/50 max-w-2xl font-light">
                            Manage your decentralized inheritance and protocol status.
                        </p>
                    </div>
                    <a
                        href={`https://sepolia.starkscan.co/contract/${CONTRACT_ADDRESS}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors font-mono bg-white/[0.03] border border-white/[0.06] px-4 py-2 rounded-xl hover:border-white/[0.12] whitespace-nowrap self-start"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                        {CONTRACT_ADDRESS.slice(0, 6)}...{CONTRACT_ADDRESS.slice(-4)} · Sepolia
                    </a>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column */}
                    <div className="col-span-1 lg:col-span-5 flex flex-col gap-8">
                        <HeartbeatPanel />
                        <BalanceCard />
                    </div>
                    {/* Right Column */}
                    <div className="col-span-1 lg:col-span-7 flex flex-col gap-8">
                        <BeneficiariesList />
                        <AgentPanel />
                    </div>
                </div>

                {/* Distribution Panel - Full Width */}
                <div className="mt-8">
                    <DistributionPanel />
                </div>
            </div>
        </div>
    );
};
