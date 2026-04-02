import Link from "next/link";
import { apiServer } from "@/lib/apiServer";
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

export default async function LandingPage() {
	const user = await getCurrentUser();
	if (user) {
		redirect(user.role === "ADMIN" ? "/admin/dashboard" : "/library/quizzes");
	}

	const initial = await fetchPublicQuizzes();

	return (
		<div className="min-h-[calc(100vh-58px)] flex flex-col">
			<section className="px-4 pt-10 pb-12">
				<div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
					<div className="space-y-5">
						<h1 className="text-4xl md:text-5xl font-black tracking-tight">
							Play live quizzes.
							<br />
							Create your own.
						</h1>
						<p className="text-gray-300 max-w-prose">
							Join with a PIN to play, or sign in to create, save, and host quizzes.
						</p>
						<div className="flex flex-wrap gap-3">
							<Link
								href="/game/join"
								className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold transition-colors"
							>
								Join a game
							</Link>
							<Link
								href="/discover"
								className="px-5 py-2.5 rounded-xl border border-gray-700 bg-gray-900/20 hover:bg-gray-800/60 font-semibold transition-colors"
							>
								Explore public content
							</Link>
						</div>
						<p className="text-xs text-gray-500">
							No account required to play or explore.
						</p>
					</div>

					<div className="rounded-2xl border border-gray-800 bg-gray-950/40 p-6 overflow-hidden">
						<div className="relative rounded-xl border border-gray-800 bg-linear-to-br from-indigo-600/20 via-gray-950/10 to-emerald-500/10 p-6 min-h-[260px] flex flex-col justify-between">
							<div className="space-y-2">
								<p className="text-xs font-semibold tracking-wide text-indigo-200/90">
									HOST • PLAY • LEARN
								</p>
								<h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
									Make learning feel like a game.
								</h2>
								<p className="text-sm text-gray-300 max-w-prose">
									Create quizzes in minutes, host live sessions, and share public quizzes
									with a link.
								</p>
							</div>
							<div className="pt-6 flex items-center gap-3">
								<Link
									href="/discover"
									className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold transition-colors"
								>
									Browse popular quizzes
								</Link>
								<Link
									href="/auth/login"
									className="px-5 py-2.5 rounded-xl border border-gray-700 bg-gray-900/20 hover:bg-gray-800/60 font-semibold transition-colors"
								>
									Sign in
								</Link>
							</div>
							<div className="absolute -right-10 -bottom-10 w-56 h-56 rounded-full bg-indigo-500/10 blur-2xl" />
							<div className="absolute -left-10 -top-10 w-56 h-56 rounded-full bg-emerald-500/10 blur-2xl" />
						</div>
					</div>
				</div>
			</section>

			<section className="px-4 pb-14">
				<div className="max-w-6xl mx-auto">
					<div className="flex items-end justify-between gap-4">
						<div>
							<h2 className="text-xl font-semibold text-white">Popular quizzes</h2>
							<p className="text-sm text-gray-400 mt-1">
								Try these public quizzes, or load more.
							</p>
						</div>
						<Link
							href="/discover"
							className="text-sm text-gray-300 hover:text-white transition-colors"
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

