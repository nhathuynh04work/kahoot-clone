"use client";

import { X, Copy, Trash2 } from "lucide-react";
import { QuestionSettingsForm } from "./question-settings-form";

export function QuestionSettingsModal({
	open,
	onClose,
	questionIndex,
	canDelete,
	onDelete,
	onDuplicate,
	canUseVipQuestionTypes,
}: {
	open: boolean;
	onClose: () => void;
	questionIndex: number;
	canDelete: boolean;
	onDelete: () => void;
	onDuplicate: () => void;
	canUseVipQuestionTypes: boolean;
}) {
	if (!open) return null;

	return (
		<div
			className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm"
			onClick={onClose}
			role="dialog"
			aria-modal="true"
			aria-label="Question settings"
		>
			<div
				className="relative w-full max-w-lg max-h-[80vh] rounded-lg bg-(--app-surface) border border-(--app-border) shadow-2xl flex flex-col text-(--app-fg)"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-center justify-between p-4 border-b border-(--app-border)">
					<h3 className="text-xl font-semibold text-(--app-fg)">Question settings</h3>
					<button
						type="button"
						onClick={onClose}
						className="p-1 rounded-full text-(--app-fg-muted) hover:bg-(--app-surface-muted) hover:text-(--app-fg) transition-colors"
						aria-label="Close"
					>
						<X className="w-5 h-5" aria-hidden />
					</button>
				</div>

				<div className="flex-1 min-h-0 overflow-y-auto p-6">
					<QuestionSettingsForm
						questionIndex={questionIndex}
						canUseVipQuestionTypes={canUseVipQuestionTypes}
					/>
				</div>

				<div className="flex items-center gap-3 p-4 bg-(--app-surface) border-t border-(--app-border) rounded-b-lg">
					<button
						type="button"
						onClick={onDelete}
						disabled={!canDelete}
						className="flex items-center justify-center gap-2 text-(--app-fg) font-semibold py-2 px-4 rounded-md border border-(--app-border) hover:bg-red-500/10 hover:text-red-600 transition-colors flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<Trash2 className="w-4 h-4" aria-hidden />
						Delete
					</button>
					<button
						type="button"
						onClick={onDuplicate}
						className="flex items-center justify-center gap-2 text-white font-semibold py-2 px-4 rounded-md bg-indigo-600 hover:bg-indigo-500 transition-colors flex-1"
					>
						<Copy className="w-4 h-4" aria-hidden />
						Duplicate
					</button>
				</div>
			</div>
		</div>
	);
}

