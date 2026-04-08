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
				className="relative w-full max-w-lg max-h-[80vh] rounded-lg bg-gray-800 border border-gray-700 shadow-2xl flex flex-col"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-center justify-between p-4 border-b border-gray-700">
					<h3 className="text-xl font-semibold text-white">Question settings</h3>
					<button
						type="button"
						onClick={onClose}
						className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
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

				<div className="flex items-center gap-3 p-4 bg-gray-800 border-t border-gray-700 rounded-b-lg">
					<button
						type="button"
						onClick={onDelete}
						disabled={!canDelete}
						className="flex items-center justify-center gap-2 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-900/50 hover:text-red-200 transition-colors flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
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

