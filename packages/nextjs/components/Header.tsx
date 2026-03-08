"use client";

import React, { useCallback, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bars3Icon, BugAntIcon } from "@heroicons/react/24/outline";
import { useOutsideClick } from "~~/hooks/scaffold-stark";
import { CustomConnectButton } from "~~/components/scaffold-stark/CustomConnectButton";
import { useTheme } from "next-themes";
import { useTargetNetwork } from "~~/hooks/scaffold-stark/useTargetNetwork";
import { devnet } from "@starknet-react/chains";
import { useAccount, useNetwork, useProvider } from "@starknet-react/core";

export const menuLinks = [
    {
        label: "Dashboard",
        href: "/app",
    },
    {
        label: "Landing",
        href: "/landing",
    },
    {
        label: "Debug",
        href: "/debug",
        icon: <BugAntIcon className="h-4 w-4" />,
    },
];

export const HeaderMenuLinks = () => {
    const pathname = usePathname();

    return (
        <>
            {menuLinks.map(({ label, href, icon }) => {
                const isActive = pathname === href;
                return (
                    <li key={href}>
                        <Link
                            href={href}
                            passHref
                            className={`${
                                isActive ? "bg-white/10 text-white" : "text-white/60"
                            } py-2 px-4 text-sm rounded-full gap-2 flex items-center hover:bg-white/5 hover:text-white transition-colors font-medium`}
                        >
                            {icon}
                            <span>{label}</span>
                        </Link>
                    </li>
                );
            })}
        </>
    );
};

/**
 * Site header
 */
export const Header = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const burgerMenuRef = useRef<HTMLDivElement>(null);

    useOutsideClick(
        burgerMenuRef,
        useCallback(() => setIsDrawerOpen(false), []),
    );

    const { targetNetwork } = useTargetNetwork();
    const { provider } = useProvider();
    const { address, status, chainId } = useAccount();
    const { chain } = useNetwork();
    const [isDeployed, setIsDeployed] = useState(true);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (
            status === "connected" &&
            address &&
            chainId === targetNetwork.id &&
            chain?.network === targetNetwork.network
        ) {
            provider
                .getClassHashAt(address)
                .then((classHash) => {
                    if (classHash) setIsDeployed(true);
                    else setIsDeployed(false);
                })
                .catch((e) => {
                    console.error("contract check", e);
                    if (e.toString().includes("Contract not found")) setIsDeployed(false);
                });
        }
    }, [status, address, provider, chainId, targetNetwork.id, targetNetwork.network, chain?.network]);

    return (
        <div
            className={`sticky top-0 z-50 transition-all duration-500 min-h-20 flex items-center justify-between px-6 sm:px-8 border-b ${scrolled ? "bg-[#050507]/80 backdrop-blur-xl border-white/[0.05]" : "bg-[#020202] border-transparent"}`}
        >
            <div className="flex items-center gap-6">
                <div className="lg:hidden" ref={burgerMenuRef}>
                    <button
                        className="text-white/80 p-2 hover:bg-white/5 rounded-lg transition-colors"
                        onClick={() => setIsDrawerOpen((prev) => !prev)}
                    >
                        <Bars3Icon className="h-6 w-6" />
                    </button>
                    {isDrawerOpen && (
                        <ul
                            className="absolute top-20 left-4 bg-[#0a0a0c] border border-white/10 p-4 shadow-2xl rounded-2xl w-56 flex flex-col gap-2 z-50"
                            onClick={() => setIsDrawerOpen(false)}
                        >
                            <HeaderMenuLinks />
                        </ul>
                    )}
                </div>

                <Link href="/" passHref className="flex items-center gap-3 shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                        <div className="w-3.5 h-3.5 bg-black rounded-sm" />
                    </div>
                    <span className="font-sans text-xl text-white tracking-tight font-semibold hidden sm:block">
                        ShadowVault
                    </span>
                </Link>

                <ul className="hidden lg:flex items-center gap-2 ml-4">
                    <HeaderMenuLinks />
                </ul>
            </div>

            <div className="flex items-center gap-4">
                {status === "connected" && !isDeployed ? (
                    <span className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3 py-1.5 rounded-full font-medium hidden sm:inline-block">
                        Wallet Not Deployed
                    </span>
                ) : null}
                <CustomConnectButton />
            </div>
        </div>
    );
};
