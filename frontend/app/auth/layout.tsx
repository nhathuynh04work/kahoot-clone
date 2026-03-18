import Link from "next/link";

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen bg-gray-950 text-white">
			<div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-stretch gap-0 px-4 py-10 lg:grid-cols-2 lg:gap-0 lg:px-0 lg:divide-x lg:divide-gray-800/70">
				{/* Left panel */}
				<div className="relative hidden p-10 lg:flex lg:flex-col lg:bg-gray-800/30">
					<div className="relative">
						<div className="inline-flex items-center gap-2 rounded-full border border-gray-800 bg-gray-950/40 px-3 py-1 text-xs text-gray-200">
							<span className="h-2 w-2 rounded-full bg-emerald-400" />
							<span>Play. Create. Repeat.</span>
						</div>

						<h1 className="mt-6 text-4xl font-black tracking-tight">
							quiztopia!
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
				<div className="flex items-center justify-center p-10 lg:bg-gray-900/20">
					<div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
						{children}
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

