"use client";

import { useState } from "react";
import { useAccount } from "~~/hooks/useAccount";
import { useScaffoldReadContract } from "~~/hooks/scaffold-stark/useScaffoldReadContract";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-stark/useScaffoldWriteContract";

const formatDuration = (seconds: number): string => {
    if (seconds <= 0) return "—";
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
};

const formatTimeAgo = (timestamp: bigint | undefined): string => {
    if (!timestamp || timestamp === BigInt(0)) return "Never";
    const now = Math.floor(Date.now() / 1000);
    const ts = Number(timestamp);
    const diff = now - ts;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};

const formatDate = (timestamp: bigint | undefined): string => {
    if (!timestamp || timestamp === BigInt(0)) return "Never";
    return new Date(Number(timestamp) * 1000).toLocaleString();
};

const PRESET_INTERVALS = [
    { label: "7 days", value: 604800 },
    { label: "30 days", value: 2592000 },
    { label: "90 days", value: 7776000 },
];

const safeBigInt = (val: string): bigint | null => {
    try {
        const n = BigInt(val);
        return n > 0n ? n : null;
    } catch {
        return null;
    }
};

export const HeartbeatPanel = () => {
    const { address } = useAccount();
    const [newInterval, setNewInterval] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const { data: lastHeartbeat } = useScaffoldReadContract({
        contractName: "ShadowVault",
        functionName: "get_last_heartbeat",
        args: address ? [address as string] : [] as any,
    });

    const { data: interval } = useScaffoldReadContract({
        contractName: "ShadowVault",
        functionName: "get_heartbeat_interval",
        args: address ? [address as string] : [] as any,
    });

    const { data: isDead } = useScaffoldReadContract({
        contractName: "ShadowVault",
        functionName: "is_dead",
        args: address ? [address as string] : [] as any,
    });

    const parsedInterval = safeBigInt(newInterval);

    const { sendAsync: heartbeatAsync } = useScaffoldWriteContract({
        contractName: "ShadowVault",
        functionName: "heartbeat",
        args: [],
    });

    const { sendAsync: setIntervalAsync } = useScaffoldWriteContract({
        contractName: "ShadowVault",
        functionName: "set_heartbeat_interval",
        args: [parsedInterval ?? BigInt(0)],
    });

    const handleHeartbeat = async () => {
        setIsSending(true);
        try {
            await heartbeatAsync();
            showToast("Heartbeat sent successfully", "success");
        } catch (e: any) {
            console.error("Error sending heartbeat:", e);
            showToast(e?.message?.slice(0, 80) || "Heartbeat failed", "error");
        } finally {
            setIsSending(false);
        }
    };

    const handleSetInterval = async () => {
        if (!parsedInterval) {
            showToast("Enter a valid positive number for interval", "error");
            return;
        }
        setIsUpdating(true);
        try {
            await setIntervalAsync();
            setNewInterval("");
            showToast(`Interval updated to ${formatDuration(Number(parsedInterval))}`, "success");
        } catch (e: any) {
            console.error("Error setting interval:", e);
            showToast(e?.message?.slice(0, 80) || "Failed to update interval", "error");
        } finally {
            setIsUpdating(false);
        }
    };

    const lastHb = lastHeartbeat ? BigInt(lastHeartbeat.toString()) : undefined;
    const intervalSec = interval ? Number(interval.toString()) : 0;
    const isDeadBool = isDead ? Boolean(isDead) : false;

    // Calculate time remaining
    let timeRemaining = "";
    if (lastHb && lastHb > 0n && intervalSec > 0) {
        const deadline = Number(lastHb) + intervalSec;
        const now = Math.floor(Date.now() / 1000);
        const remaining = deadline - now;
        timeRemaining = remaining > 0 ? formatDuration(remaining) : "Expired";
    }

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

            {/* Subtle Top Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[100px] bg-white/[0.03] blur-[50px] rounded-full pointer-events-none z-0" />

            <div className="z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h2 className="text-xl font-medium text-white tracking-tight mb-1">Dead Man&apos;s Switch</h2>
                        <p className="text-sm text-white/40">Keep your vault active by sending a heartbeat.</p>
                    </div>

                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${isDeadBool ? "border-red-500/20 bg-red-500/5" : "border-white/10 bg-white/5"} backdrop-blur-md`}>
                        <span className={`w-2 h-2 rounded-full ${isDeadBool ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]'}`}></span>
                        <span className="text-xs font-medium text-white/90 tracking-wide uppercase">
                            {isDeadBool ? 'Dead' : 'Active'}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.02]">
                        <p className="text-xs text-white/40 mb-2 uppercase tracking-wider font-semibold">Last Heartbeat</p>
                        <p className="font-mono text-sm text-white/80" title={formatDate(lastHb)}>
                            {formatTimeAgo(lastHb)}
                        </p>
                    </div>
                    <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.02]">
                        <p className="text-xs text-white/40 mb-2 uppercase tracking-wider font-semibold">Interval</p>
                        <p className="font-mono text-sm text-white/80">
                            {intervalSec > 0 ? formatDuration(intervalSec) : "Not set"}
                        </p>
                    </div>
                </div>

                {/* Time Remaining */}
                {timeRemaining && (
                    <div className={`p-4 rounded-xl border mb-8 ${timeRemaining === "Expired" ? "border-red-500/20 bg-red-500/5" : "border-white/[0.04] bg-white/[0.02]"}`}>
                        <p className="text-xs text-white/40 mb-1 uppercase tracking-wider font-semibold">Time Until Deadline</p>
                        <p className={`font-mono text-lg font-semibold tracking-tight ${timeRemaining === "Expired" ? "text-red-400" : "text-white"}`}>
                            {timeRemaining}
                        </p>
                    </div>
                )}

                <div className="mt-auto flex flex-col gap-6">
                    <button
                        className="w-full px-6 py-4 font-sans text-sm text-black bg-white hover:scale-[1.02] transition-transform duration-300 rounded-xl font-semibold shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed"
                        onClick={handleHeartbeat}
                        disabled={!address || isSending}
                    >
                        {isSending ? "Sending..." : "Send Heartbeat"}
                    </button>

                    <div className="flex flex-col gap-3">
                        {/* Preset Buttons */}
                        <div className="flex gap-2">
                            {PRESET_INTERVALS.map(({ label, value }) => (
                                <button
                                    key={value}
                                    className={`flex-1 px-2 py-2 text-[11px] rounded-lg font-medium transition-all border ${newInterval === value.toString()
                                        ? "bg-white/10 text-white border-white/20"
                                        : "bg-white/[0.02] text-white/40 border-white/[0.06] hover:bg-white/5 hover:text-white/60"
                                        }`}
                                    onClick={() => setNewInterval(value.toString())}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        <div className="flex bg-white/[0.03] border border-white/[0.08] rounded-xl overflow-hidden focus-within:border-white/20 transition-colors p-1">
                            <input
                                type="number"
                                placeholder="Custom interval (seconds)"
                                className="w-full bg-transparent px-4 py-3 text-sm text-white/90 placeholder:text-white/30 focus:outline-none focus:ring-0 appearance-none font-mono"
                                value={newInterval}
                                onChange={(e) => setNewInterval(e.target.value)}
                            />
                            <button
                                className="px-4 py-2 text-xs text-white/90 bg-white/10 hover:bg-white/20 transition-colors rounded-lg font-medium disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider whitespace-nowrap"
                                onClick={handleSetInterval}
                                disabled={!parsedInterval || !address || isUpdating}
                            >
                                {isUpdating ? "..." : "Set"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
