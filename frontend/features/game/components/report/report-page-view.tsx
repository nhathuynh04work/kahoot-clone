"use client";

import { Clock3, Loader2 } from "lucide-react";
import type { ReactNode } from "react";

export function ReportPageLoadingView() {
	return (
		<div className="flex items-center justify-center py-16">
			<Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
		</div>
	);
}

export function ReportPageEmptyView({
	toolbar,
	hasSearchQuery,
}: {
	toolbar: ReactNode;
	hasSearchQuery: boolean;
}) {
	return (
		<>
			{toolbar}
			<div className="text-center bg-gray-800/50 p-6 sm:p-10 rounded-lg border border-gray-700">
				<div className="mx-auto w-12 h-12 rounded-xl bg-gray-700/60 border border-gray-700 flex items-center justify-center">
					<Clock3 className="w-6 h-6 text-indigo-300" />
				</div>
				<h3 className="mt-4 text-xl font-semibold text-white">
					No sessions found
				</h3>
				<p className="text-gray-400 mt-2">
					{hasSearchQuery
						? "Try clearing the search or changing sort."
						: "Complete a quiz game to see your session snapshots and reports here."}
				</p>
			</div>
		</>
	);
}

export function ReportPageLoadedView({
	toolbar,
	reportError,
	quizError,
	children,
	pagination,
	drawer,
}: {
	toolbar: ReactNode;
	reportError: boolean;
	quizError: string | null;
	children: ReactNode;
	pagination: ReactNode;
	drawer: ReactNode | null;
}) {
	return (
		<>
			{toolbar}

			<div className="space-y-4">
				{reportError ? (
					<div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
						Failed to load reports.
					</div>
				) : null}
				{quizError ? (
					<div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
						{quizError}
					</div>
				) : null}
				{children}
			</div>

			{pagination}
			{drawer}
		</>
	);
}
