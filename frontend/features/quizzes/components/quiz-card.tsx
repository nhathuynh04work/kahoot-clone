"use client";

import Link from "next/link";
import Image from "next/image"; // 1. Import Next.js Image
import { Image as ImageIcon, Play } from "lucide-react"; // 2. Rename Lucide icon
import { QuizWithQuestions } from "../types";
import { useCreateLobby } from "../hooks/use-create-lobby";

interface QuizCardProps {
	quiz: QuizWithQuestions;
}

export function QuizCard({ quiz }: QuizCardProps) {
	const editHref = `/quiz/${quiz.id}/edit`;
	const { mutate: createLobby, isPending } = useCreateLobby(quiz.id);

	return (
		<div className="block bg-gray-800 rounded-lg shadow-md transition-shadow duration-200 border border-gray-700 group overflow-hidden hover:border-indigo-600">
			{/* Image Area */}
			<Link
				href={editHref}
				className="block relative h-40 bg-gray-700 group-hover:opacity-90 transition-opacity">
				{quiz.coverUrl ? (
					// 3. Show Real Image if URL exists
					<Image
						src={quiz.coverUrl}
						alt={quiz.title || "Quiz cover"}
						fill
						className="object-cover"
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
					/>
				) : (
					// 4. Fallback to Lucide Icon if no URL
					<div className="flex h-full items-center justify-center text-gray-500">
						<ImageIcon className="w-12 h-12 opacity-50" />
					</div>
				)}
			</Link>

			<div className="p-4">
				<Link
					href={editHref}
					className="block group-hover:text-indigo-400 transition-colors">
					<h3 className="text-xl font-semibold text-white mb-2 truncate">
						{quiz.title || "Untitled Quiz"}
					</h3>
				</Link>

				<p className="text-gray-400 mb-4">
					{quiz.questions.length}{" "}
					{quiz.questions.length === 1 ? "question" : "questions"}
				</p>

				{/* --- Action Buttons --- */}
				<div className="flex justify-between items-center gap-2">
					{/* Link to Edit */}
					<Link
						href={editHref}
						className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
						Edit &rarr;
					</Link>

					<button
						disabled={isPending}
						className={`flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-full text-sm font-medium transition-colors shadow-md ${
							isPending
								? "opacity-50 cursor-not-allowed"
								: "hover:bg-indigo-700"
						}`}
						onClick={() => createLobby()}>
						{isPending ? (
							<span className="animate-pulse">Starting...</span>
						) : (
							<>
								<Play className="w-4 h-4" />
								<span>Start Game</span>
							</>
						)}
					</button>
				</div>
			</div>
		</div>
	);
}
