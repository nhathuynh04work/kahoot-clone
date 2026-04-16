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
import { appInputClassName } from "@/components/ui/app-input";
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
		setSelectedQuiz(
			({
				id: quiz.id,
				title: quiz.title,
				coverUrl: quiz.coverUrl,
				userId: quiz.userId,
				authorName: quiz.authorName,
				questions: [],
			} as unknown) as QuizWithQuestions,
		);
	};

	const goToDocumentsSearch = (fileName: string) => {
		setOpen(false);
		router.push("/library/files");
	};

	return (
		<div ref={containerRef} className="w-full max-w-md relative">
			<label htmlFor="topbar-search" className="sr-only">
				Search
			</label>
			<Search
				className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--app-fg-muted)"
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
				className={cn(appInputClassName, "pl-9 pr-10 py-2 rounded-lg")}
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
					className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-(--app-fg-muted) hover:text-(--app-fg) hover:bg-(--app-surface-muted) transition-colors"
					aria-label="Clear search"
				>
					<X className="w-4 h-4" aria-hidden />
				</button>
			)}

			{open && enabled && (
				<div className="absolute left-0 right-0 top-full mt-2 rounded-lg border border-(--app-border) bg-(--app-elevated) shadow-xl z-50">
					<div className="max-h-80 overflow-auto">
						{isFetching && (
							<div className="px-4 py-3 text-xs text-(--app-fg-muted)">Searching…</div>
						)}

						{!isFetching && !hasResults && (
							<div className="px-4 py-3 text-xs text-(--app-fg-muted)">No results.</div>
						)}

						{(data?.quizzes?.length ?? 0) > 0 && (
							<div className="py-2">
								<p className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-wide text-(--app-fg-muted)">
									Quizzes
								</p>
								<div className="space-y-1">
									{data!.quizzes.map((quiz) => (
										<button
											key={`quiz-${quiz.id}`}
											type="button"
											className={cn(
												"w-full text-left px-4 py-2 hover:bg-(--app-surface-muted) transition-colors",
												"flex items-start gap-3",
											)}
											onClick={() => openQuiz(quiz)}
										>
											<div className="mt-0.5 shrink-0 w-8 h-8 rounded-md bg-(--app-surface-muted) border border-(--app-border) flex items-center justify-center">
												<Video className="w-4 h-4 text-emerald-600" aria-hidden />
											</div>
											<div className="min-w-0 flex-1">
												<p className="text-sm text-(--app-fg) truncate">
													{quiz.title || "Untitled Quiz"}
												</p>
												<p className="text-xs text-(--app-fg-muted) truncate">
													{quiz.authorName ?? "Unknown"} • {quiz.questionCount}{" "}
													{quiz.questionCount === 1 ? "question" : "questions"}
												</p>
												<p className="mt-1 text-xs text-(--app-fg-muted)/80 flex items-center gap-3">
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
							<div className="py-2 border-t border-(--app-border)">
								<p className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-wide text-(--app-fg-muted)">
									Documents
								</p>
								<div className="space-y-1">
									{data!.documents.map((doc) => (
										<button
											key={`doc-${doc.id}`}
											type="button"
											className={cn(
												"w-full text-left px-4 py-2 hover:bg-(--app-surface-muted) transition-colors",
												"flex items-start gap-3",
											)}
											onClick={() => goToDocumentsSearch(doc.fileName)}
										>
											<div className="mt-0.5 shrink-0 w-8 h-8 rounded-md bg-(--app-surface-muted) border border-(--app-border) flex items-center justify-center">
												<FileText className="w-4 h-4 text-(--app-accent)" aria-hidden />
											</div>
											<div className="min-w-0 flex-1">
												<p className="text-sm text-(--app-fg) truncate">{doc.fileName}</p>
												<p className="text-xs text-(--app-fg-muted) truncate">
													{formatBytes(doc.fileSize)} • {doc.authorName ?? "Unknown"}
												</p>
												<p className="mt-1 text-xs text-(--app-fg-muted)/80 flex items-center gap-1.5">
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
							<div className="py-2 border-t border-(--app-border)">
								<p className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-wide text-(--app-fg-muted)">
									Users
								</p>
								<div className="space-y-1">
									{data!.users.map((u) => (
										<Link
											key={`user-${u.id}`}
											href={`/users/${u.id}`}
											onClick={() => setOpen(false)}
											className={cn(
												"block px-4 py-2 hover:bg-(--app-surface-muted) transition-colors",
												"flex items-start gap-3",
											)}
										>
											<div className="mt-0.5 shrink-0 w-8 h-8 rounded-md bg-(--app-surface-muted) border border-(--app-border) flex items-center justify-center">
												<UserIcon className="w-4 h-4 text-(--app-fg-muted)" aria-hidden />
											</div>
											<div className="min-w-0 flex-1">
												<p className="text-sm text-(--app-fg) truncate">
													{u.name ?? "Unknown user"}
												</p>
												<p className="text-xs text-(--app-fg-muted) truncate">View profile</p>
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

export function MobileSearchDialog({
	isAuthed,
	open,
	onOpenChange,
}: {
	isAuthed: boolean;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const router = useRouter();
	const [q, setQ] = useState("");
	const [debouncedQ] = useDebounce(q, 250);
	const [selectedQuiz, setSelectedQuiz] = useState<QuizWithQuestions | null>(null);

	const trimmed = debouncedQ.trim();
	const enabled = open && trimmed.length >= 1;

	const { data, isFetching } = useQuery({
		queryKey: ["globalSearch", trimmed],
		queryFn: () => globalSearch({ q: trimmed, limit: 8 }),
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
		if (!open) return;
		function onKeyDown(e: KeyboardEvent) {
			if (e.key === "Escape") onOpenChange(false);
		}
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [onOpenChange, open]);

	const openQuiz = (quiz: {
		id: number;
		title: string | null;
		coverUrl: string | null;
		userId: number;
		authorName: string | null;
	}) => {
		onOpenChange(false);
		setSelectedQuiz(
			({
				id: quiz.id,
				title: quiz.title,
				coverUrl: quiz.coverUrl,
				userId: quiz.userId,
				authorName: quiz.authorName,
				questions: [],
			} as unknown) as QuizWithQuestions,
		);
	};

	const goToDocumentsSearch = (fileName: string) => {
		onOpenChange(false);
		router.push("/library/files");
	};

	if (!open) {
		return selectedQuiz ? (
			<QuizDetailsDrawerContainer
				quiz={selectedQuiz}
				onClose={() => setSelectedQuiz(null)}
				variant={isAuthed ? "default" : "public"}
				viewerId={undefined}
			/>
		) : null;
	}

	return (
		<div
			className="fixed inset-0 z-60 bg-black/50 backdrop-blur-sm"
			role="dialog"
			aria-modal="true"
			aria-label="Search"
		>
			<div className="absolute inset-0" onClick={() => onOpenChange(false)} />
			<div className="relative mx-auto h-dvh w-full max-w-2xl bg-(--app-bg) border-x border-(--app-border) flex flex-col text-(--app-fg)">
				<div className="px-4 pt-4 pb-3 border-b border-(--app-border)">
					<div className="flex items-center gap-3">
						<div className="relative flex-1">
							<Search
								className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--app-fg-muted)"
								aria-hidden
							/>
							<input
								autoFocus
								type="search"
								value={q}
								onChange={(e) => setQ(e.target.value)}
								placeholder="Search quizzes, documents, users…"
								className={cn(appInputClassName, "pl-9 pr-10 py-2.5 rounded-xl")}
								aria-label="Search"
								autoComplete="off"
							/>
							{q.trim().length > 0 && (
								<button
									type="button"
									onClick={() => setQ("")}
									className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-(--app-fg-muted) hover:text-(--app-fg) hover:bg-(--app-surface-muted) transition-colors"
									aria-label="Clear search"
								>
									<X className="w-4 h-4" aria-hidden />
								</button>
							)}
						</div>
						<button
							type="button"
							onClick={() => onOpenChange(false)}
							className="px-3 py-2 rounded-lg text-sm font-semibold text-(--app-fg-muted) hover:bg-(--app-surface-muted) hover:text-(--app-fg) transition-colors"
						>
							Close
						</button>
					</div>
				</div>

				<div className="flex-1 overflow-auto">
					{!trimmed ? (
						<div className="px-4 py-10 text-center text-sm text-(--app-fg-muted)">
							Type to search.
						</div>
					) : isFetching ? (
						<div className="px-4 py-6 text-sm text-(--app-fg-muted)">Searching…</div>
					) : !hasResults ? (
						<div className="px-4 py-6 text-sm text-(--app-fg-muted)">No results.</div>
					) : (
						<div className="py-2">
							{(data?.quizzes?.length ?? 0) > 0 && (
								<div className="py-2">
									<p className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-wide text-(--app-fg-muted)">
										Quizzes
									</p>
									<div className="space-y-1">
										{data!.quizzes.map((quiz) => (
											<button
												key={`quiz-${quiz.id}`}
												type="button"
												className={cn(
													"w-full text-left px-4 py-3 hover:bg-(--app-surface-muted) transition-colors",
													"flex items-start gap-3",
												)}
												onClick={() => openQuiz(quiz)}
											>
												<div className="mt-0.5 shrink-0 w-9 h-9 rounded-md bg-(--app-surface-muted) border border-(--app-border) flex items-center justify-center">
													<Video className="w-4 h-4 text-emerald-600" aria-hidden />
												</div>
												<div className="min-w-0 flex-1">
													<p className="text-sm text-(--app-fg) truncate">
														{quiz.title || "Untitled Quiz"}
													</p>
													<p className="text-xs text-(--app-fg-muted) truncate">
														{quiz.authorName ?? "Unknown"} • {quiz.questionCount}{" "}
														{quiz.questionCount === 1 ? "question" : "questions"}
													</p>
												</div>
											</button>
										))}
									</div>
								</div>
							)}

							{(data?.documents?.length ?? 0) > 0 && (
								<div className="py-2 border-t border-(--app-border)">
									<p className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-wide text-(--app-fg-muted)">
										Documents
									</p>
									<div className="space-y-1">
										{data!.documents.map((doc) => (
											<button
												key={`doc-${doc.id}`}
												type="button"
												className={cn(
													"w-full text-left px-4 py-3 hover:bg-(--app-surface-muted) transition-colors",
													"flex items-start gap-3",
												)}
												onClick={() => goToDocumentsSearch(doc.fileName)}
											>
												<div className="mt-0.5 shrink-0 w-9 h-9 rounded-md bg-(--app-surface-muted) border border-(--app-border) flex items-center justify-center">
													<FileText className="w-4 h-4 text-(--app-accent)" aria-hidden />
												</div>
												<div className="min-w-0 flex-1">
													<p className="text-sm text-(--app-fg) truncate">{doc.fileName}</p>
													<p className="text-xs text-(--app-fg-muted) truncate">
														{formatBytes(doc.fileSize)} • {doc.authorName ?? "Unknown"}
													</p>
												</div>
											</button>
										))}
									</div>
								</div>
							)}

							{(data?.users?.length ?? 0) > 0 && (
								<div className="py-2 border-t border-(--app-border)">
									<p className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-wide text-(--app-fg-muted)">
										Users
									</p>
									<div className="space-y-1">
										{data!.users.map((u) => (
											<Link
												key={`user-${u.id}`}
												href={`/users/${u.id}`}
												onClick={() => onOpenChange(false)}
												className={cn(
													"block px-4 py-3 hover:bg-(--app-surface-muted) transition-colors",
													"flex items-start gap-3",
												)}
											>
												<div className="mt-0.5 shrink-0 w-9 h-9 rounded-md bg-(--app-surface-muted) border border-(--app-border) flex items-center justify-center">
													<UserIcon className="w-4 h-4 text-(--app-fg-muted)" aria-hidden />
												</div>
												<div className="min-w-0 flex-1">
													<p className="text-sm text-(--app-fg) truncate">
														{u.name ?? "Unknown user"}
													</p>
													<p className="text-xs text-(--app-fg-muted) truncate">View profile</p>
												</div>
											</Link>
										))}
									</div>
								</div>
							)}
						</div>
					)}
				</div>

				{selectedQuiz ? (
					<QuizDetailsDrawerContainer
						quiz={selectedQuiz}
						onClose={() => setSelectedQuiz(null)}
						variant={isAuthed ? "default" : "public"}
						viewerId={undefined}
					/>
				) : null}
			</div>
		</div>
	);
}

