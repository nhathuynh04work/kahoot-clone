"use client";

import {
	X,
	Loader2,
	Play,
	Pencil,
	ChevronRight,
	Video,
	Users,
	Bookmark,
	Link as LinkIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CSSProperties, ReactNode } from "react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { toggleQuizSave } from "@/features/quizzes/api/client-actions";
import { apiClient } from "@/lib/apiClient";
import { Select } from "@/components/ui/select";

function DrawerHeader({
	authorName,
	showSaveButton,
	saved,
	isSaving,
	onToggleSave,
	onClose,
	onShare,
	shareLabel,
	showShare,
}: {
	authorName: string;
	showSaveButton: boolean;
	saved: boolean;
	isSaving: boolean;
	onToggleSave: () => void;
	onClose: () => void;
	showShare: boolean;
	shareLabel: string;
	onShare: () => void;
}) {
	return (
		<header className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3 border-b border-gray-700 shrink-0">
			<div className="flex items-center gap-3 min-w-0 justify-self-start">
				<UserAvatar name={authorName} size={32} />
				<span className="text-sm text-gray-300 truncate">{authorName}</span>
			</div>
			<div className="flex items-center gap-2 justify-self-center">
				{showShare && (
					<button
						type="button"
						onClick={onShare}
						className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors border bg-gray-900/20 hover:bg-gray-900/40 text-gray-200 border-gray-700"
						aria-label="Share quiz"
					>
						<LinkIcon className="w-4 h-4" />
						<span>{shareLabel}</span>
					</button>
				)}
				{showSaveButton && (
					<button
						type="button"
						onClick={onToggleSave}
						disabled={isSaving}
						className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
							saved
								? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500/30"
								: "bg-gray-900/20 hover:bg-gray-900/40 text-gray-200 border-gray-700"
						} ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
						aria-label={saved ? "Unsave quiz" : "Save quiz"}
					>
						<Bookmark
							className="w-4 h-4"
							fill={saved ? "currentColor" : "none"}
						/>
						<span>{isSaving ? "Saving…" : saved ? "Saved" : "Save"}</span>
					</button>
				)}
			</div>
			<div className="justify-self-end">
				<button
					type="button"
					onClick={onClose}
					className="p-2 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors shrink-0"
					aria-label="Close"
				>
					<X className="w-5 h-5" />
				</button>
			</div>
		</header>
	);
}

function DrawerHero({
	coverUrl,
	title,
	playsLabel,
	participantsLabel,
}: {
	coverUrl?: string;
	title: string;
	playsLabel: string;
	participantsLabel: string;
}) {
	return (
		<div className="shrink-0 p-4 pb-0">
			<div className="flex gap-4">
				<div className="relative w-48 h-28 rounded-xl overflow-hidden bg-gray-700 shrink-0">
					{coverUrl ? (
						<Image
							src={coverUrl}
							alt={title || "Quiz cover"}
							fill
							className="object-cover"
							sizes="192px"
						/>
					) : (
						<div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-indigo-600/20 via-gray-900/10 to-emerald-500/20">
							<span className="text-2xl font-black tracking-tight text-emerald-300">
								q!
							</span>
						</div>
					)}
				</div>
				<div className="min-w-0 flex-1">
					<h1 className="text-xl font-bold text-white truncate">{title}</h1>
					<div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
						<span className="flex items-center gap-1.5">
							<Video className="w-4 h-4" />
							{playsLabel}
						</span>
						<span className="flex items-center gap-1.5">
							<Users className="w-4 h-4" />
							{participantsLabel}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}

function DrawerSidebar({
	quizId,
	isPending,
	onHostLive,
	isOwner,
	initialVisibility,
}: {
	quizId: number;
	isPending: boolean;
	onHostLive: () => void;
	isOwner: boolean;
	initialVisibility?: "PUBLIC" | "PRIVATE";
}) {
	const queryClient = useQueryClient();
	const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">(
		initialVisibility ?? "PRIVATE",
	);

	const { mutate: updateVisibility, isPending: isUpdatingVisibility } =
		useMutation({
			mutationFn: async (next: "PUBLIC" | "PRIVATE") => {
				const { data } = await apiClient.patch(`/quiz/${quizId}`, {
					visibility: next,
				});
				return data as { visibility?: "PUBLIC" | "PRIVATE" };
			},
			onSuccess: (res) => {
				if (res.visibility) setVisibility(res.visibility);
				void queryClient.invalidateQueries({ queryKey: ["mySavedQuizzes"] });
			},
		});

	return (
		<aside className="w-[260px] shrink-0 border-l border-gray-700 flex flex-col bg-gray-800/50">
			<div className="p-4 space-y-2">
				<Link
					href={`/quiz/${quizId}/edit`}
					className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm font-medium transition-colors"
				>
					<span className="flex items-center gap-2">
						<Pencil className="w-4 h-4" />
						Edit
					</span>
					<ChevronRight className="w-4 h-4 text-gray-400" />
				</Link>

				<button
					type="button"
					disabled={isPending}
					onClick={onHostLive}
					className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800"
				>
					<span className="flex items-center gap-2">
						{isPending ? (
							<Loader2 className="w-4 h-4 animate-spin" />
						) : (
							<Play className="w-4 h-4" />
						)}
						Host live
					</span>
					<ChevronRight className="w-4 h-4 text-indigo-200" />
				</button>

				{isOwner && (
					<div className="pt-3">
						<p className="text-xs font-medium text-gray-400 mb-2">Visibility</p>
						<Select
							value={visibility}
							onValueChange={(v) => {
								if (isUpdatingVisibility) return;
								const next = v as "PUBLIC" | "PRIVATE";
								setVisibility(next);
								updateVisibility(next);
							}}
							options={[
								{ value: "PRIVATE", label: "Private" },
								{ value: "PUBLIC", label: "Public" },
							]}
							ariaLabel="Quiz visibility"
							placeholder="Select visibility"
							buttonClassName={
								isUpdatingVisibility ? "opacity-60 pointer-events-none" : undefined
							}
						/>
					</div>
				)}
			</div>
		</aside>
	);
}

