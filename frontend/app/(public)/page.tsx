import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { apiServer } from "@/lib/apiServer";
import { SITE_DESCRIPTION } from "@/lib/site";
import { Footer } from "@/components/layout/footer";
import { PublicQuizFeed } from "@/features/public/components/public-quiz-feed";
import { getCurrentUser } from "@/features/auth/api/server-actions";
import { redirect } from "next/navigation";

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
	const user = await getCurrentUser();
	if (user) {
		redirect(user.role === "ADMIN" ? "/admin/dashboard" : "/library/quizzes");
	}

	const initial = await fetchPublicQuizzes();

	return (
		<div className="min-h-[calc(100vh-58px)] flex flex-col">
			<section className="px-4 pt-12 pb-16 border-b border-gray-800/80">
				<div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-14 items-center">
					<div className="space-y-6 order-2 lg:order-1">
						<p className="text-xs font-semibold tracking-widest text-indigo-400 uppercase">
							For hosts
						</p>
						<h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-black tracking-tight text-white leading-[1.08]">
							Become the host everyone remembers.
						</h1>
						<p className="text-gray-300 text-lg max-w-prose leading-relaxed">
							Sign up free, build quizzes in minutes, and run live games with a PIN. Your
							players join from their phones; you control the pace from the host screen.
							Need bigger decks and extra question types?{" "}
							<Link
								href="/auth/login?returnTo=/settings/subscription"
								className="text-indigo-400 hover:underline font-medium"
							>
								VIP
							</Link>{" "}
							has you covered.
						</p>
						<div className="flex flex-wrap items-center gap-4">
							<Link
								href="/auth/register"
								className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold transition-colors shadow-lg shadow-indigo-600/20"
							>
								Start hosting — it&apos;s free
							</Link>
							<Link
								href="/discover"
								className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
							>
								Browse public quizzes →
							</Link>
						</div>
						<p className="text-sm text-gray-500">
							Already hosting elsewhere?{" "}
							<Link href="/auth/login" className="text-indigo-400 hover:underline">
								Log in
							</Link>
							.
						</p>
					</div>

					<div className="order-1 lg:order-2">
						<div className="relative rounded-2xl border border-gray-800 bg-gray-950/50 p-3 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
							<Image
								src="/marketing/hero-placeholder.svg"
								alt="Product preview: host dashboard and live quiz session (replace with 1200×675 PNG in public/marketing/hero.png)"
								width={1200}
								height={675}
								className="w-full h-auto rounded-xl border border-gray-800/80"
								priority
								unoptimized
							/>
							<p className="mt-3 text-[11px] text-gray-600 text-center px-2">
								Placeholder · Capture at ~1440px wide, export 1200×675 (2×: 2400×1350) to{" "}
								<code className="text-gray-500">public/marketing/hero.png</code>
							</p>
						</div>
					</div>
				</div>
			</section>

			<section className="px-4 py-20 space-y-24 max-w-6xl mx-auto w-full">
				<div className="text-center max-w-2xl mx-auto">
					<h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
						Everything you need to run a session
					</h2>
					<p className="text-gray-400 mt-3 text-sm md:text-base">
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
								<div className="rounded-2xl border border-gray-800 bg-gray-950/40 p-2">
									<Image
										src={block.src}
										alt={block.alt}
										width={800}
										height={500}
										className="w-full h-auto rounded-xl border border-gray-800/80"
										unoptimized
									/>
								</div>
								<p className="mt-2 text-[11px] text-gray-600 text-center">
									Replace with 800×500 PNG → same basename in{" "}
									<code className="text-gray-500">public/marketing/</code>
								</p>
							</div>
							<div className={`space-y-4 ${reverse ? "lg:order-1" : ""}`}>
								<h3 className="text-xl md:text-2xl font-bold text-white">{block.title}</h3>
								<p className="text-gray-400 leading-relaxed">{block.body}</p>
							</div>
						</div>
					);
				})}
			</section>

			<section className="px-4 pb-20 border-t border-gray-800/80">
				<div className="max-w-6xl mx-auto pt-16">
					<div className="text-center max-w-2xl mx-auto mb-10">
						<p className="text-xs font-semibold tracking-wide text-amber-400/90 uppercase">
							VIP
						</p>
						<h2 className="text-2xl md:text-3xl font-black text-white mt-2">
							Go beyond free limits
						</h2>
						<p className="text-gray-400 text-sm mt-2">
							More questions per quiz, short answer and numeric range types, and higher
							document storage. Cancel recurring plans anytime from the billing portal.
						</p>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
						{[
							{ title: "1 month", desc: "Flexible monthly billing" },
							{ title: "3 months", desc: "Save with a quarter" },
							{ title: "1 year", desc: "Best for regular hosts" },
							{ title: "Lifetime", desc: "Pay once, VIP forever" },
						].map((card) => (
							<div
								key={card.title}
								className="rounded-2xl border border-gray-800 bg-gray-950/50 p-5 flex flex-col gap-2"
							>
								<p className="text-lg font-bold text-white">{card.title}</p>
								<p className="text-sm text-gray-500 flex-1">{card.desc}</p>
							</div>
						))}
					</div>
					<div className="flex flex-wrap justify-center gap-3 mt-10">
						<Link
							href="/auth/register?returnTo=/settings/subscription"
							className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold transition-colors"
						>
							Sign up to subscribe
						</Link>
						<Link
							href="/auth/login?returnTo=/settings/subscription"
							className="px-6 py-3 rounded-xl border border-gray-600 bg-gray-900/30 hover:bg-gray-800/60 font-semibold transition-colors"
						>
							Log in for VIP
						</Link>
					</div>
				</div>
			</section>

			<section className="px-4 pb-16">
				<div className="max-w-6xl mx-auto">
					<div className="flex items-end justify-between gap-4">
						<div>
							<h2 className="text-xl font-semibold text-white">Popular quizzes</h2>
							<p className="text-sm text-gray-400 mt-1">
								Try what the community is playing — no account required to preview.
							</p>
						</div>
						<Link
							href="/discover"
							className="text-sm text-gray-300 hover:text-white transition-colors shrink-0"
						>
							Explore all
						</Link>
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
