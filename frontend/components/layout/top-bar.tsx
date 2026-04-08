"use client";

import type { User } from "@/features/auth/types";
import Link from "next/link";
import { useState } from "react";

import { LogIn, Plus, Loader2, Search } from "lucide-react";
import { AppLogo } from "@/components/layout/app-logo";
import { GlobalSearch, MobileSearchDialog } from "@/features/search/components/global-search";
import { useCreateQuiz } from "@/features/quizzes/hooks/use-quiz-mutations";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function TopBar({ user }: { user?: User | null }) {
	const router = useRouter();
	const { mutateAsync: createQuiz, isPending } = useCreateQuiz();
	const [creating, setCreating] = useState(false);
	const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

	const handleCreateQuiz = async () => {
		if (creating || isPending) return;
		setCreating(true);
		try {
			const quiz = await createQuiz();
			toast.success("Quiz created successfully.");
			router.push(`/quiz/${quiz.id}/edit`);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Something went wrong.");
		} finally {
			setCreating(false);
		}
	};

	return (
		<div className="h-[58px] flex items-center gap-4 px-4 border-b border-gray-700 bg-gray-800 text-white shrink-0 sticky top-0 z-50">
			<Link
				href={user ? "/library/quizzes" : "/"}
				className="text-xl font-extrabold shrink-0 tracking-tight"
			>
				<AppLogo />
			</Link>

			{/* Search — centered */}
			<div className="hidden md:flex flex-1 min-w-0 justify-center">
				<GlobalSearch isAuthed={!!user} />
			</div>

			{/* Right: VIP / upgrade + CTA */}
			<div className="ml-auto flex items-center gap-2 shrink-0">
				{user ? (
					<>
						{user.vip?.isVip ? (
							<span
								className="hidden sm:inline-flex items-center rounded-full border border-amber-500/35 bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-200 tabular-nums"
								title="VIP active"
							>
								VIP
							</span>
						) : (
							<Link
								href="/settings/subscription"
								className="hidden sm:inline-flex text-xs font-semibold text-amber-400 hover:text-amber-300 px-2 py-1 rounded-md hover:bg-amber-500/10 transition-colors whitespace-nowrap"
							>
								Upgrade
							</Link>
						)}

						<button
							type="button"
							onClick={() => setMobileSearchOpen(true)}
							className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-lg border border-gray-700 bg-gray-900/20 hover:bg-gray-900/40 transition-colors"
							aria-label="Search"
						>
							<Search className="w-4 h-4" aria-hidden />
						</button>

						<button
							type="button"
							onClick={handleCreateQuiz}
							disabled={creating || isPending}
							className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors shadow-lg shadow-indigo-600/10"
						>
							{creating || isPending ? (
								<Loader2 className="w-4 h-4 animate-spin" aria-hidden />
							) : (
								<Plus className="w-4 h-4" aria-hidden />
							)}
							{creating || isPending ? "Creating…" : "Create"}
						</button>

						<button
							type="button"
							onClick={handleCreateQuiz}
							disabled={creating || isPending}
							className="sm:hidden inline-flex items-center justify-center h-10 w-10 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed text-white transition-colors shadow-lg shadow-indigo-600/10"
							aria-label={creating || isPending ? "Creating quiz" : "Create quiz"}
						>
							{creating || isPending ? (
								<Loader2 className="w-4 h-4 animate-spin" aria-hidden />
							) : (
								<Plus className="w-4 h-4" aria-hidden />
							)}
						</button>
					</>
				) : (
					<Link
						href="/auth/login"
						className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-600 bg-gray-900/20 hover:bg-gray-900/40 text-white font-semibold text-sm transition-colors"
					>
						<LogIn className="w-4 h-4" aria-hidden />
						Login
					</Link>
				)}
			</div>

			{user ? (
				<MobileSearchDialog
					isAuthed={!!user}
					open={mobileSearchOpen}
					onOpenChange={setMobileSearchOpen}
				/>
			) : null}
		</div>
	);
}