export type QuizDetailsDrawerShellProps = {
	authorName: string;
	onClose: () => void;
	coverUrl?: string;
	title: string;
	playsLabel: string;
	participantsLabel: string;
	quizId: number;
	isHostPending?: boolean;
	onHostLive?: () => void;
	showSaveButton?: boolean;
	initialIsSaved?: boolean;
	isOwner?: boolean;
	initialVisibility?: "PUBLIC" | "PRIVATE";
	backdropStyle: CSSProperties;
	panelStyle: CSSProperties;
	onBackdropClick: () => void;
	content: ReactNode;
	hideSidebar?: boolean;
	sharePath?: string;
};

export function QuizDetailsDrawerShell({
	authorName,
	onClose,
	coverUrl,
	title,
	playsLabel,
	participantsLabel,
	quizId,
	isHostPending,
	onHostLive,
	showSaveButton,
	initialIsSaved,
	isOwner,
	initialVisibility,
	backdropStyle,
	panelStyle,
	onBackdropClick,
	content,
	hideSidebar = false,
	sharePath,
}: QuizDetailsDrawerShellProps) {
	const queryClient = useQueryClient();
	const [saved, setSaved] = useState(() => !!initialIsSaved);
	const [shared, setShared] = useState(false);

	const { mutate: toggleSave, isPending: isSaving } = useMutation({
		mutationFn: () => toggleQuizSave(quizId),
		onSuccess: (res) => {
			setSaved(res.saved);
			void queryClient.invalidateQueries({ queryKey: ["mySavedQuizzes"] });
		},
	});

	return (
		<div
			className="fixed inset-0 z-50 flex items-end justify-center touch-none bg-black/40 backdrop-blur-[1px] transition-opacity ease-out"
			style={backdropStyle}
			onClick={onBackdropClick}
			aria-modal
			role="dialog"
		>
			<div
				className="relative w-full max-w-full overflow-hidden rounded-t-2xl bg-gray-800 border border-gray-700 border-b-0 shadow-2xl flex flex-col transition-transform ease-out"
				style={panelStyle}
				onClick={(e) => e.stopPropagation()}
			>
				<DrawerHeader
					authorName={authorName}
					showSaveButton={!!showSaveButton}
					saved={saved}
					isSaving={isSaving}
					onToggleSave={() => toggleSave()}
					onClose={onClose}
					showShare={!!sharePath}
					shareLabel={shared ? "Copied" : "Share"}
					onShare={async () => {
						if (!sharePath) return;
						const url = `${window.location.origin}${
							sharePath.startsWith("/") ? sharePath : `/${sharePath}`
						}`;
						try {
							await navigator.clipboard.writeText(url);
						} catch {
							// Fallback best-effort.
							const el = document.createElement("textarea");
							el.value = url;
							el.style.position = "fixed";
							el.style.left = "-9999px";
							document.body.appendChild(el);
							el.select();
							document.execCommand("copy");
							document.body.removeChild(el);
						}
						setShared(true);
						window.setTimeout(() => setShared(false), 1200);
					}}
				/>

				<div className="flex-1 flex min-h-0">
					<div className="flex-1 min-w-0 flex flex-col overflow-hidden">
						<DrawerHero
							coverUrl={coverUrl}
							title={title}
							playsLabel={playsLabel}
							participantsLabel={participantsLabel}
						/>

						<div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 pb-4 pt-0 bg-[#1f2937]">
							{content}
						</div>
					</div>

					{!hideSidebar && onHostLive && typeof isHostPending === "boolean" && (
						<DrawerSidebar
							quizId={quizId}
							isPending={isHostPending}
							onHostLive={onHostLive}
							isOwner={!!isOwner}
							initialVisibility={initialVisibility}
						/>
					)}
				</div>
			</div>
		</div>
	);
}

