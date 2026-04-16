"use client";

import { FileSearch } from "lucide-react";

interface ParsingProgressProps {
	stage: string;
	progress: number;
	fileName?: string;
}

export function ParsingProgress({
	stage,
	progress,
	fileName,
}: ParsingProgressProps) {
	return (
		<div className="flex flex-col gap-3 p-4 rounded-lg bg-(--app-surface-muted)/90 border border-(--app-border)">
			<div className="flex items-center gap-3">
				<div className="relative">
					<div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
						<FileSearch className="w-5 h-5 text-indigo-400 animate-pulse" />
					</div>
					<div
						className="absolute inset-0 rounded-full border-2 border-indigo-500/30 border-t-indigo-400 animate-spin"
						style={{ animationDuration: "2s" }}
					/>
				</div>
				<div className="flex-1 min-w-0">
					<p className="font-medium text-(--app-fg) truncate">
						{fileName || "Processing..."}
					</p>
					<p className="text-sm text-indigo-400">{stage}</p>
				</div>
			</div>
			<div className="h-1.5 bg-(--app-border) rounded-full overflow-hidden">
				<div
					className="h-full bg-indigo-500 rounded-full transition-all duration-300 ease-out"
					style={{ width: `${Math.min(100, progress)}%` }}
				/>
			</div>
		</div>
	);
}
