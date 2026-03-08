"use client";

import { useState } from "react";
import { useAccount } from "@starknet-react/core";
import { useScaffoldReadContract } from "~~/hooks/scaffold-stark/useScaffoldReadContract";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-stark/useScaffoldWriteContract";

export const DistributionPanel = () => {
    const { address } = useAccount();
    const [isDistributing, setIsDistributing] = useState(false);

    const { data: isDead } = useScaffoldReadContract({
        contractName: "ShadowVault",
        functionName: "is_dead",
        args: address ? [address as string] : ([] as any),
    });

    const { data: balance } = useScaffoldReadContract({
        contractName: "ShadowVault",
        functionName: "get_balance",
        args: address ? [address as string] : ([] as any),
    });

    const { data: beneficiaryCount } = useScaffoldReadContract({
        contractName: "ShadowVault",
        functionName: "get_beneficiary_count",
        args: address ? [address as string] : ([] as any),
    });

    const { sendAsync: triggerDistribution } = useScaffoldWriteContract({
        contractName: "ShadowVault",
        functionName: "trigger_distribution",
        args: address ? [address as string] : [undefined],
    });

    const isDeadBool = (isDead as any) === true || (isDead as any) === 1n || (isDead as any) === 1;
    const balanceNum = balance ? Number(balance) : 0;
    const hasBeenDistributed = isDeadBool && balanceNum === 0;
    const canDistribute = isDeadBool && balanceNum > 0 && !hasBeenDistributed;
    const beneficiaryCountNum = beneficiaryCount ? Number(beneficiaryCount) : 0;

    const handleDistribute = async () => {
        if (!canDistribute) return;
        setIsDistributing(true);
        try {
            await triggerDistribution();
        } catch (error) {
            console.error("Distribution failed:", error);
        } finally {
            setIsDistributing(false);
        }
    };

    const statCard = (title: string, value: string, valueClass?: string) => (
        <div className="flex flex-col gap-1 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
            <span className="text-xs text-white/40 font-medium uppercase tracking-widest">{title}</span>
            <span className={`text-xl font-semibold ${valueClass ?? "text-white"}`}>{value}</span>
        </div>
    );

    return (
        <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8">
            <h2 className="text-2xl font-semibold tracking-tight mb-6">Distribution</h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {statCard(
                    "Vault Status",
                    isDeadBool ? "Dead" : "Active",
                    isDeadBool ? "text-red-400" : "text-emerald-400",
                )}
                {statCard(
                    "Distribution",
                    hasBeenDistributed ? "Completed" : "Pending",
                    hasBeenDistributed ? "text-emerald-400" : "text-yellow-400",
                )}
                {statCard("Beneficiaries", String(beneficiaryCountNum))}
                {statCard("Vault Balance", balanceNum > 0 ? `${(balanceNum / 1e18).toFixed(4)} STRK` : "0 STRK")}
            </div>

            {!address && (
                <div className="rounded-xl border border-yellow-400/20 bg-yellow-400/5 px-4 py-3 text-sm text-yellow-300 mb-4">
                    Connect your wallet to trigger distribution.
                </div>
            )}

            {address && !isDeadBool && (
                <div className="rounded-xl border border-blue-400/20 bg-blue-400/5 px-4 py-3 text-sm text-blue-300 mb-4">
                    Vault is active. Distribution can only be triggered after the heartbeat interval expires.
                </div>
            )}

            {hasBeenDistributed && (
                <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 text-sm text-emerald-300 mb-4">
                    Distribution completed. Assets have been sent to all beneficiaries.
                </div>
            )}

            <div className="flex justify-end mt-2">
                <button
                    className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                        canDistribute && !isDistributing
                            ? "bg-red-500/90 hover:bg-red-500 text-white"
                            : "bg-white/[0.04] text-white/30 cursor-not-allowed"
                    }`}
                    onClick={handleDistribute}
                    disabled={!canDistribute || isDistributing}
                >
                    {isDistributing ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                            Distributing...
                        </span>
                    ) : hasBeenDistributed ? (
                        "Already Distributed"
                    ) : canDistribute ? (
                        "Trigger Distribution"
                    ) : (
                        "Distribution Not Available"
                    )}
                </button>
            </div>
        </div>
    );
};
