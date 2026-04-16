import Link from "next/link";
import { AppLogo } from "@/components/layout/app-logo";

export function Footer() {
	const year = new Date().getFullYear();
	return (
		<footer className="border-t border-(--app-border) bg-(--app-surface-muted) text-(--app-fg)">
			<div className="max-w-6xl mx-auto px-4 py-12">
				<div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
					<div className="max-w-sm">
						<Link
							href="/"
							className="inline-flex text-xl font-extrabold tracking-tight text-(--app-fg) hover:opacity-90 transition-opacity"
						>
							<AppLogo />
						</Link>
						<p className="mt-4 text-sm text-(--app-fg-muted) leading-relaxed">
							Create quizzes, host live sessions with a PIN, and review results —
							for classrooms, teams, and friends.
						</p>
					</div>
					<div className="flex flex-wrap gap-12 sm:gap-16 text-sm">
						<div>
							<p className="text-xs font-semibold uppercase tracking-wide text-(--app-fg-muted) mb-3">
								Product
							</p>
							<ul className="space-y-2.5 text-(--app-fg-muted)">
								<li>
									<Link href="/#discover" className="hover:text-(--app-fg) transition-colors">
										Discover
									</Link>
								</li>
								<li>
									<Link href="/game/join" className="hover:text-(--app-fg) transition-colors">
										Join a game
									</Link>
								</li>
							</ul>
						</div>
						<div>
							<p className="text-xs font-semibold uppercase tracking-wide text-(--app-fg-muted) mb-3">
								Account
							</p>
							<ul className="space-y-2.5 text-(--app-fg-muted)">
								<li>
									<Link href="/auth/register" className="hover:text-(--app-fg) transition-colors">
										Sign up
									</Link>
								</li>
								<li>
									<Link href="/auth/login" className="hover:text-(--app-fg) transition-colors">
										Log in
									</Link>
								</li>
								<li>
									<Link
										href="/auth/login?returnTo=/settings/subscription"
										className="hover:text-(--app-fg) transition-colors"
									>
										VIP billing
									</Link>
								</li>
							</ul>
						</div>
					</div>
				</div>
				<div className="mt-12 pt-8 border-t border-(--app-border) flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-(--app-fg-muted)/80">
					<p>© {year} Quiztopia</p>
					<p className="text-(--app-fg-muted)/80">Built for live learning and play.</p>
				</div>
			</div>
		</footer>
	);
}
