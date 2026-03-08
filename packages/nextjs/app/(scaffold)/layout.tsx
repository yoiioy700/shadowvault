import type { Metadata } from "next";
import { ScaffoldStarkAppWithProviders } from "~~/components/ScaffoldStarkAppWithProviders";
import "~~/styles/globals.css";
import { ThemeProvider } from "~~/components/ThemeProvider";

// Scaffold layout — wraps all pages under (scaffold) route group
export const metadata: Metadata = {
    title: "ShadowVault App",
    description: "Decentralized Dead Man's Switch on Starknet",
};

export default function ScaffoldLayout({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider enableSystem>
            <ScaffoldStarkAppWithProviders>{children}</ScaffoldStarkAppWithProviders>
        </ThemeProvider>
    );
}
