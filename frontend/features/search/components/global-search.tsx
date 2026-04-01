"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { Bookmark, FileText, Search, User as UserIcon, Video, X } from "lucide-react";
import type { QuizWithQuestions } from "@/features/quizzes/types";
import { QuizDetailsDrawerContainer } from "@/features/quizzes/components/quiz-details-drawer/quiz-details-drawer-container";
import { formatBytes } from "@/features/documents/lib/constants";
import { cn } from "@/lib/utils";
import { globalSearch } from "../api/client-actions";

export function GlobalSearch({ isAuthed }: { isAuthed: boolean }) {
	const router = useRouter();
	const [q, setQ] = useState("");
	const [debouncedQ] = useDebounce(q, 250);
	const [open, setOpen] = useState(false);
	const [selectedQuiz, setSelectedQuiz] = useState<QuizWithQuestions | null>(null);

	const containerRef = useRef<HTMLDivElement>(null);

	const trimmed = debouncedQ.trim();
	const enabled = trimmed.length >= 1;

	const { data, isFetching } = useQuery({
		queryKey: ["globalSearch", trimmed],
		queryFn: () => globalSearch({ q: trimmed, limit: 5 }),
		enabled,
		staleTime: 20_000,
	});

	const hasResults = useMemo(() => {
		if (!enabled) return false;
		return (
			(data?.quizzes?.length ?? 0) +
				(data?.documents?.length ?? 0) +
				(data?.users?.length ?? 0) >
			0
		);
	}, [data?.documents?.length, data?.quizzes?.length, data?.users?.length, enabled]);

	useEffect(() => {
		function onDocMouseDown(e: MouseEvent) {
			if (!containerRef.current) return;
			if (!containerRef.current.contains(e.target as Node)) setOpen(false);
		}
		function onKeyDown(e: KeyboardEvent) {
			if (e.key === "Escape") setOpen(false);
		}
		document.addEventListener("mousedown", onDocMouseDown);
		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("mousedown", onDocMouseDown);
			document.removeEventListener("keydown", onKeyDown);
		};
	}, []);

	const openQuiz = (quiz: {
		id: number;
		title: string | null;
		coverUrl: string | null;
		userId: number;
		authorName: string | null;
	}) => {
		setOpen(false);
		setSelectedQuiz({
			id: quiz.id,
			title: quiz.title,
			coverUrl: quiz.coverUrl,
			userId: quiz.userId,
			authorName: quiz.authorName,
			questions: [],
		} as QuizWithQuestions);
	};

	const goToDocumentsSearch = (fileName: string) => {
		setOpen(false);
		const params = new URLSearchParams();
		params.set("tab", "documents");
		params.set("q", fileName);
		params.set("page", "1");
		router.push(`/discover?${params.toString()}`);
	};

	return (
		<div ref={containerRef} className="w-full max-w-md relative">
			<label htmlFor="topbar-search" className="sr-only">
				Search
			</label>
			<Search
				className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
				aria-hidden
			/>
			<input
				id="topbar-search"
				type="search"
				value={q}
				onChange={(e) => {
					setQ(e.target.value);
					if (!open) setOpen(true);
				}}
				onFocus={() => setOpen(true)}
				placeholder="Search quizzes, documents, users…"
				className={cn(
					"w-full pl-9 pr-10 py-2 rounded-lg text-sm text-white placeholder-gray-500",
					"bg-gray-800/50 border border-gray-700",
					"focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-transparent",
					"[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none",
				)}
				aria-label="Search"
				autoComplete="off"
			/>

			{q.trim().length > 0 && (
				<button
					type="button"
					onClick={() => {
						setQ("");
						setOpen(false);
					}}
					className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-700/60 transition-colors"
					aria-label="Clear search"
				>
					<X className="w-4 h-4" aria-hidden />
				</button>
			)}

			{open && enabled && (
				<div className="absolute left-0 right-0 top-full mt-2 rounded-lg border border-gray-700 bg-gray-800 shadow-xl z-50">
					<div className="max-h-80 overflow-auto">
						{isFetching && (
							<div className="px-4 py-3 text-xs text-gray-400">Searching…</div>
						)}

						{!isFetching && !hasResults && (
							<div className="px-4 py-3 text-xs text-gray-400">No results.</div>
						)}

						{(data?.quizzes?.length ?? 0) > 0 && (
							<div className="py-2">
								<p className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
									Quizzes
								</p>
								<div className="space-y-1">
									{data!.quizzes.map((quiz) => (
										<button
											key={`quiz-${quiz.id}`}
											type="button"
											className={cn(
												"w-full text-left px-4 py-2 hover:bg-gray-700/60 transition-colors",
												"flex items-start gap-3",
											)}
											onClick={() => openQuiz(quiz)}
										>
											<div className="mt-0.5 shrink-0 w-8 h-8 rounded-md bg-gray-700 border border-gray-600 flex items-center justify-center">
												<Video className="w-4 h-4 text-emerald-300" aria-hidden />
											</div>
											<div className="min-w-0 flex-1">
												<p className="text-sm text-white truncate">
													{quiz.title || "Untitled Quiz"}
												</p>
												<p className="text-xs text-gray-400 truncate">
													{quiz.authorName ?? "Unknown"} • {quiz.questionCount}{" "}
													{quiz.questionCount === 1 ? "question" : "questions"}
												</p>
												<p className="mt-1 text-xs text-gray-500 flex items-center gap-3">
													<span className="inline-flex items-center gap-1.5">
														<Video className="w-3.5 h-3.5" aria-hidden />
														{quiz.playCount}
													</span>
													<span className="inline-flex items-center gap-1.5">
														<Bookmark className="w-3.5 h-3.5" aria-hidden />
														{quiz.saveCount}
													</span>
												</p>
											</div>
										</button>
									))}
								</div>
							</div>
						)}

						{(data?.documents?.length ?? 0) > 0 && (
							<div className="py-2 border-t border-gray-700">
								<p className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
									Documents
								</p>
								<div className="space-y-1">
									{data!.documents.map((doc) => (
										<button
											key={`doc-${doc.id}`}
											type="button"
											className={cn(
												"w-full text-left px-4 py-2 hover:bg-gray-700/60 transition-colors",
												"flex items-start gap-3",
											)}
											onClick={() => goToDocumentsSearch(doc.fileName)}
										>
											<div className="mt-0.5 shrink-0 w-8 h-8 rounded-md bg-gray-700 border border-gray-600 flex items-center justify-center">
												<FileText className="w-4 h-4 text-indigo-300" aria-hidden />
											</div>
											<div className="min-w-0 flex-1">
												<p className="text-sm text-white truncate">{doc.fileName}</p>
												<p className="text-xs text-gray-400 truncate">
													{formatBytes(doc.fileSize)} • {doc.authorName ?? "Unknown"}
												</p>
												<p className="mt-1 text-xs text-gray-500 flex items-center gap-1.5">
													<Bookmark className="w-3.5 h-3.5" aria-hidden />
													{doc.saveCount} {doc.saveCount === 1 ? "save" : "saves"}
												</p>
											</div>
										</button>
									))}
								</div>
							</div>
						)}

						{(data?.users?.length ?? 0) > 0 && (
							<div className="py-2 border-t border-gray-700">
								<p className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
									Users
								</p>
								<div className="space-y-1">
									{data!.users.map((u) => (
										<Link
											key={`user-${u.id}`}
											href={`/users/${u.id}`}
											onClick={() => setOpen(false)}
											className={cn(
												"block px-4 py-2 hover:bg-gray-700/60 transition-colors",
												"flex items-start gap-3",
											)}
										>
											<div className="mt-0.5 shrink-0 w-8 h-8 rounded-md bg-gray-700 border border-gray-600 flex items-center justify-center">
												<UserIcon className="w-4 h-4 text-gray-200" aria-hidden />
											</div>
											<div className="min-w-0 flex-1">
												<p className="text-sm text-white truncate">
													{u.name ?? "Unknown user"}
												</p>
												<p className="text-xs text-gray-400 truncate">View profile</p>
											</div>
										</Link>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			)}

			{selectedQuiz && (
				<QuizDetailsDrawerContainer
					quiz={selectedQuiz}
					onClose={() => setSelectedQuiz(null)}
					variant="public"
					viewerId={undefined}
				/>
			)}
		</div>
	);
}

