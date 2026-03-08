"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface FAQItem {
    q: string;
    a: string;
}

const FAQ_ITEMS: FAQItem[] = [
    {
        q: "Do I need to deposit all my crypto?",
        a: "V1 requires depositing STRK into the vault contract. The contract is non-custodial — no admin key exists, not even the deployer can access your funds. You can withdraw anytime as long as your heartbeat is active. V2 will support approval-based model so assets stay in your wallet.",
    },
    {
        q: "What happens if I forget to submit my heartbeat?",
        a: "If you miss your heartbeat interval, anyone can trigger the distribution function. Assets are automatically sent to your beneficiaries based on the percentages you set. This is irreversible — choose your interval wisely. We recommend 30 days minimum.",
    },
    {
        q: "Are my beneficiaries private?",
        a: "Beneficiary addresses and amounts are stored on-chain. Full Tongo encryption integration is on the V2 roadmap. For V1, we recommend using fresh wallet addresses for beneficiaries to maintain privacy.",
    },
    {
        q: "Is this audited?",
        a: "ShadowVault is an open-source hackathon project deployed on Starknet Sepolia testnet. It has not been formally audited. Do not deposit significant funds on mainnet without a professional audit.",
    },
    {
        q: "What is a ZK heartbeat?",
        a: "In V1, heartbeat is a simple on-chain transaction proving you control the wallet. V2 will use Garaga ZK proofs so you can prove you're alive without revealing your identity or wallet address.",
    },
    {
        q: "Can the AI agent trigger my heartbeat automatically?",
        a: "Yes. When an authorized AI agent executes a transaction on your behalf via agent_execute(), it automatically records a heartbeat. This means your vault stays active as long as your agent is running.",
    },
];

// ─── COMPONENTS ────────────────────────────────────────────────────────────────

