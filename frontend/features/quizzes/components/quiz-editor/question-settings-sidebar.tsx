"use client";

import { useFormContext } from "react-hook-form";
import {
	ChevronLeft,
	ChevronRight,
	Copy,
	Trash2,
} from "lucide-react";
import { QuizFullDetails } from "@/features/quizzes/types";
import { cn } from "@/lib/utils";
import { QuestionSettingsForm } from "./question-settings-form";

interface QuestionSettingsSidebarProps {
	questionIndex: number;
	isOpen: boolean;
	onToggle: () => void;
	onDelete: () => void;
	onDuplicate: () => void;
	canDelete: boolean;
	canUseVipQuestionTypes: boolean;
	variant?: "desktopSidebar" | "mobileSheet";
	onRequestClose?: () => void;
}

export function QuestionSettingsSidebar({
	questionIndex,
	isOpen,
	onToggle,
	onDelete,
	onDuplicate,
	canDelete,
	canUseVipQuestionTypes,
	variant = "desktopSidebar",
	onRequestClose,
}: QuestionSettingsSidebarProps) {
	useFormContext<QuizFullDetails>();

	return (
		<div
			className={cn(
				"relative shrink-0 bg-gray-800/50 border-gray-700 flex flex-col",
				variant === "desktopSidebar"
					? `border-l transition-all duration-300 ease-in-out ${isOpen ? "w-80" : "w-0"}`
					: "w-full border-0",
			)}
		>
			{variant === "desktopSidebar" ? (
				<button
					onClick={onToggle}
					className="absolute top-1/2 left-0 z-10 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-gray-600 hover:bg-gray-500 text-white rounded-full shadow-lg transition-colors"
				>
					{isOpen ? (
						<ChevronRight className="w-5 h-5" />
					) : (
						<ChevronLeft className="w-5 h-5" />
					)}
				</button>
			) : null}

			<div
				className={cn(
					"grow h-full overflow-y-auto",
					variant === "desktopSidebar" ? "p-5 min-w-[20rem]" : "p-0 min-w-0",
					variant === "desktopSidebar" && !isOpen && "hidden",
				)}
			>
				<QuestionSettingsForm
					questionIndex={questionIndex}
					canUseVipQuestionTypes={canUseVipQuestionTypes}
					className={variant === "desktopSidebar" ? "" : "p-4"}
				/>
			</div>

			<div
				className={cn(
					"p-4 border-t border-gray-700",
					variant === "desktopSidebar" && "min-w-[20rem]",
					variant === "desktopSidebar" && !isOpen && "hidden",
				)}
			>
				<div className="flex items-center gap-3">
					<button
						onClick={onDelete}
						disabled={!canDelete}
						className="flex items-center justify-center gap-2 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-900/50 hover:text-red-200 transition-colors flex-1 disabled:opacity-50 disabled:cursor-not-allowed">
						<Trash2 className="w-4 h-4" />
						Delete
					</button>
					<button
						onClick={onDuplicate}
						className="flex items-center justify-center gap-2 text-white font-semibold py-2 px-4 rounded-md bg-indigo-600 hover:bg-indigo-500 transition-colors flex-1"
						title="Duplicate">
						<Copy className="w-4 h-4" />
						Duplicate
					</button>
				</div>

				{variant === "mobileSheet" ? (
					<button
						type="button"
						onClick={() => onRequestClose?.()}
						className="mt-3 w-full py-2 rounded-md border border-gray-700 bg-gray-900/30 hover:bg-gray-800/50 text-sm font-semibold text-gray-200 transition-colors"
					>
						Close
					</button>
				) : null}
			</div>
		</div>
	);
}
