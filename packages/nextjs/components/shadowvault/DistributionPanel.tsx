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

    return (
        <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
                <h2 className="card-title text-2xl">Distribution</h2>

                <div className="grid grid-cols-2 gap-4 my-4">
                    <div className="stat bg-base-100 rounded-xl p-4">
                        <div className="stat-title">Vault Status</div>
                        <div className={`stat-value text-lg ${isDeadBool ? "text-error" : "text-success"}`}>
                            {isDeadBool ? "Dead (Ready)" : "Active"}
                        </div>
                    </div>

                    <div className="stat bg-base-100 rounded-xl p-4">
                        <div className="stat-title">Distribution</div>
                        <div className={`stat-value text-lg ${hasBeenDistributed ? "text-success" : "text-warning"}`}>
                            {hasBeenDistributed ? "Completed" : "Pending"}
                        </div>
                    </div>

                    <div className="stat bg-base-100 rounded-xl p-4">
                        <div className="stat-title">Beneficiaries</div>
                        <div className="stat-value text-lg">{beneficiaryCountNum}</div>
                    </div>

                    <div className="stat bg-base-100 rounded-xl p-4">
                        <div className="stat-title">Remaining Balance</div>
                        <div className="stat-value text-lg">{balanceNum}</div>
                    </div>
                </div>

                {canDistribute && (
                    <div className="card-actions justify-end mt-4">
                        <button
                            className={`btn btn-error btn-lg ${isDistributing ? "loading" : ""}`}
                            onClick={handleDistribute}
                            disabled={isDistributing}
                        >
                            {isDistributing ? "Distributing..." : "Trigger Distribution"}
                        </button>
                    </div>
                )}

                {hasBeenDistributed && (
                    <div className="alert alert-success mt-4">
                        <span>Distribution has been completed. All funds have been sent to beneficiaries.</span>
                    </div>
                )}

                {!isDeadBool && (
                    <div className="alert alert-info mt-4">
                        <span>
                            Distribution can only be triggered when the vault owner is marked as dead (heartbeat
                            expired).
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};
