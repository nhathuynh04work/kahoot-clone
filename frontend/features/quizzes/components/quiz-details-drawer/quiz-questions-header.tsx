import { Eye, EyeOff } from "lucide-react";

export function QuizQuestionsHeader({
	count,
	showAnswers,
	onToggleShowAnswers,
}: {
	count: number;
	showAnswers: boolean;
	onToggleShowAnswers: () => void;
}) {
	return (
		<div className="sticky top-0 z-20 left-0 right-0 flex min-h-[56px] flex-wrap items-center justify-between gap-3 -mx-4 px-4 py-3 mb-3 bg-(--app-surface) isolate transform-[translateZ(0)]">
			<h2 className="text-base font-semibold text-(--app-fg)">Questions ({count})</h2>
			<button
				type="button"
				onClick={onToggleShowAnswers}
				className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-(--app-fg-muted) hover:bg-(--app-surface-muted) hover:text-(--app-fg) transition-colors"
			>
				{showAnswers ? (
					<EyeOff className="w-4 h-4" />
				) : (
					<Eye className="w-4 h-4" />
				)}
				{showAnswers ? "Hide answers" : "Show answers"}
			</button>
		</div>
	);
}