function Nav() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 left-0 right-0 h-20 flex items-center justify-between px-6 sm:px-12 z-50 transition-all duration-500 ${scrolled ? "bg-[#050507]/60 backdrop-blur-2xl border-b border-white/[0.05]" : "bg-transparent"}`}>
            <span className="font-sans text-lg text-white tracking-tight font-semibold flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                    <div className="w-2.5 h-2.5 bg-black rounded-sm" />
                </div>
                ShadowVault
            </span>
            <div className="hidden md:flex gap-8 items-center bg-white/[0.03] px-6 py-2 rounded-full border border-white/[0.05]">
                {["Features", "How It Works", "FAQ", "Contract"].map((item) => (
                    <a
                        key={item}
                        href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                        className="font-sans text-sm text-white/60 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all duration-300 font-medium"
                    >
                        {item}
                    </a>
                ))}
            </div>
            <Link
                href="/app"
                className="hidden sm:inline-block font-sans text-sm text-white bg-white/10 border border-white/20 px-5 py-2.5 rounded-full font-medium hover:bg-white hover:text-black transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            >
                Launch App
            </Link>
        </nav>
    );
}

function Hero() {
    return (
        <section className="relative flex min-h-screen flex-col items-center justify-center pt-32 pb-20 px-4 sm:px-6 lg:px-8 text-center overflow-hidden bg-[#020202]">
            {/* Soft Top Glow typical of Framer templates */}
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-white/[0.04] blur-[150px] rounded-full pointer-events-none z-0" />

            {/* Background Image (Subtle) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-40 mix-blend-screen scale-110 translate-y-24">
                <Image
                    src="/hero-vault.png"
                    alt="Obsidian Vault"
                    width={1000}
                    height={1000}
                    priority
                    className="w-full max-w-5xl object-contain drop-shadow-[0_0_50px_rgba(255,255,255,0.05)] grayscale-[80%] contrast-125"
                />
            </div>

            <div className="z-10 w-full max-w-4xl mx-auto flex flex-col items-center mt-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8 shadow-[0_0_30px_rgba(255,255,255,0.03)] hover:border-white/20 transition-colors cursor-pointer">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]"></span>
                    <span className="text-xs font-semibold text-white/90 tracking-wide uppercase">Live on Starknet Sepolia</span>
                </div>

                <h1 className="mb-6 text-6xl sm:text-7xl lg:text-[100px] font-medium tracking-tighter text-white font-sans leading-[0.95] drop-shadow-2xl">
                    Where your crypto <br className="hidden sm:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
                        lives forever.
                    </span>
                </h1>

                <p className="mx-auto mb-10 max-w-2xl text-lg sm:text-xl text-white/60 font-sans font-light leading-relaxed">
                    The first autonomous, privacy-preserving inheritance protocol. Trustless execution. Zero intermediaries. Absolute mathematical certainty.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4 justify-center items-center">
                    <Link href="/app" className="w-full sm:w-auto px-8 py-4 font-sans text-sm text-black bg-white hover:scale-105 transition-transform duration-300 rounded-full font-semibold shadow-[0_0_40px_rgba(255,255,255,0.3)] text-center">
                        Secure Your Vault
                    </Link>
                    <a href="https://github.com/yoiioy700/shadowvault" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto px-8 py-4 font-sans text-sm text-white bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all duration-300 rounded-full font-medium backdrop-blur-md text-center">
                        Read the Docs
                    </a>
                </div>
            </div>

            {/* Bottom Gradient Overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#020202] to-transparent z-0 pointer-events-none" />
        </section>
    );
}

function Logos() {
    return (
        <section className="py-12 bg-[#020202] border-y border-white/[0.05] relative z-20">
            <div className="max-w-6xl mx-auto px-6 flex flex-col items-center">
                <p className="text-[10px] font-sans font-bold tracking-[0.3em] text-white/30 uppercase mb-8 text-center">Powered by cutting-edge L2 technology</p>
                <div className="flex flex-wrap justify-center items-center gap-12 sm:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
                    <div className="text-2xl font-black tracking-tighter text-white">STARKNET</div>
                    <div className="text-2xl font-bold tracking-tight text-white">StarkWare</div>
                    <div className="text-xl font-bold font-mono text-white">OpenZeppelin</div>
                    <div className="text-2xl font-semibold italic tracking-wider text-white">Xverse</div>
                </div>
            </div>
        </section>
    );
}

function BentoFeatures() {
    return (
        <section id="features" className="py-40 bg-[#020202] px-6 sm:px-12 lg:px-24 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-1/2 right-[-10%] w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none z-0 mix-blend-screen" />

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="mb-20 text-center max-w-3xl mx-auto">
                    <h2 className="text-4xl lg:text-5xl font-medium text-white tracking-tight mb-6 drop-shadow-lg">Designed for absolute certainty.</h2>
                    <p className="text-lg text-white/60 font-light leading-relaxed">
                        Say goodbye to fragile legal contracts and centralized custodians. ShadowVault enforces your will via immutable math on Starknet.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Big Card */}
                    <div className="col-span-1 md:col-span-2 bg-[#0a0a0c] border border-white/[0.08] rounded-[2rem] p-10 sm:p-12 hover:border-indigo-500/30 transition-all duration-500 relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-[-50%] right-[-20%] w-[500px] h-[500px] bg-indigo-500/10 blur-[100px] rounded-full group-hover:bg-indigo-500/20 transition-all duration-700 pointer-events-none" />
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div className="mb-12">
                                <div className="w-14 h-14 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center mb-8 shadow-inner group-hover:bg-indigo-500/10 transition-colors">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-indigo-300"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                                </div>
                                <h3 className="text-3xl font-medium text-white mb-4 tracking-tight">Non-Custodial Architecture</h3>
                                <p className="font-sans text-white/50 leading-relaxed text-lg max-w-md">Your keys, your crypto. The vault operates autonomously. We cannot freeze, access, or alter deposits under any circumstances.</p>
                            </div>
                            <div className="text-7xl font-bold tracking-tighter text-white/10 mt-auto group-hover:text-indigo-500/20 transition-colors duration-500">100%</div>
                        </div>
                    </div>

                    {/* Small Card 1 */}
                    <div className="col-span-1 bg-[#0a0a0c] border border-white/[0.08] rounded-[2rem] p-10 hover:border-emerald-500/30 transition-all duration-500 flex flex-col justify-between group overflow-hidden relative shadow-2xl">
                        <div className="absolute bottom-[-30%] left-[-20%] w-[300px] h-[300px] bg-emerald-500/10 blur-[80px] rounded-full group-hover:bg-emerald-500/20 transition-all duration-700 pointer-events-none" />
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center mb-8 shadow-inner group-hover:bg-emerald-500/10 transition-colors">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-300"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                            </div>
                            <h3 className="text-2xl font-medium text-white mb-3 tracking-tight">ZK Heartbeats</h3>
                            <p className="font-sans text-white/50 leading-relaxed text-base">Ping the contract periodically to prove you are alive. Miss the deadline, and distribution initiates.</p>
                        </div>
                    </div>

                    {/* Small Card 2 */}
                    <div className="col-span-1 bg-[#0a0a0c] border border-white/[0.08] rounded-[2rem] p-10 hover:border-purple-500/30 transition-all duration-500 flex flex-col justify-between group overflow-hidden relative shadow-2xl">
                        <div className="absolute top-[-30%] right-[-20%] w-[300px] h-[300px] bg-purple-500/10 blur-[80px] rounded-full group-hover:bg-purple-500/20 transition-all duration-700 pointer-events-none" />
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center mb-8 shadow-inner group-hover:bg-purple-500/10 transition-colors">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-purple-300"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                            </div>
                            <h3 className="text-2xl font-medium text-white mb-3 tracking-tight">AI Agent Integration</h3>
                            <p className="font-sans text-white/50 leading-relaxed text-base">Let your authorized AI agent automatically submit heartbeats during routine executions.</p>
                        </div>
                    </div>

                    {/* Medium Card */}
                    <div className="col-span-1 md:col-span-2 bg-[#0a0a0c] border border-white/[0.08] rounded-[2rem] p-0 overflow-hidden relative flex flex-col md:flex-row items-center group shadow-2xl hover:border-blue-500/30 transition-all duration-500">
                        <div className="p-10 md:p-14 md:w-1/2 flex flex-col justify-center relative z-10">
                            <h3 className="text-3xl font-medium text-white mb-4 tracking-tight">Automated Distribution</h3>
                            <p className="font-sans text-white/50 leading-relaxed text-lg">Configure beneficiaries with precise Basis Points (BPS). The smart contract guarantees execution.</p>
                        </div>
                        {/* Terminal Mockup on the right */}
                        <div className="md:w-1/2 h-full min-h-[300px] w-full border-t md:border-t-0 md:border-l border-white/[0.08] bg-[#050507] p-8 flex items-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none mix-blend-overlay"></div>
                            <div className="w-full relative z-10">
                                <div className="flex gap-2 mb-6">
                                    <div className="w-3 h-3 rounded-full bg-white/10"></div>
                                    <div className="w-3 h-3 rounded-full bg-white/10"></div>
                                    <div className="w-3 h-3 rounded-full bg-white/10"></div>
                                </div>
                                <div className="font-mono text-sm leading-8 text-white/40">
                                    <span className="text-indigo-400">~</span> shadowvault status <br />
                                    <span className="text-white/70">vault_id:</span> <span className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">0x04a2...f9c1</span> <br />
                                    <span className="text-white/70">status:</span> <span className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">ACTIVE</span> <br />
                                    <span className="text-white/70">last_heartbeat:</span> 2 days ago <br />
                                    <span className="text-white/70">next_deadline:</span> 28d 14h 32m <br />
                                    <span className="text-indigo-400 animate-pulse">█</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}

function HowItWorks() {
    const steps = [
        { num: "01", title: "Deposit", desc: "Fund your bespoke smart contract on Starknet." },
        { num: "02", title: "Configure", desc: "Set your interval and allocate BPS to beneficiaries." },
        { num: "03", title: "Live", desc: "Keep the vault alive via heartbeats or AI agents." },
    ];

    return (
        <section id="how-it-works" className="py-40 bg-[#020202] border-y border-white/[0.05] px-6 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[200px] bg-white/[0.02] blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                <h2 className="text-4xl md:text-5xl font-medium text-white tracking-tight text-center mb-28 drop-shadow-md">Three steps to eternity.</h2>
                <div className="flex flex-col md:flex-row gap-8 relative">
                    {/* Connecting line for desktop */}
                    <div className="hidden md:block absolute top-[34px] left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />

                    {steps.map((step, i) => (
                        <div key={i} className="flex-1 relative z-10 flex flex-col items-center text-center group">
                            <div className="w-16 h-16 rounded-2xl bg-[#0a0a0c] border border-white/10 flex items-center justify-center text-white/80 font-mono text-lg mb-8 shadow-xl group-hover:border-indigo-400/50 group-hover:text-indigo-300 group-hover:-translate-y-2 transition-all duration-500 relative">
                                <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <span className="relative z-10">{step.num}</span>
                            </div>
                            <h3 className="text-2xl font-medium text-white mb-3 tracking-tight">{step.title}</h3>
                            <p className="text-white/50 text-base leading-relaxed max-w-xs">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function FAQAccordion() {
    const [open, setOpen] = useState<number | null>(null);

    return (
        <section id="faq" className="py-40 bg-[#020202] px-6 relative overflow-hidden">
            {/* Mild blur backdrop to ease text contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/[0.02] to-transparent pointer-events-none" />

            <div className="max-w-3xl mx-auto relative z-10">
                <h2 className="text-4xl md:text-5xl font-medium text-white tracking-tight text-center mb-24 drop-shadow-md">Common Questions</h2>

                <div className="flex flex-col gap-0 border-t border-white/[0.08]">
                    {FAQ_ITEMS.map((item, i) => (
                        <div key={i} className="border-b border-white/[0.08]">
                            <button
                                onClick={() => setOpen(open === i ? null : i)}
                                className="w-full py-8 flex justify-between items-center text-left group"
                            >
                                <span className="font-sans text-xl text-white/80 font-medium tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/60 transition-all duration-300">
                                    {item.q}
                                </span>
                                <span className={`transform transition-transform duration-500 text-white/30 group-hover:text-indigo-400 ${open === i ? 'rotate-45 text-indigo-400' : ''}`}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
                                </span>
                            </button>
                            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${open === i ? 'max-h-96 pb-8 opacity-100' : 'max-h-0 opacity-0'}`}>
                                <p className="font-sans text-white/50 leading-relaxed pr-12 text-base">
                                    {item.a}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function CTA() {
    return (
        <section className="py-40 bg-[#020202] border-t border-white/[0.05] px-6 text-center relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />

            <div className="max-w-3xl mx-auto relative z-10 flex flex-col items-center">
                <h2 className="text-6xl lg:text-[80px] font-medium text-white tracking-tighter mb-10 leading-[1.05] drop-shadow-2xl">
                    Start passing on <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">your legacy.</span>
                </h2>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/app" className="px-10 py-5 text-black bg-white hover:scale-105 transition-transform duration-300 rounded-full font-semibold text-base shadow-[0_0_40px_rgba(255,255,255,0.2)] text-center">
                        Create Vault — It&apos;s Free
                    </Link>
                </div>
            </div>
        </section>
    );
}

