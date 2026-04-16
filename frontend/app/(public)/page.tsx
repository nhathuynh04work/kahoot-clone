import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { apiServer } from "@/lib/apiServer";
import { SITE_DESCRIPTION } from "@/lib/site";
import { Footer } from "@/components/layout/footer";
import { PublicQuizFeed } from "@/features/public/components/public-quiz-feed";
import { LandingTopBar } from "@/components/layout/landing-top-bar";
import { CheckCircle2, FileText, Sparkles, ListChecks, Crown } from "lucide-react";

async function fetchPublicQuizzes() {
	const api = await apiServer();
	const { data } = await api.get("/public/quizzes?mode=recent&page=1&pageSize=12");
	return data as {
		items: any[];
		page: number;
		pageSize: number;
		totalItems: number;
		totalPages: number;
	};
}

const featureBlocks = [
	{
		title: "Host live games",
		body: "Players join with a PIN. You control the flow from the host screen while everyone answers in real time.",
		src: "/marketing/feature-host-placeholder.svg",
		alt: "Host lobby and live game controls (placeholder)",
	},
	{
		title: "Build quizzes fast",
		body: "Multiple choice, true/false, and more. VIP unlocks short answer and numeric range for deeper checks.",
		src: "/marketing/feature-editor-placeholder.svg",
		alt: "Quiz editor with questions and answers (placeholder)",
	},
	{
		title: "Library & files",
		body: "Keep quizzes and documents organized. VIP raises caps so larger decks and uploads stay manageable.",
		src: "/marketing/feature-files-placeholder.svg",
		alt: "File library and document storage (placeholder)",
	},
	{
		title: "Session reports",
		body: "Review how each question landed, who joined, and how the session performed — without digging through spreadsheets.",
		src: "/marketing/feature-reports-placeholder.svg",
		alt: "Session report and per-question stats (placeholder)",
	},
] as const;

export const metadata: Metadata = {
	title: "Live quizzes & hosting",
	description: SITE_DESCRIPTION,
};

