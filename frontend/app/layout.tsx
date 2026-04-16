import type { Metadata } from "next";
import { Montserrat, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import { rootMetadata } from "@/lib/site";
import Script from "next/script";
import { ThemedToaster } from "@/components/theme/themed-toaster";

const montserrat = Montserrat({
	variable: "--font-sans",
	subsets: ["latin"],
	weight: ["300", "400", "700", "900"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = rootMetadata();

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<Script id="theme-init" strategy="beforeInteractive">{`(() => {
  try {
    const stored = localStorage.getItem("app-theme");
    const pref = stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
    const sysDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const resolved = pref === "system" ? (sysDark ? "dark" : "light") : pref;
    document.documentElement.dataset.theme = resolved;
  } catch {}
})();`}</Script>
			</head>
			<body
				className={`${montserrat.variable} ${geistMono.variable} antialiased`}>
				<Providers>
					{children}
					<ThemedToaster />
				</Providers>
			</body>
		</html>
	);
}
