"use client";

import { useState, useMemo } from "react";
import { useAccount } from "~~/hooks/useAccount";
import { useScaffoldReadContract } from "~~/hooks/scaffold-stark/useScaffoldReadContract";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-stark/useScaffoldWriteContract";
import { AddressInput } from "~~/components/scaffold-stark/Input/AddressInput";
import { Address } from "~~/components/scaffold-stark/Address";

const MAX_BENEFICIARIES = 20;

const safeBigInt = (val: string): bigint | null => {
    try {
        const n = BigInt(val);
        return n > 0n && n <= 10000n ? n : null;
    } catch {
        return null;
    }
};

const BeneficiaryRow = ({ user, index }: { user: string; index: number }) => {
    const { data } = useScaffoldReadContract({
        contractName: "ShadowVault",
        functionName: "get_beneficiary_at",
        args: [user, index],
    });

    if (!data) return null;

    // data is a tuple: [address, share_bps]
    const tuple = data as unknown as [string, number | bigint];
    const addr = tuple[0]?.toString() ?? "";
    const bps = Number(tuple[1]?.toString() ?? "0");
    const pct = (bps / 100).toFixed(1);

    return (
        <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors group">
            <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/[0.06] flex items-center justify-center text-xs text-white/50 font-mono shrink-0">
                    #{index + 1}
                </div>
                <div className="overflow-hidden">
                    <Address address={addr as `0x${string}`} size="sm" />
                </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-sm text-white/70">{pct}%</span>
                <span className="text-[10px] text-white/30 font-mono">({bps} bps)</span>
            </div>
        </div>
    );
};

export const BeneficiariesList = () => {
    const { address } = useAccount();
    const [newBeneficiary, setNewBeneficiary] = useState("");
    const [newShare, setNewShare] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const { data: beneficiaryCountObj } = useScaffoldReadContract({
        contractName: "ShadowVault",
        functionName: "get_beneficiary_count",
        args: address ? [address as string] : [] as any,
    });

    const parsedShare = safeBigInt(newShare);

    const { sendAsync: setBeneficiaryAsync } = useScaffoldWriteContract({
        contractName: "ShadowVault",
        functionName: "set_beneficiary",
        args: [newBeneficiary, parsedShare ?? BigInt(0)],
    });

    const handleAddBeneficiary = async () => {
        if (!newBeneficiary) {
            showToast("Enter a wallet address", "error");
            return;
        }
        if (!parsedShare) {
            showToast("Enter a valid share between 1-10000 BPS", "error");
            return;
        }
        if (beneficiaryCount >= MAX_BENEFICIARIES) {
            showToast(`Maximum ${MAX_BENEFICIARIES} beneficiaries reached`, "error");
            return;
        }
        setIsAdding(true);
        try {
            await setBeneficiaryAsync();
            setNewBeneficiary("");
            setNewShare("");
            showToast("Beneficiary added successfully", "success");
        } catch (e: any) {
            console.error("Error adding beneficiary:", e);
            showToast(e?.message?.slice(0, 80) || "Failed to add beneficiary", "error");
        } finally {
            setIsAdding(false);
        }
    };

    const beneficiaryCount = beneficiaryCountObj ? Number(beneficiaryCountObj.toString()) : 0;
    const indices = useMemo(() => Array.from({ length: Math.min(beneficiaryCount, MAX_BENEFICIARIES) }, (_, i) => i), [beneficiaryCount]);

    return (
        <div className="bg-[#0a0a0c] p-6 sm:p-8 rounded-2xl border border-white/[0.08] shadow-2xl relative overflow-hidden flex flex-col">
            {/* Toast notification */}
            {toast && (
                <div className={`absolute top-4 left-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    toast.type === "success"
                        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                        : "bg-red-500/10 border border-red-500/20 text-red-400"
                }`}>
                    {toast.message}
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-medium text-white tracking-tight">Beneficiaries</h2>
                    <p className="text-xs text-white/30 mt-1">Configure how your vault is distributed</p>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06]">
                    <span className="text-xs text-white/50 font-mono">
                        {beneficiaryCount}/{MAX_BENEFICIARIES} {beneficiaryCount === 1 ? "heir" : "heirs"}
                    </span>
                </div>
            </div>

            {/* Beneficiary List */}
            <div className="flex-grow min-h-[120px] mb-8">
                {beneficiaryCount === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 border border-dashed border-white/[0.06] rounded-xl bg-white/[0.01]">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/15 mb-3"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                        <p className="text-sm text-white/30 font-light">No beneficiaries configured yet</p>
                        <p className="text-xs text-white/15 mt-1">Add heirs below to protect your assets</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {indices.map((i) => (
                            <BeneficiaryRow key={i} user={address!} index={i} />
                        ))}
                    </div>
                )}
            </div>

            {/* Add Beneficiary Form */}
            <div className="mt-auto border-t border-white/[0.05] pt-6">
                <h3 className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-4">Add Beneficiary</h3>
                <div className="flex flex-col gap-3">
                    <div className="w-full grayscale brightness-75 contrast-125 opacity-80 hover:opacity-100 transition-opacity">
                        <AddressInput
                            value={newBeneficiary}
                            onChange={(val) => setNewBeneficiary(val)}
                            placeholder="Wallet address (0x...)"
                        />
                    </div>

                    <div className="flex bg-white/[0.03] border border-white/[0.08] rounded-xl overflow-hidden focus-within:border-indigo-500/30 transition-colors p-1">
                        <input
                            type="number"
                            placeholder="Share in BPS (5000 = 50%)"
                            className="w-full bg-transparent px-4 py-3 text-sm text-white/90 placeholder:text-white/30 focus:outline-none focus:ring-0 appearance-none font-mono"
                            value={newShare}
                            onChange={(e) => setNewShare(e.target.value)}
                            min={1}
                            max={10000}
                        />
                        <button
                            className="px-6 py-2 text-xs text-black bg-white hover:bg-white/90 transition-colors rounded-lg font-bold disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider whitespace-nowrap"
                            onClick={handleAddBeneficiary}
                            disabled={!newBeneficiary || !parsedShare || !address || isAdding || beneficiaryCount >= MAX_BENEFICIARIES}
                        >
                            {isAdding ? "..." : "Add"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
