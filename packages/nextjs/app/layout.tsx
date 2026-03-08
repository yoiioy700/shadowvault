import type { Metadata } from "next";
import "~~/styles/globals.css";

export const metadata: Metadata = {
  title: "ShadowVault — Secure Your Digital Legacy",
  description: "The first autonomous, privacy-preserving Dead Man's Switch on Starknet.",
  icons: "/logo.ico",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
};

export default RootLayout;