export default async function LandingPage() {
	const initial = await fetchPublicQuizzes();

	return (
		<div className="min-h-dvh flex flex-col">
			<LandingTopBar />
			<section className="px-4 pt-16 md:pt-20 pb-20 md:pb-24 border-b border-(--app-border)">
				<div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-14 items-center">
					<div className="space-y-6 order-2 lg:order-1">
						<p className="text-xs font-semibold tracking-widest text-indigo-400 uppercase">
							For hosts
						</p>
						<h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-black tracking-tight text-(--app-fg) leading-[1.08]">
							Become the host everyone remembers.
						</h1>
						<p className="text-(--app-fg-muted) text-lg max-w-prose leading-relaxed">
							Build a quiz in minutes. Host live games with a PIN. Players join from their
							phones while you run the show.
						</p>
						<p className="text-(--app-fg-muted) text-sm max-w-prose leading-relaxed">
							Want bigger decks and extra question types?{" "}
							<Link
								href="/auth/login?returnTo=/settings/subscription"
								className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
							>
								VIP
							</Link>{" "}
							has you covered.
						</p>
						<div className="flex flex-wrap items-center gap-4">
							<Link
								href="/auth/register"
								className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors shadow-lg shadow-indigo-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-(--app-bg)"
							>
								Start hosting — it&apos;s free
							</Link>
							<Link
								href="/#discover"
								className="text-sm font-medium text-(--app-fg-muted) hover:text-(--app-fg) transition-colors"
							>
								Browse public quizzes
							</Link>
						</div>
						<p className="text-sm text-(--app-fg-muted)/70">
							Already hosting elsewhere?{" "}
							<Link href="/auth/login" className="text-indigo-600 dark:text-indigo-400 hover:underline">
								Log in
							</Link>
							.
						</p>
					</div>

					<div className="order-1 lg:order-2">
						<div className="relative rounded-2xl border border-(--app-border) bg-(--app-surface) p-4 md:p-5 shadow-[0_0_0_1px_rgba(15,23,42,0.06)]">
							<Image
								src="/marketing/hero-placeholder.svg"
								alt="Product preview: host dashboard and live quiz session (replace with 1200×675 PNG in public/marketing/hero.png)"
								width={1200}
								height={675}
								className="w-full h-auto rounded-xl border border-(--app-border)"
								priority
								unoptimized
							/>
							<div className="mt-4" />
						</div>
					</div>
				</div>
			</section>

			<section className="px-4 py-20 space-y-24 max-w-6xl mx-auto w-full">
				<div className="text-center max-w-2xl mx-auto">
					<h2 className="text-2xl md:text-3xl font-black text-(--app-fg) tracking-tight">
						Everything you need to run a session
					</h2>
					<p className="text-(--app-fg-muted) mt-3 text-sm md:text-base">
						From the first question to the final scoreboard — built for classrooms, teams, and
						friends.
					</p>
				</div>

				{featureBlocks.map((block, i) => {
					const reverse = i % 2 === 1;
					return (
						<div
							key={block.title}
							className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center"
						>
							<div className={reverse ? "lg:order-2" : ""}>
								<div className="rounded-2xl border border-(--app-border) bg-(--app-surface-muted) p-2">
									<Image
										src={block.src}
										alt={block.alt}
										width={800}
										height={500}
										className="w-full h-auto rounded-xl border border-(--app-border)"
										unoptimized
									/>
								</div>
								<p className="mt-2 text-[11px] text-(--app-fg-muted)/70 text-center">
									Replace with 800×500 PNG → same basename in{" "}
									<code className="text-(--app-fg-muted)/70">public/marketing/</code>
								</p>
							</div>
							<div className={`space-y-4 ${reverse ? "lg:order-1" : ""}`}>
								<h3 className="text-xl md:text-2xl font-bold text-(--app-fg)">{block.title}</h3>
								<p className="text-(--app-fg-muted) leading-relaxed">{block.body}</p>
							</div>
						</div>
					);
				})}
			</section>

			<section className="px-4 pb-20 border-t border-(--app-border)">
				<div className="max-w-6xl mx-auto pt-16">
					<div className="text-center max-w-2xl mx-auto mb-10">
						<p className="text-xs font-semibold tracking-wide text-amber-400/90 uppercase">
							VIP
						</p>
						<h2 className="text-2xl md:text-3xl font-black text-(--app-fg) mt-2">
							Go beyond free limits
						</h2>
						<p className="text-(--app-fg-muted) text-sm mt-2">
							See pricing upfront. Unlock bigger quizzes, advanced question types, and higher
							document caps.
						</p>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						<div className="rounded-2xl border border-(--app-border) bg-(--app-surface) p-6">
							<div className="flex items-start justify-between gap-4">
								<div className="min-w-0">
									<p className="text-sm font-semibold text-(--app-fg)">Free</p>
									<p className="text-xs text-(--app-fg-muted)/70 mt-1">
										Perfect for casual games and smaller quizzes.
									</p>
								</div>
								<span className="inline-flex items-center rounded-full border border-(--app-border) bg-(--app-surface-muted) px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-(--app-fg-muted)">
									Always available
								</span>
							</div>

							<ul className="mt-5 space-y-3 text-sm text-(--app-fg-muted)">
								<li className="flex items-start gap-3">
									<CheckCircle2 className="w-5 h-5 text-(--app-fg-muted) mt-0.5 shrink-0" aria-hidden />
									<span>
										<span className="font-semibold text-(--app-fg)">Up to 20 questions</span> per quiz
									</span>
								</li>
								<li className="flex items-start gap-3">
									<CheckCircle2 className="w-5 h-5 text-(--app-fg-muted) mt-0.5 shrink-0" aria-hidden />
									<span>
										<span className="font-semibold text-(--app-fg)">Basic question types</span>{" "}
										(multiple choice + true/false)
									</span>
								</li>
								<li className="flex items-start gap-3">
									<CheckCircle2 className="w-5 h-5 text-(--app-fg-muted) mt-0.5 shrink-0" aria-hidden />
									<span>
										<span className="font-semibold text-(--app-fg)">10 documents</span> and{" "}
										<span className="font-semibold text-(--app-fg)">50 MB</span> total storage
									</span>
								</li>
							</ul>
						</div>

						<div className="rounded-2xl border border-amber-500/40 bg-amber-500/5 p-6 shadow-[0_0_0_1px_rgba(245,158,11,0.10)]">
							<div className="flex items-start justify-between gap-4">
								<div className="min-w-0">
									<p className="text-sm font-semibold text-(--app-fg) inline-flex items-center gap-2">
										VIP
										<span className="inline-flex items-center rounded-full border border-amber-500/25 bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-200">
											Subscription
										</span>
									</p>
									<p className="text-xs text-(--app-fg-muted)/70 mt-1">
										Bigger limits for serious hosting and larger content.
									</p>
								</div>
								<div className="hidden sm:flex items-center justify-center shrink-0">
									<div className="relative w-12 h-12 rounded-xl border border-(--app-border) bg-(--app-surface) flex items-center justify-center">
										<Crown className="w-6 h-6 text-indigo-300/90" aria-hidden />
									</div>
								</div>
							</div>

							<div className="mt-5">
								<p className="text-3xl font-black tracking-tight text-(--app-fg) tabular-nums">
									$10
									<span className="text-sm font-semibold text-(--app-fg-muted) ml-2">
										every 3 months
									</span>
								</p>
								<p className="text-xs text-(--app-fg-muted)/70 mt-1">$3.33/mo</p>
							</div>

							<ul className="mt-5 space-y-3 text-sm text-(--app-fg-muted)">
								<li className="flex items-start gap-3">
									<CheckCircle2 className="w-5 h-5 text-indigo-300 mt-0.5 shrink-0" aria-hidden />
									<span>
										<span className="font-semibold text-(--app-fg)">Up to 200 questions</span> per quiz
									</span>
								</li>
								<li className="flex items-start gap-3">
									<ListChecks className="w-5 h-5 text-indigo-300 mt-0.5 shrink-0" aria-hidden />
									<span>
										<span className="font-semibold text-(--app-fg)">Advanced question types</span>{" "}
										(short answer + number input)
									</span>
								</li>
								<li className="flex items-start gap-3">
									<FileText className="w-5 h-5 text-indigo-300 mt-0.5 shrink-0" aria-hidden />
									<span>
										<span className="font-semibold text-(--app-fg)">100 documents</span> and{" "}
										<span className="font-semibold text-(--app-fg)">500 MB</span> total storage
									</span>
								</li>
								<li className="flex items-start gap-3">
									<Sparkles className="w-5 h-5 text-indigo-300 mt-0.5 shrink-0" aria-hidden />
									<span>
										<span className="font-semibold text-(--app-fg)">VIP AI generation</span> can include advanced formats
									</span>
								</li>
							</ul>

							<div className="mt-6 flex flex-wrap gap-3">
								<Link
									href="/auth/register?returnTo=/settings/subscription"
									className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold transition-colors"
								>
									Sign up to subscribe
								</Link>
								<Link
									href="/auth/login?returnTo=/settings/subscription"
									className="px-6 py-3 rounded-xl border border-(--app-border) bg-(--app-surface) hover:bg-(--app-surface-muted) font-semibold transition-colors"
								>
									Log in for VIP
								</Link>
							</div>

							<p className="text-[11px] text-(--app-fg-muted)/70 mt-4">
								Recurring subscription can be canceled anytime.
							</p>
						</div>
					</div>
				</div>
			</section>

			<section className="px-4 pb-16" id="discover">
				<div className="max-w-6xl mx-auto">
					<div className="flex items-end justify-between gap-4">
						<div>
							<h2 className="text-xl font-semibold text-(--app-fg)">Popular quizzes</h2>
							<p className="text-sm text-(--app-fg-muted) mt-1">
								Try what the community is playing — no account required to preview.
							</p>
						</div>
					</div>

					<div className="mt-6">
						<PublicQuizFeed initial={initial as any} />
					</div>
				</div>
			</section>

			<div className="mt-auto">
				<Footer />
			</div>
		</div>
	);
}
