"use client";

import { User } from "@/features/auth/types";
import Link from "next/link";

import { Plus, Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCreateQuiz } from "@/features/quizzes/hooks/use-quiz-mutations";
import { LogoutButton } from "@/features/auth/components/logout-button";

const getInitials = (email: string) => {
	return email[0]?.toUpperCase() || "?";
};

export default function TopBar({ user }: { user: User }) {
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
				toast.error("Something wrong happened.");
			}
		}
	};

	return (
		<div className="flex items-center px-4 py-3 border-b border-gray-700 bg-gray-800 text-white">
			{/* Logo */}
			<Link href="/dashboard" className="text-3xl mr-24 font-semibold">
				Kahoot!
			</Link>

			{/* Right side content */}
			<div className="ml-auto flex items-center gap-4">
				{/* Create Button */}
				<button
					onClick={handleCreateQuiz}
					disabled={isPending}
					className="flex items-center justify-center gap-2 font-semibold text-white bg-indigo-800 hover:bg-indigo-900 disabled:opacity-70 disabled:cursor-not-allowed transition-colors rounded-md px-5 py-2">
					{isPending ? (
						<>
							<Loader2 className="w-5 h-5 animate-spin" />
							<span>Creating...</span>
						</>
					) : (
						<>
							<Plus className="w-5 h-5" />
							<span>Create</span>
						</>
					)}
				</button>

				{/* Avatar */}
				<div
					className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center font-bold"
					title={user.email}>
					{getInitials(user.email)}
				</div>

				<LogoutButton className="cursor-pointer">
					<LogOut />
				</LogoutButton>
			</div>
		</div>
	);
}
