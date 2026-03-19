"use client";

import Link from "next/link";
import Image from "next/image"; // 1. Import Next.js Image
import { Play } from "lucide-react"; // 2. Rename Lucide icon
import { QuizWithQuestions } from "@/features/quizzes/types";
import { useCreateLobby } from "@/features/quizzes/hooks/use-create-lobby";

interface QuizCardProps {
	quiz: QuizWithQuestions;
	onCardClick?: () => void;
}

export function QuizCard({ quiz, onCardClick }: QuizCardProps) {
	const editHref = `/quiz/${quiz.id}/edit`;
	const { mutate: createLobby, isPending } = useCreateLobby(quiz.id);

	return (
		<div
			className={[
				"block bg-gray-800 rounded-lg shadow-md border border-gray-700 group overflow-hidden",
				"transition-transform duration-200 ease-out hover:scale-[1.02] hover:-translate-y-1",
				"transition-colors duration-200 hover:border-indigo-500/60",
			].join(" ")}>
			{/* Cover Area */}
			<div className="relative h-40 bg-gray-700 group-hover:opacity-90 transition-opacity">
				{quiz.coverUrl ? (
					<Image
						src={quiz.coverUrl}
						alt={quiz.title || "Quiz cover"}
						fill
						className="object-cover"
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
					/>
				) : (
					<div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-indigo-600/20 via-gray-900/10 to-emerald-500/20">
						<span className="text-4xl md:text-5xl font-black tracking-tight text-emerald-300">
							q!
						</span>
					</div>
				)}

				{/* Hover overlay actions */}
				<div
					className={[
						"absolute inset-0 z-10 p-4 flex flex-col justify-center items-stretch gap-2",
						"bg-gray-950/50 backdrop-blur-sm",
						"opacity-0 pointer-events-none transition-opacity duration-150",
						"group-hover:opacity-100 group-hover:pointer-events-auto",
					].join(" ")}>
					<button
						type="button"
						disabled={isPending}
						onClick={(e) => {
							e.stopPropagation();
							createLobby();
						}}
						className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors shadow-md shadow-indigo-600/10 ${
							isPending
								? "opacity-50 cursor-not-allowed"
								: "bg-indigo-600 hover:bg-indigo-500 text-white"
						}`}>
						{isPending ? (
							<span className="animate-pulse">Starting…</span>
						) : (
							<>
								<Play className="w-4 h-4" />
								<span>Start Game</span>
							</>
						)}
					</button>

					<Link
						href={editHref}
						onClick={(e) => {
							e.stopPropagation();
						}}
						className="w-full flex items-center justify-center px-3 py-2 rounded-lg border border-gray-600 bg-gray-900/20 hover:bg-gray-900/40 text-sm font-semibold transition-colors text-gray-200 hover:text-white">
						Edit
					</Link>
				</div>
			</div>

			{/* Body click opens quiz details modal */}
			<div className="p-4">
				<button
					type="button"
					onClick={onCardClick}
					disabled={!onCardClick}
					className="w-full text-left cursor-pointer disabled:cursor-not-allowed disabled:opacity-100">
					<h3 className="text-lg font-semibold text-white mb-2 truncate">
						{quiz.title || "Untitled Quiz"}
					</h3>
					<p className="text-sm text-gray-400">
						{quiz.questions.length}{" "}
						{quiz.questions.length === 1 ? "question" : "questions"}
					</p>
				</button>
			</div>
		</div>
	);
}
