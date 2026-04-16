import Link from "next/link";
import type { Metadata } from "next";
import { AppLogo } from "@/components/layout/app-logo";
import { SITE_DESCRIPTION } from "@/lib/site";

export const metadata: Metadata = {
	title: "Account",
	description: SITE_DESCRIPTION,
	robots: { index: true, follow: true },
};

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-dvh bg-(--app-bg) text-(--app-fg)">
			<div className="grid min-h-dvh grid-cols-1 items-stretch gap-0 lg:grid-cols-2 lg:gap-0 lg:divide-x lg:divide-(--app-border)">
				{/* Left panel */}
				<div className="relative hidden p-10 lg:flex lg:flex-col lg:bg-(--app-surface-muted)">
					<div className="relative">
						<div className="inline-flex items-center gap-2 rounded-full border border-(--app-border) bg-(--app-surface) px-3 py-1 text-xs text-(--app-fg-muted)">
							<span className="h-2 w-2 rounded-full bg-indigo-500" />
							<span>Play. Create. Repeat.</span>
						</div>

						<h1 className="mt-6 text-4xl font-black tracking-tight">
							<AppLogo />
						</h1>
						<p className="mt-3 max-w-md text-sm leading-relaxed text-(--app-fg-muted)">
							Create quizzes, host live sessions, and track results with a fast,
							minimal dashboard.
						</p>

						<ul className="mt-8 space-y-3 text-sm text-(--app-fg-muted)">
							<li className="flex items-start gap-3">
								<span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-indigo-300" />
								<span>Build quizzes in minutes with a clean editor.</span>
							</li>
							<li className="flex items-start gap-3">
								<span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-indigo-400" />
								<span>Host lobbies and play in real time.</span>
							</li>
							<li className="flex items-start gap-3">
								<span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-indigo-300" />
								<span>Review reports and performance at a glance.</span>
							</li>
						</ul>
					</div>

					<div className="relative mt-auto pt-10 text-xs text-(--app-fg-muted)">
						<span>Tip: Use a strong password and keep it unique.</span>
					</div>
				</div>

				{/* Right panel */}
				<div className="flex items-center justify-center p-6 sm:p-10 lg:bg-(--app-surface-muted)">
					<div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
						{children}
						<p className="mt-6 text-center text-xs text-(--app-fg-muted)/70">
							By continuing you agree to our{" "}
							<Link
								href="#"
								className="text-(--app-fg-muted) underline decoration-(--app-border) underline-offset-4 hover:text-(--app-fg)">
								terms
							</Link>{" "}
							and{" "}
							<Link
								href="#"
								className="text-(--app-fg-muted) underline decoration-(--app-border) underline-offset-4 hover:text-(--app-fg)">
								privacy policy
							</Link>
							.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

