"use client";

import {
	X,
	Loader2,
	Play,
	Pencil,
	ChevronRight,
	Video,
	Users,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { QuizDetailsTabs } from "./quiz-details-tabs";
import { UserAvatar } from "@/components/ui/user-avatar";

function DrawerHeader({
	authorName,
	onClose,
}: {
	authorName: string;
	onClose: () => void;
}) {
	return (
		<header className="flex items-center justify-between gap-4 px-4 py-3 border-b border-gray-700 shrink-0">
			<div className="flex items-center gap-3 min-w-0">
				<UserAvatar name={authorName} size={32} />
				<span className="text-sm text-gray-300 truncate">{authorName}</span>
			</div>
			<button
				type="button"
				onClick={onClose}
				className="p-2 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors shrink-0"
				aria-label="Close"
			>
				<X className="w-5 h-5" />
			</button>
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
}: {
	quizId: number;
	isPending: boolean;
	onHostLive: () => void;
}) {
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
			</div>
		</aside>
	);
}

const DRAWER_TABS = [
	{ id: "questions", label: "Questions" },
	{ id: "reports", label: "Reports" },
] as const;

export type QuizDetailsDrawerShellProps = {
	authorName: string;
	onClose: () => void;
	coverUrl?: string;
	title: string;
	playsLabel: string;
	participantsLabel: string;
	quizId: number;
	isHostPending: boolean;
	onHostLive: () => void;
	activeTabId: string;
	onTabChange: (id: string) => void;
	backdropStyle: CSSProperties;
	panelStyle: CSSProperties;
	onBackdropClick: () => void;
	tabContent: ReactNode;
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
	activeTabId,
	onTabChange,
	backdropStyle,
	panelStyle,
	onBackdropClick,
	tabContent,
}: QuizDetailsDrawerShellProps) {
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
				<DrawerHeader authorName={authorName} onClose={onClose} />

				<div className="flex-1 flex min-h-0">
					<div className="flex-1 min-w-0 flex flex-col overflow-hidden">
						<DrawerHero
							coverUrl={coverUrl}
							title={title}
							playsLabel={playsLabel}
							participantsLabel={participantsLabel}
						/>

						<div className="relative z-20 shrink-0 px-4 pt-3 pb-1 bg-[#1f2937]">
							<QuizDetailsTabs
								tabs={[...DRAWER_TABS]}
								activeId={activeTabId}
								onChange={onTabChange}
							/>
						</div>

						<div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 pb-4 pt-0 bg-[#1f2937]">
							{tabContent}
						</div>
					</div>

					<DrawerSidebar
						quizId={quizId}
						isPending={isHostPending}
						onHostLive={onHostLive}
					/>
				</div>
			</div>
		</div>
	);
}

