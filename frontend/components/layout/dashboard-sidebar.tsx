"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, FileText, History, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCreateQuiz } from "@/features/quizzes/hooks/use-quiz-mutations";

const navItems = [
	{ href: "/dashboard", label: "Quizzes", icon: LayoutGrid },
	{ href: "/dashboard/files", label: "Files", icon: FileText },
	{ href: "/dashboard/history", label: "History", icon: History },
] as const;

export function DashboardSidebar() {
	const pathname = usePathname();
	const router = useRouter();
	const { mutateAsync: createQuiz, isPending } = useCreateQuiz();

	const handleCreateQuiz = async () => {
		try {
			const quiz = await createQuiz();
			toast.success("Quiz created successfully.");
			router.push(`/quiz/${quiz.id}/edit`);
		} catch (error) {
			if (error instanceof Error) {
				toast.error(error.message);
			} else {
				toast.error("Something went wrong.");
			}
		}
	};

	return (
		<aside className="w-56 shrink-0 border-r border-gray-700 bg-gray-800/50 flex flex-col">
			<nav className="p-3 flex flex-col gap-1" aria-label="Main navigation">
				{navItems.map(({ href, label, icon: Icon }) => {
					const isActive =
						href === "/dashboard"
							? pathname === "/dashboard"
							: pathname.startsWith(href);
					return (
						<Link
							key={href}
							href={href}
							className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
								isActive
									? "bg-gray-700 text-white"
									: "text-gray-400 hover:text-white hover:bg-gray-700/70"
							}`}
						>
							<Icon className="w-5 h-5 shrink-0" aria-hidden />
							{label}
						</Link>
					);
				})}
			</nav>

			<div className="mt-auto p-3 border-t border-gray-700">
				<button
					onClick={handleCreateQuiz}
					disabled={isPending}
					className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
				>
					{isPending ? (
						<Loader2 className="w-4 h-4 animate-spin" aria-hidden />
					) : (
						<Plus className="w-4 h-4" aria-hidden />
					)}
					{isPending ? "Creating…" : "Create quiz"}
				</button>
			</div>
		</aside>
	);
}