function Footer() {
    return (
        <footer className="bg-[#020202] w-full border-t border-white/[0.05] pt-24 pb-12 px-6 sm:px-12 lg:px-24">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start mb-24 gap-16">
                <div className="flex flex-col gap-6 max-w-sm">
                    <span className="font-sans text-xl text-white tracking-tight font-semibold flex items-center gap-3">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
                            <div className="w-2.5 h-2.5 bg-black rounded-sm" />
                        </div>
                        ShadowVault
                    </span>
                    <p className="font-sans text-white/40 text-base leading-relaxed">
                        The definitive decentralized inheritance protocol. Protect your digital assets against the unexpected.
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 md:gap-24">
                    <div className="flex flex-col gap-5">
                        <h4 className="text-white font-medium mb-1">Product</h4>
                        <Link href="/app" className="text-white/40 hover:text-white transition-colors text-sm font-medium">App</Link>
                        <a href="https://github.com/yoiioy700/shadowvault" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors text-sm font-medium">Documentation</a>
                        <a href="https://sepolia.starkscan.co/contract/0x25ba5a7e97e079e1fb7e580e63701fe00ae9ef4e2686e2f4cac0600b1993e34" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors text-sm font-medium">Smart Contract</a>
                    </div>
                    <div className="flex flex-col gap-5">
                        <h4 className="text-white font-medium mb-1">Legal</h4>
                        <a href="#" className="text-white/40 hover:text-white transition-colors text-sm font-medium">Privacy Policy</a>
                        <a href="#" className="text-white/40 hover:text-white transition-colors text-sm font-medium">Terms of Service</a>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-white/[0.05] text-white/30 text-sm font-medium">
                <span>© 2026 ShadowVault. Open source.</span>
                <span className="mt-4 sm:mt-0 flex gap-6">
                    <a href="https://github.com/yoiioy700/shadowvault" className="hover:text-white transition-colors">GitHub</a>
                    <a href="#" className="hover:text-white transition-colors">Twitter</a>
                </span>
            </div>
        </footer>
    );
}

// ─── PAGE ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
    return (
        <div className="w-full min-h-screen bg-[#020202] overflow-x-hidden selection:bg-indigo-500/30 selection:text-white relative font-sans">
            <Nav />
            <Hero />
            <Logos />
            <BentoFeatures />
            <HowItWorks />
            <FAQAccordion />
            <CTA />
            <Footer />
        </div>
    );
}
