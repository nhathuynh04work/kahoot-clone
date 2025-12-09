import Link from "next/link";
import { Image, Play } from "lucide-react";
import { QuizWithQuestions } from "@/lib/types/quiz";

interface QuizCardProps {
	quiz: QuizWithQuestions;
}

export function QuizCard({ quiz }: QuizCardProps) {
	const editHref = `/quiz/${quiz.id}/edit`;
	const lobbyHref = `/quiz/${quiz.id}/game`;

	return (
		<div className="block bg-gray-800 rounded-lg shadow-md transition-shadow duration-200 border border-gray-700 group overflow-hidden hover:border-indigo-600">
			{/* Image Placeholder */}
			<Link href={editHref} className="block">
				<div className="h-40 bg-gray-700 flex items-center justify-center text-gray-500 group-hover:opacity-90">
					<Image className="w-12 h-12" />
				</div>
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
					{quiz.questions.length < 2 ? "question" : "questions"}
				</p>

				{/* --- Action Buttons --- */}
				<div className="flex justify-between items-center gap-2">
					{/* Link to Edit */}
					<Link
						href={editHref}
						className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
						Edit &rarr;
					</Link>

					{/* Link to Start Lobby */}
					<Link
						href={lobbyHref}
						className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-full text-sm font-medium hover:bg-indigo-700 transition-colors shadow-md">
						<Play className="w-4 h-4" />
						<span>Start Game</span>
					</Link>
				</div>
			</div>
		</div>
	);
}
