import Link from "next/link";

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen bg-gray-950 text-white">
			<div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-stretch gap-0 px-4 py-10 lg:grid-cols-2 lg:gap-10 lg:px-10">
				{/* Left panel */}
				<div className="relative hidden overflow-hidden rounded-3xl border border-gray-800 bg-linear-to-br from-indigo-600/15 via-gray-900 to-emerald-500/10 p-10 lg:flex lg:flex-col">
					<div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.35),transparent_55%),radial-gradient(circle_at_80%_70%,rgba(16,185,129,0.25),transparent_55%)]" />
					<div className="relative">
						<div className="inline-flex items-center gap-2 rounded-full border border-gray-700/60 bg-gray-900/40 px-3 py-1 text-xs text-gray-200">
							<span className="h-2 w-2 rounded-full bg-emerald-400" />
							<span>Play. Create. Repeat.</span>
						</div>

						<h1 className="mt-6 text-4xl font-black tracking-tight">
							Kahoot Clone
						</h1>
						<p className="mt-3 max-w-md text-sm leading-relaxed text-gray-200/80">
							Create quizzes, host live sessions, and track results with a fast,
							minimal dashboard.
						</p>

						<ul className="mt-8 space-y-3 text-sm text-gray-100/80">
							<li className="flex items-start gap-3">
								<span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-indigo-300" />
								<span>Build quizzes in minutes with a clean editor.</span>
							</li>
							<li className="flex items-start gap-3">
								<span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-emerald-300" />
								<span>Host lobbies and play in real time.</span>
							</li>
							<li className="flex items-start gap-3">
								<span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-indigo-300" />
								<span>Review history and performance at a glance.</span>
							</li>
						</ul>
					</div>

					<div className="relative mt-auto pt-10 text-xs text-gray-300/70">
						<span>Tip: Use a strong password and keep it unique.</span>
					</div>
				</div>

				{/* Right panel */}
				<div className="flex items-center justify-center">
					<div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
						<div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-6 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.7)] backdrop-blur sm:p-8">
							{children}
						</div>
						<p className="mt-6 text-center text-xs text-gray-500">
							By continuing you agree to our{" "}
							<Link
								href="#"
								className="text-gray-400 underline decoration-gray-700 underline-offset-4 hover:text-gray-200">
								terms
							</Link>{" "}
							and{" "}
							<Link
								href="#"
								className="text-gray-400 underline decoration-gray-700 underline-offset-4 hover:text-gray-200">
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

