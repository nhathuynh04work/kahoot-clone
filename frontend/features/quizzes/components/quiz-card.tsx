"use client";

import Link from "next/link";
import Image from "next/image"; // 1. Import Next.js Image
import { Bookmark, Play, Video } from "lucide-react";
import { QuizWithQuestions } from "@/features/quizzes/types";
import { useCreateLobby } from "@/features/quizzes/hooks/use-create-lobby";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMySavedQuizIds, toggleQuizSave } from "@/features/quizzes/api/client-actions";
import { AppLogo } from "@/components/layout/app-logo";

interface QuizCardProps {
	quiz: QuizWithQuestions;
	onCardClick?: () => void;
	viewerId?: number;
}

export function QuizCard({ quiz, onCardClick, viewerId }: QuizCardProps) {
	const editHref = `/quiz/${quiz.id}/edit`;
	const { mutate: createLobby, isPending } = useCreateLobby(quiz.id);
	const queryClient = useQueryClient();
	const isOwner = typeof viewerId === "number" && viewerId === quiz.userId;

	useQuery({
		queryKey: ["mySavedQuizzes"],
		queryFn: getMySavedQuizIds,
		enabled: typeof viewerId === "number" && !isOwner,
	});

	const savedIds = (queryClient.getQueryData<number[]>(["mySavedQuizzes"]) ??
		[]) as number[];
	const isSaved = savedIds.includes(quiz.id);

	const { mutate: toggleSave, isPending: isSaving } = useMutation({
		mutationFn: () => toggleQuizSave(quiz.id),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["mySavedQuizzes"] });
		},
	});

	return (
		<div
			className={[
				"block bg-(--app-surface) rounded-lg shadow-md border border-(--app-border) group overflow-hidden",
				"transition-transform duration-200 ease-out hover:scale-[1.02] hover:-translate-y-1",
				"transition-colors duration-200 hover:border-indigo-500/60",
			].join(" ")}>
			{/* Owner */}
			<div
				className="px-4 pt-4 flex items-center gap-2 text-sm text-(--app-fg-muted) transition-colors"
				onClick={onCardClick}
				role={onCardClick ? "button" : undefined}
				tabIndex={onCardClick ? 0 : undefined}
				onKeyDown={(e) => {
					if (!onCardClick) return;
					if (e.key === "Enter" || e.key === " ") onCardClick();
				}}
			>
				<Link
					href={`/users/${quiz.userId}`}
					onClick={(e) => e.stopPropagation()}
					className="shrink-0"
					aria-label={`View profile for ${quiz.authorName ?? "owner"}`}
				>
					<UserAvatar name={quiz.authorName ?? undefined} size={26} />
				</Link>
				<Link
					href={`/users/${quiz.userId}`}
					onClick={(e) => e.stopPropagation()}
					className="truncate font-medium hover:text-(--app-fg) transition-colors"
					aria-label={`View profile for ${quiz.authorName ?? "owner"}`}
				>
					{quiz.authorName ?? "Unknown"}
				</Link>
			</div>

			{/* Cover Area */}
			<div className="relative h-40 bg-(--app-surface-muted) group-hover:opacity-90 transition-opacity mt-3">
				{quiz.coverUrl ? (
					<Image
						src={quiz.coverUrl}
						alt={quiz.title || "Quiz cover"}
						fill
						className="object-cover"
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
					/>
				) : (
					<div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-indigo-500/18 via-(--app-fg)/6 to-emerald-500/14">
							<AppLogo variant="mark" className="text-5xl font-black tracking-tight" />
					</div>
				)}

				<div
					className={[
						"hidden sm:flex absolute inset-0 z-10 p-4 flex-col justify-center items-stretch gap-2",
						"bg-black/45 backdrop-blur-sm",
						"opacity-0 pointer-events-none transition-opacity duration-150",
						"group-hover:opacity-100 group-hover:pointer-events-auto",
						"group-focus-within:opacity-100 group-focus-within:pointer-events-auto",
					].join(" ")}>
					<button
						type="button"
						disabled={isPending}
						onClick={(e) => {
							e.stopPropagation();
							createLobby();
						}}
						className={`w-full min-h-11 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors shadow-md shadow-indigo-600/10 ${
							isPending
								? "opacity-50 cursor-not-allowed"
								: "bg-indigo-600 hover:bg-indigo-500 text-white"
						}`}>
						{isPending ? (
							<span className="animate-pulse">Hosting…</span>
						) : (
							<>
								<Play className="w-4 h-4" />
								<span>Host game</span>
							</>
						)}
					</button>

					{isOwner && (
						<Link
							href={editHref}
							onClick={(e) => {
								e.stopPropagation();
							}}
								className="w-full min-h-11 flex items-center justify-center px-3 py-2 rounded-lg border border-white/20 bg-black/20 hover:bg-black/30 text-sm font-semibold transition-colors text-white/90 hover:text-white">
							Edit
						</Link>
					)}

					{!isOwner && typeof viewerId === "number" && (
						<button
							type="button"
							disabled={isSaving}
							onClick={(e) => {
								e.stopPropagation();
								toggleSave();
							}}
							className={[
								"w-full min-h-11 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors border",
								isSaved
									? "bg-emerald-600/90 hover:bg-emerald-500 text-white border-emerald-500/30"
									: "bg-black/20 hover:bg-black/30 text-white/90 border-white/20",
								isSaving ? "opacity-50 cursor-not-allowed" : "",
							].join(" ")}
						>
							<Bookmark
								className="w-4 h-4"
								fill={isSaved ? "currentColor" : "none"}
							/>
							<span>{isSaving ? "Saving…" : isSaved ? "Saved" : "Save"}</span>
						</button>
					)}
				</div>
			</div>

			{/* Body click opens quiz details modal */}
			<div className="p-4">
				<button
					type="button"
					onClick={onCardClick}
					disabled={!onCardClick}
					className="w-full text-left cursor-pointer disabled:cursor-not-allowed disabled:opacity-100">
					<h3 className="text-lg font-semibold text-(--app-fg) mb-2 truncate">
						{quiz.title || "Untitled Quiz"}
					</h3>
					<p className="text-sm text-(--app-fg-muted)">
						{quiz.questions.length}{" "}
						{quiz.questions.length === 1 ? "question" : "questions"}
					</p>
					{(typeof quiz.playCount === "number" ||
						typeof quiz.saveCount === "number") && (
						<div className="mt-2 flex items-center gap-4 text-xs text-(--app-fg-muted)/70">
							{typeof quiz.playCount === "number" && (
								<span className="flex items-center gap-1.5">
									<Video className="w-3.5 h-3.5" />
									{quiz.playCount} {quiz.playCount === 1 ? "play" : "plays"}
								</span>
							)}
							{typeof quiz.saveCount === "number" && (
								<span className="flex items-center gap-1.5">
									<Bookmark className="w-3.5 h-3.5" />
									{quiz.saveCount} {quiz.saveCount === 1 ? "save" : "saves"}
								</span>
							)}
						</div>
					)}
				</button>
			</div>
		</div>
	);
}
