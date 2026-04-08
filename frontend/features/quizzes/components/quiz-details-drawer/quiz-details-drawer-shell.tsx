"use client";

import dynamic from "next/dynamic";
import {
	X,
	Loader2,
	Play,
	Pencil,
	ChevronRight,
	Video,
	Users,
	Bookmark,
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

const QuizDetailsDrawerPortal = dynamic(() => import("./quiz-details-drawer-portal"), {
	ssr: false,
});

function DrawerActions({
	quizId,
	isPending,
	onHostLive,
	isOwner,
	initialVisibility,
	className,
}: {
	quizId: number;
	isPending: boolean;
	onHostLive: () => void;
	isOwner: boolean;
	initialVisibility?: "PUBLIC" | "PRIVATE";
	className?: string;
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
		<div className={className}>
			<div className="space-y-2">
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
		</div>
	);
}

function DrawerHeader({
	authorName,
	showSaveButton,
	saved,
	isSaving,
	onToggleSave,
	onClose,
}: {
	authorName: string;
	showSaveButton: boolean;
	saved: boolean;
	isSaving: boolean;
	onToggleSave: () => void;
	onClose: () => void;
}) {
	return (
		<header className="flex items-center gap-3 px-4 py-3 border-b border-gray-700 shrink-0">
			<div className="flex items-center gap-3 min-w-0 justify-self-start">
				<UserAvatar name={authorName} size={32} />
				<span className="text-sm text-gray-300 truncate">{authorName}</span>
			</div>
			<div className="ml-auto flex items-center gap-2">
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
						<span className="hidden sm:inline">
							{isSaving ? "Saving…" : saved ? "Saved" : "Save"}
						</span>
					</button>
				)}
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
			<div className="flex flex-col sm:flex-row gap-4">
				<div className="relative w-full sm:w-48 h-36 sm:h-28 rounded-xl overflow-hidden bg-gray-700 shrink-0">
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
					<h1 className="text-xl font-bold text-white sm:truncate">{title}</h1>
					<div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-400">
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
	portal?: boolean;
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
	portal = false,
}: QuizDetailsDrawerShellProps) {
	const queryClient = useQueryClient();
	const [saved, setSaved] = useState(() => !!initialIsSaved);

	const { mutate: toggleSave, isPending: isSaving } = useMutation({
		mutationFn: () => toggleQuizSave(quizId),
		onSuccess: (res) => {
			setSaved(res.saved);
			void queryClient.invalidateQueries({ queryKey: ["mySavedQuizzes"] });
		},
	});

	const shell = (
		<div
			className="fixed inset-0 z-50 touch-none bg-black/40 backdrop-blur-[1px] transition-opacity ease-out"
			style={backdropStyle}
			onClick={onBackdropClick}
			aria-modal
			role="dialog"
		>
			<div className="relative h-full w-full">
				<div
					className="absolute inset-0 sm:inset-auto sm:bottom-0 sm:left-0 sm:right-0 mx-auto w-full max-w-full overflow-hidden rounded-none sm:rounded-t-2xl bg-gray-800 border border-gray-700 border-b-0 shadow-2xl flex flex-col transition-transform ease-out"
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
					/>

					<div className="flex-1 min-h-0 flex">
						{/* Mobile: single scroll container from hero -> bottom */}
						<div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden bg-[#1f2937]">
							<div className="sm:hidden">
								<DrawerHero
									coverUrl={coverUrl}
									title={title}
									playsLabel={playsLabel}
									participantsLabel={participantsLabel}
								/>

								{!hideSidebar && onHostLive && typeof isHostPending === "boolean" ? (
									<DrawerActions
										quizId={quizId}
										isPending={isHostPending}
										onHostLive={onHostLive}
										isOwner={!!isOwner}
										initialVisibility={initialVisibility}
										className="px-4 pt-4"
									/>
								) : null}
							</div>

							<div className="px-4 pb-6 pt-4 sm:hidden">{content}</div>

							{/* Desktop/tablet: keep existing non-scrolling hero + inner scroll body */}
							<div className="hidden sm:flex h-full min-h-0">
								<div className="flex-1 min-w-0 flex flex-col overflow-hidden">
									<DrawerHero
										coverUrl={coverUrl}
										title={title}
										playsLabel={playsLabel}
										participantsLabel={participantsLabel}
									/>
									<div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 pb-6 pt-0">
										{content}
									</div>
								</div>

								{!hideSidebar && onHostLive && typeof isHostPending === "boolean" ? (
									<DrawerActions
										quizId={quizId}
										isPending={isHostPending}
										onHostLive={onHostLive}
										isOwner={!!isOwner}
										initialVisibility={initialVisibility}
										className="w-[260px] shrink-0 border-l border-gray-700 bg-gray-800/50 p-4"
									/>
								) : null}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);

	if (!portal) return shell;
	return <QuizDetailsDrawerPortal key={quizId}>{shell}</QuizDetailsDrawerPortal>;
}

