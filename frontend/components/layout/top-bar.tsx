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
import { AppButton, appButtonClassName } from "@/components/ui/app-button";
import { IconButton } from "@/components/ui/icon-button";

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
		<div className="h-[58px] flex items-center gap-4 px-4 border-b border-(--app-border) bg-(--app-surface) text-(--app-fg) shrink-0 sticky top-0 z-50">
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
								className="hidden sm:inline-flex items-center rounded-full border border-amber-500/35 bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-800 tabular-nums"
								title="VIP active"
							>
								VIP
							</span>
						) : (
							<Link
								href="/settings/subscription"
								className="hidden sm:inline-flex text-xs font-semibold text-amber-700 hover:text-amber-900 px-2 py-1 rounded-md hover:bg-amber-500/10 transition-colors whitespace-nowrap"
							>
								Upgrade
							</Link>
						)}

						<IconButton
							type="button"
							onClick={() => setMobileSearchOpen(true)}
							className="md:hidden h-10 w-10"
							aria-label="Search"
						>
							<Search className="w-4 h-4" aria-hidden />
						</IconButton>

						<AppButton
							type="button"
							onClick={handleCreateQuiz}
							disabled={creating || isPending}
							variant="primary"
							className="hidden sm:flex px-4 py-2"
						>
							{creating || isPending ? (
								<Loader2 className="w-4 h-4 animate-spin" aria-hidden />
							) : (
								<Plus className="w-4 h-4" aria-hidden />
							)}
							{creating || isPending ? "Creating…" : "Create"}
						</AppButton>

						<AppButton
							type="button"
							onClick={handleCreateQuiz}
							disabled={creating || isPending}
							variant="primary"
							className="sm:hidden h-10 w-10 p-0"
							aria-label={creating || isPending ? "Creating quiz" : "Create quiz"}
						>
							{creating || isPending ? (
								<Loader2 className="w-4 h-4 animate-spin" aria-hidden />
							) : (
								<Plus className="w-4 h-4" aria-hidden />
							)}
						</AppButton>
					</>
				) : (
					<Link
						href="/auth/login"
						className={appButtonClassName("secondary", "px-4 py-2 no-underline")}
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
