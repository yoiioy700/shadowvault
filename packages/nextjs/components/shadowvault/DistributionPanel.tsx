"use client";

import { useState } from "react";
import { useAccount } from "~~/hooks/useAccount";
import { useScaffoldReadContract } from "~~/hooks/scaffold-stark/useScaffoldReadContract";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-stark/useScaffoldWriteContract";

const formatBalance = (wei: bigint | undefined): string => {
    if (!wei || wei === 0n) return "0.00";
    const str = wei.toString();
    if (str.length <= 18) {
        return "0." + str.padStart(18, "0").slice(0, 4);
    }
    const intPart = str.slice(0, str.length - 18);
    const decPart = str.slice(str.length - 18, str.length - 14);
    return `${intPart}.${decPart}`;
};

export const DistributionPanel = () => {
    const { address } = useAccount();
    const [isDistributing, setIsDistributing] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000);
    };

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

    const { data: hasBeenDistributed } = useScaffoldReadContract({
        contractName: "ShadowVault",
        functionName: "has_been_distributed",
        args: address ? [address as string] : ([] as any),
    });

    const { data: beneficiaryCount } = useScaffoldReadContract({
        contractName: "ShadowVault",
        functionName: "get_beneficiary_count",
        args: address ? [address as string] : ([] as any),
    });

    const { sendAsync: triggerDistributionAsync } = useScaffoldWriteContract({
        contractName: "ShadowVault",
        functionName: "trigger_distribution",
        args: address ? [address as string] : ([] as any),
    });

    const isDeadBool = isDead ? Boolean(isDead) : false;
    const rawBalance = balance ? BigInt(balance.toString()) : 0n;
    const distributed = hasBeenDistributed ? Boolean(hasBeenDistributed) : false;
    const benCount = beneficiaryCount ? Number(beneficiaryCount.toString()) : 0;

    const canDistribute = isDeadBool && rawBalance > 0n && !distributed && benCount > 0;

    const handleDistribute = async () => {
        setShowConfirm(false);
        setIsDistributing(true);
        try {
            await triggerDistributionAsync();
            showToast("Distribution triggered successfully! Funds sent to beneficiaries.", "success");
        } catch (e: any) {
            console.error("Error triggering distribution:", e);
            showToast(e?.message?.slice(0, 100) || "Distribution failed", "error");
        } finally {
            setIsDistributing(false);
        }
    };

    // Determine status message
    let statusMessage = "";
    let statusType: "info" | "warning" | "success" | "error" = "info";

    if (distributed) {
        statusMessage = "Vault has already been distributed to beneficiaries.";
        statusType = "success";
    } else if (!isDeadBool) {
        statusMessage = "Vault is still active. Distribution is only available after the dead man's switch triggers.";
        statusType = "info";
    } else if (rawBalance === 0n) {
        statusMessage = "No funds in the vault to distribute.";
        statusType = "warning";
    } else if (benCount === 0) {
        statusMessage = "No beneficiaries configured. Add beneficiaries first.";
        statusType = "warning";
    } else {
        statusMessage = `Vault is in dead state. ${formatBalance(rawBalance)} STRK ready for distribution to ${benCount} ${benCount === 1 ? "beneficiary" : "beneficiaries"}.`;
        statusType = "error";
    }

    const statusColors = {
        info: "border-blue-500/20 bg-blue-500/5 text-blue-400",
        warning: "border-amber-500/20 bg-amber-500/5 text-amber-400",
        success: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400",
        error: "border-red-500/20 bg-red-500/5 text-red-400",
    };

    return (
        <div className="bg-[#0a0a0c] p-6 sm:p-8 rounded-2xl border border-white/[0.08] shadow-2xl relative overflow-hidden flex flex-col">
            {/* Toast notification */}
            {toast && (
                <div
                    className={`absolute top-4 left-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        toast.type === "success"
                            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                            : "bg-red-500/10 border border-red-500/20 text-red-400"
                    }`}
                >
                    {toast.message}
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                    <div className="bg-[#111114] border border-white/[0.1] rounded-xl p-6 mx-4 max-w-sm w-full">
                        <h3 className="text-lg font-semibold text-white mb-2">Confirm Distribution</h3>
                        <p className="text-sm text-white/50 mb-1">This will permanently distribute all vault funds:</p>
                        <p className="text-lg font-mono text-red-400 mb-4">{formatBalance(rawBalance)} STRK</p>
                        <p className="text-xs text-white/30 mb-6">
                            to {benCount} {benCount === 1 ? "beneficiary" : "beneficiaries"}. This action cannot be
                            undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                className="flex-1 px-4 py-3 text-sm text-white/70 bg-white/5 hover:bg-white/10 transition-colors rounded-xl font-medium border border-white/[0.06]"
                                onClick={() => setShowConfirm(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="flex-1 px-4 py-3 text-sm text-white bg-red-600 hover:bg-red-500 transition-colors rounded-xl font-semibold"
                                onClick={handleDistribute}
                            >
                                Distribute
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-xl font-medium text-white tracking-tight">Distribution</h2>
                    <p className="text-xs text-white/30 mt-1">Trigger fund distribution to beneficiaries</p>
                </div>
                {distributed && (
                    <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <span className="text-xs text-emerald-400 font-medium">Distributed</span>
                    </div>
                )}
            </div>

            {/* Status Card */}
            <div className={`p-4 rounded-xl border mb-6 ${statusColors[statusType]}`}>
                <p className="text-sm font-medium">{statusMessage}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 mb-8">
                <div className="p-3 rounded-xl border border-white/[0.04] bg-white/[0.02] text-center">
                    <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mb-1">Status</p>
                    <p
                        className={`font-mono text-sm font-semibold ${isDeadBool ? "text-red-400" : "text-emerald-400"}`}
                    >
                        {isDeadBool ? "Dead" : "Active"}
                    </p>
                </div>
                <div className="p-3 rounded-xl border border-white/[0.04] bg-white/[0.02] text-center">
                    <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mb-1">Balance</p>
                    <p className="font-mono text-sm text-white/80">{formatBalance(rawBalance)}</p>
                </div>
                <div className="p-3 rounded-xl border border-white/[0.04] bg-white/[0.02] text-center">
                    <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mb-1">Heirs</p>
                    <p className="font-mono text-sm text-white/80">{benCount}</p>
                </div>
            </div>

            {/* Action Button */}
            <div className="mt-auto">
                <button
                    className={`w-full px-6 py-4 text-sm rounded-xl font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                        canDistribute
                            ? "text-white bg-red-600 hover:bg-red-500 shadow-[0_0_30px_rgba(220,38,38,0.2)]"
                            : "text-white/50 bg-white/5 border border-white/[0.06]"
                    }`}
                    onClick={() => setShowConfirm(true)}
                    disabled={!canDistribute || !address || isDistributing}
                >
                    {isDistributing
                        ? "Distributing..."
                        : distributed
                          ? "Already Distributed"
                          : canDistribute
                            ? "Trigger Distribution"
                            : "Distribution Unavailable"}
                </button>
            </div>
        </div>
    );
};
