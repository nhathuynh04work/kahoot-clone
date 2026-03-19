"use client";

import { useMemo } from "react";
import {
	Calendar,
	CheckCircle2,
	Target,
	ChevronRight,
	Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { SessionListItem } from "@/features/game/api/server-actions";
import { cn } from "@/lib/utils";
import { formatDate, formatDurationMs } from "@/lib/format";
import { ReportMiniAccuracyChart } from "./mini-accuracy-chart";

function MetricChip({
	icon: Icon,
	label,
	value,
	className,
}: {
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	value: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5",
				"bg-gray-900/40 border-gray-700 text-gray-300",
				className,
			)}
		>
			<Icon className="w-4 h-4 text-gray-400" />
			<div className="text-xs leading-none">
				<div className="text-gray-400">{label}</div>
				<div className="mt-0.5 text-white font-semibold tabular-nums">
					{value}
				</div>
			</div>
		</div>
	);
}

export interface ReportSessionCardProps {
	item: SessionListItem;
	href?: string;
	onClick?: () => void;
	onQuizTitleClick?: () => void;
	quizTitleLoading?: boolean;
}

export function ReportSessionCard({
	item,
	href,
	onClick,
	onQuizTitleClick,
	quizTitleLoading = false,
}: ReportSessionCardProps) {
	const router = useRouter();
	const endedIso = item.endedAt ?? null;
	const createdIso = item.createdAt ?? null;
	const endedAt = useMemo(
		() => (endedIso ? new Date(endedIso).getTime() : null),
		[endedIso],
	);
	const createdAt = useMemo(
		() => (createdIso ? new Date(createdIso).getTime() : null),
		[createdIso],
	);
	const durationMs =
		endedAt !== null && createdAt !== null ? endedAt - createdAt : null;

	const StatusIcon = CheckCircle2;
	const statusText = "Completed";
	const statusTone = "text-emerald-500";

	const accuracyPct = item.avgAccuracy * 100;
	const displayTitle = item.quizTitle?.trim() ? item.quizTitle : "Untitled Quiz";

	const handleCardClick = () => {
		if (href) {
			router.push(href);
			return;
		}
		onClick?.();
	};

	const handleCardKeyDown: React.KeyboardEventHandler<HTMLElement> = (e) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			handleCardClick();
		}
	};

	const CardInner = (
		<div className="group rounded-lg border border-gray-700 bg-gray-800/50 overflow-hidden transition-colors hover:bg-gray-800 hover:border-indigo-500/40 focus-within:border-indigo-500/60">
			<div className="p-4">
				<div className="flex items-start gap-4">
					<div className="shrink-0">
						<div className="w-12 h-12 rounded-lg bg-gray-700/60 border border-gray-700 flex items-center justify-center group-hover:border-indigo-500/30 transition-colors">
							<StatusIcon className={cn("w-6 h-6", statusTone)} />
						</div>
					</div>

					<div className="min-w-0 flex-1">
						<div className="flex items-start justify-between gap-3">
							<div className="min-w-0">
								<div className="flex items-center gap-2">
									{onQuizTitleClick ? (
										<button
											type="button"
											disabled={quizTitleLoading}
											onClick={(e) => {
												e.stopPropagation();
												onQuizTitleClick();
											}}
											className={cn(
												"text-white font-semibold truncate text-left",
												"hover:text-indigo-300 transition-colors",
												"disabled:opacity-60 disabled:cursor-not-allowed",
											)}
											aria-label={`Open quiz details: ${displayTitle}`}
										>
											{displayTitle}
										</button>
									) : (
										<p className="text-white font-semibold truncate">
											{displayTitle}
										</p>
									)}
									<span
										className={cn(
											"shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border",
											"bg-gray-900/40 border-gray-700",
											statusTone,
										)}
									>
										{statusText}
									</span>
								</div>
								<div className="mt-1 flex items-center gap-2 text-sm text-gray-400">
									<Calendar className="w-4 h-4 text-gray-500" />
									<span className="truncate">
										{formatDate(item.endedAt ?? item.createdAt)}
									</span>
									<span className="text-gray-600">•</span>
									<span className="text-gray-400 tabular-nums">
										{formatDurationMs(durationMs)}
									</span>
								</div>
							</div>

							<div className="shrink-0 hidden sm:block">
								<ReportMiniAccuracyChart value={item.avgAccuracy} />
							</div>
						</div>

						<div className="mt-3 flex flex-wrap items-center gap-2">
							<MetricChip
								icon={Users}
								label="Players"
								value={item.totalPlayers}
							/>
							<MetricChip
								icon={Target}
								label="Accuracy"
								value={`${accuracyPct.toFixed(1)}%`}
							/>

							<div className="ml-auto flex items-center gap-2 text-gray-400 group-hover:text-indigo-300 transition-colors">
								<span className="text-sm font-medium">Details</span>
								<ChevronRight className="w-4 h-4" />
							</div>
						</div>

						<div className="mt-3 sm:hidden">
							<ReportMiniAccuracyChart value={item.avgAccuracy} />
						</div>
					</div>
				</div>
			</div>
		</div>
	);

	return (
		<div
			role="button"
			tabIndex={0}
			onClick={handleCardClick}
			onKeyDown={handleCardKeyDown}
			aria-label={`View session details: ${displayTitle}`}
			className="block text-left w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 rounded-lg cursor-pointer"
		>
			{CardInner}
		</div>
	);
}
