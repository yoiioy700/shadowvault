"use client";

import { useState } from "react";
import { useAccount } from "@starknet-react/core";
import { useScaffoldReadContract } from "~~/hooks/scaffold-stark/useScaffoldReadContract";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-stark/useScaffoldWriteContract";
import { AddressInput } from "~~/components/scaffold-stark/Input/AddressInput";
import { Address } from "~~/components/scaffold-stark/Address";

export const AgentPanel = () => {
    const { address } = useAccount();
    const [newAgent, setNewAgent] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const { data: currentAgent, isLoading: isAgentLoading } = useScaffoldReadContract({
        contractName: "ShadowVault",
        functionName: "get_agent",
        args: address ? [address as string] : ([] as any),
    });

    const { sendAsync: setAgentAsync } = useScaffoldWriteContract({
        contractName: "ShadowVault",
        functionName: "set_agent",
        args: [newAgent],
    });

    const handleSetAgent = async () => {
        if (!newAgent) return;
        setIsSaving(true);
        try {
            await setAgentAsync();
            setNewAgent("");
        } catch (e) {
            console.error("Error setting agent:", e);
        } finally {
            setIsSaving(false);
        }
    };

    const agentAddr = currentAgent?.toString() ?? "0x0";
    const hasAgent =
        agentAddr !== "0x0" &&
        agentAddr !== "0" &&
        agentAddr !== "0x0000000000000000000000000000000000000000000000000000000000000000";

    return (
        <div className="bg-[#0a0a0c] p-6 sm:p-8 rounded-2xl border border-white/[0.08] shadow-2xl relative overflow-hidden flex flex-col">
            {/* Accent glow */}
            <div className="absolute bottom-0 left-0 w-[250px] h-[200px] bg-purple-500/[0.04] blur-[80px] rounded-full pointer-events-none" />

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                    <h2 className="text-xl font-medium text-white tracking-tight">AI Agent</h2>
                    <p className="text-xs text-white/30 mt-1">Authorize an agent to execute on your behalf</p>
                </div>
                <div
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${hasAgent ? "border-purple-500/20 bg-purple-500/5" : "border-white/[0.06] bg-white/[0.02]"}`}
                >
                    <span
                        className={`w-2 h-2 rounded-full ${hasAgent ? "bg-purple-400 animate-pulse shadow-[0_0_8px_rgba(192,132,252,0.6)]" : "bg-white/20"}`}
                    ></span>
                    <span className="text-xs font-medium text-white/70 tracking-wide uppercase">
                        {hasAgent ? "Active" : "None"}
                    </span>
                </div>
            </div>

            {/* Current Agent Info */}
            <div className="mb-8 relative z-10">
                <span className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-3 block">
                    Current Agent
                </span>
                {isAgentLoading ? (
                    <div className="w-48 h-6 bg-white/5 animate-pulse rounded-lg" />
                ) : hasAgent ? (
                    <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-white/[0.06] flex items-center justify-center">
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="text-purple-300"
                            >
                                <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1.07A7 7 0 0 1 14 23h-4a7 7 0 0 1-6.93-6H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 12 2z" />
                            </svg>
                        </div>
                        <Address address={agentAddr as `0x${string}`} size="sm" />
                    </div>
                ) : (
                    <div className="p-4 rounded-xl border border-dashed border-white/[0.06] bg-white/[0.01] text-center">
                        <p className="text-sm text-white/25 font-light">No agent authorized</p>
                    </div>
                )}
            </div>

            {/* Feature Description */}
            <div className="mb-8 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] relative z-10">
                <div className="flex items-start gap-3">
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="text-indigo-400 mt-0.5 shrink-0"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4M12 8h.01" />
                    </svg>
                    <p className="text-xs text-white/40 leading-relaxed">
                        When an authorized AI agent executes a transaction via{" "}
                        <code className="text-indigo-400/80 bg-indigo-500/10 px-1.5 py-0.5 rounded text-[10px] font-mono">
                            agent_execute()
                        </code>
                        , it automatically records a heartbeat, keeping your vault alive.
                    </p>
                </div>
            </div>

            {/* Set Agent Form */}
            <div className="mt-auto relative z-10">
                <h3 className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-4">
                    {hasAgent ? "Update Agent" : "Set Agent"}
                </h3>
                <div className="flex flex-col gap-3">
                    <div className="w-full grayscale brightness-75 contrast-125 opacity-80 hover:opacity-100 transition-opacity">
                        <AddressInput
                            value={newAgent}
                            onChange={(val) => setNewAgent(val)}
                            placeholder="Agent wallet address (0x...)"
                        />
                    </div>
                    <button
                        className="w-full px-6 py-3.5 text-xs text-black bg-white hover:bg-white/90 transition-colors rounded-xl font-bold disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider"
                        onClick={handleSetAgent}
                        disabled={!newAgent || !address || isSaving}
                    >
                        {isSaving ? "Setting..." : hasAgent ? "Update Agent" : "Authorize Agent"}
                    </button>
                </div>
            </div>
        </div>
    );
};
