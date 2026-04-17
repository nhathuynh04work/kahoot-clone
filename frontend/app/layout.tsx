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
    const resolved = "light";
    document.documentElement.dataset.theme = resolved;
    document.documentElement.classList.remove("dark");
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
