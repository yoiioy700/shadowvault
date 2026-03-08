"use client";

import { useState } from "react";
import { useAccount } from "@starknet-react/core";
import { useScaffoldReadContract } from "~~/hooks/scaffold-stark/useScaffoldReadContract";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-stark/useScaffoldWriteContract";
import { useScaffoldMultiWriteContract } from "~~/hooks/scaffold-stark/useScaffoldMultiWriteContract";
import { cairo } from "starknet";

const VAULT_ADDRESS = "0x25ba5a7e97e079e1fb7e580e63701fe00ae9ef4e2686e2f4cac0600b1993e34";
const STRK_ADDRESS = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

const formatBalance = (wei: bigint | undefined): string => {
    if (!wei) return "0.00";
    const str = wei.toString();
    if (str.length <= 18) {
        return "0." + str.padStart(18, "0").slice(0, 4);
    }
    const intPart = str.slice(0, str.length - 18);
    const decPart = str.slice(str.length - 18, str.length - 14);
    return `${intPart}.${decPart}`;
};

const parseEther = (str: string): bigint => {
    if (!str) return BigInt(0);
    try {
        const parts = str.split(".");
        const intPart = parts[0] || "0";
        const fracPart = parts[1] || "";
        const fraction = fracPart.padEnd(18, "0").slice(0, 18);
        return BigInt(intPart + fraction);
    } catch (e) {
        return BigInt(0);
    }
};

export const BalanceCard = () => {
    const { address } = useAccount();
    const [depositAmount, setDepositAmount] = useState("");
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [isDepositing, setIsDepositing] = useState(false);
    const [isWithdrawing, setIsWithdrawing] = useState(false);

    const { data: balance, isLoading: isBalanceLoading } = useScaffoldReadContract({
        contractName: "ShadowVault",
        functionName: "get_balance",
        args: address ? [address as string] : [] as any,
    });

    const parsedDepositAmount = parseEther(depositAmount);
    const parsedWithdrawAmount = parseEther(withdrawAmount);

    const { sendAsync: depositAsync } = useScaffoldMultiWriteContract({
        calls: parsedDepositAmount > 0n ? [
            {
                contractAddress: STRK_ADDRESS,
                entrypoint: "approve",
                calldata: [
                    VAULT_ADDRESS,
                    cairo.uint256(parsedDepositAmount).low.toString(),
                    cairo.uint256(parsedDepositAmount).high.toString()
                ]
            },
            {
                contractName: "ShadowVault",
                functionName: "deposit",
                args: [parsedDepositAmount],
            }
        ] : [],
    });

    const { sendAsync: withdrawAsync } = useScaffoldWriteContract({
        contractName: "ShadowVault",
        functionName: "withdraw",
        args: [parsedWithdrawAmount],
    });

    const handleDeposit = async () => {
        if (!depositAmount) return;
        setIsDepositing(true);
        try {
            await depositAsync();
            setDepositAmount("");
        } catch (e) {
            console.error("Error depositing:", e);
        } finally {
            setIsDepositing(false);
        }
    };

    const handleWithdraw = async () => {
        if (!withdrawAmount) return;
        setIsWithdrawing(true);
        try {
            await withdrawAsync();
            setWithdrawAmount("");
        } catch (e) {
            console.error("Error withdrawing:", e);
        } finally {
            setIsWithdrawing(false);
        }
    };

    const rawBalance = balance ? BigInt(balance.toString()) : BigInt(0);
    const formattedBalance = formatBalance(rawBalance);

    return (
        <div className="bg-[#0a0a0c] p-6 sm:p-8 rounded-2xl border border-white/[0.08] shadow-2xl relative overflow-hidden flex flex-col">
            {/* Subtle gradient accent */}
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-indigo-500/[0.04] blur-[80px] rounded-full pointer-events-none" />

            <h2 className="text-xl font-medium text-white tracking-tight mb-8 relative z-10">Vault Balance</h2>

            <div className="flex flex-col mb-10 relative z-10">
                <span className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-2">Deposited Amount</span>
                <div className="flex items-baseline gap-3">
                    {isBalanceLoading ? (
                        <div className="w-40 h-14 bg-white/5 animate-pulse rounded-lg" />
                    ) : (
                        <>
                            <span className="text-5xl sm:text-6xl font-semibold tracking-tighter text-white tabular-nums">
                                {formattedBalance}
                            </span>
                            <span className="text-lg text-white/40 font-medium">STRK</span>
                        </>
                    )}
                </div>
                {rawBalance > 0n && (
                    <span className="text-xs text-white/25 font-mono mt-2">{rawBalance.toString()} wei</span>
                )}
            </div>

            <div className="mt-auto flex flex-col gap-4 relative z-10">
                <div className="flex bg-white/[0.03] border border-white/[0.08] rounded-xl overflow-hidden focus-within:border-indigo-500/30 transition-colors p-1">
                    <input
                        type="number"
                        step="any"
                        placeholder="Amount in STRK (e.g. 1.5)"
                        className="w-full bg-transparent px-4 py-3 text-sm text-white/90 placeholder:text-white/30 focus:outline-none focus:ring-0 appearance-none font-mono"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                    />
                    <button
                        className="px-6 py-2 text-xs text-black bg-white hover:bg-white/90 transition-colors rounded-lg font-bold disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider whitespace-nowrap"
                        onClick={handleDeposit}
                        disabled={!depositAmount || parsedDepositAmount === 0n || !address || isDepositing}
                    >
                        {isDepositing ? "..." : "Deposit"}
                    </button>
                </div>

                <div className="flex bg-white/[0.03] border border-white/[0.08] rounded-xl overflow-hidden focus-within:border-red-500/20 transition-colors p-1">
                    <input
                        type="number"
                        step="any"
                        placeholder="Amount in STRK (e.g. 1.5)"
                        className="w-full bg-transparent px-4 py-3 text-sm text-white/90 placeholder:text-white/30 focus:outline-none focus:ring-0 appearance-none font-mono"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                    />
                    <button
                        className="px-4 py-2 text-xs text-white/90 bg-white/10 hover:bg-white/20 transition-colors rounded-lg font-medium disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider border border-white/5 whitespace-nowrap"
                        onClick={handleWithdraw}
                        disabled={!withdrawAmount || parsedWithdrawAmount === 0n || !address || isWithdrawing}
                    >
                        {isWithdrawing ? "..." : "Withdraw"}
                    </button>
                </div>
            </div>
        </div>
    );
};
