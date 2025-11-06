"use client";

import { User } from "@/lib/types/user";
import Link from "next/link";
import { Plus } from "lucide-react";
import { createQuiz } from "@/actions/quiz";

const getInitials = (email: string) => {
	return email[0]?.toUpperCase() || "?";
};

export default function TopBar({ user }: { user: User }) {
	return (
		<div className="flex items-center px-4 py-3 border-b border-gray-700 bg-gray-800 text-white">
			{/* Logo */}
			<Link href="/dashboard" className="text-3xl mr-24 font-semibold">
				Kahoot!
			</Link>

			{/* Right side content */}
			<div className="ml-auto flex items-center gap-4">
				{/* Create Button (using server action) */}
				<form action={createQuiz}>
					<button
						type="submit"
						className="flex items-center justify-center gap-2 font-semibold text-white bg-indigo-800 hover:bg-indigo-900 transition-colors rounded-md px-5 py-2">
						<Plus className="w-5 h-5" />
						<span>Create</span>
					</button>
				</form>

				{/* Avatar */}
				<div
					className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center font-bold"
					title={user.email} // Show email on hover
				>
					{getInitials(user.email)}
				</div>
			</div>
		</div>
	);
}
