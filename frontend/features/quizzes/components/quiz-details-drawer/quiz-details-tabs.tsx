import { cn } from "@/lib/utils";

const TAB_BUTTON_BASE =
	"min-h-[40px] min-w-[88px] px-4 py-2.5 text-sm font-semibold transition-colors flex items-center justify-center";

export type QuizDetailsTabDef = { id: string; label: string };

export function QuizDetailsTabs({
	tabs,
	activeId,
	onChange,
	className,
}: {
	tabs: QuizDetailsTabDef[];
	activeId: string;
	onChange: (id: string) => void;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"inline-flex rounded-xl border border-gray-700 bg-gray-900 overflow-hidden",
				className,
			)}
		>
			{tabs.map((tab, index) => (
				<button
					key={tab.id}
					type="button"
					onClick={() => onChange(tab.id)}
					className={cn(
						TAB_BUTTON_BASE,
						index === 0 && "rounded-l-xl",
						index === tabs.length - 1 && "rounded-r-xl",
						activeId === tab.id
							? "bg-indigo-600/20 text-indigo-200 ring-1 ring-inset ring-indigo-500/40"
							: "text-gray-400 hover:bg-gray-800/60 hover:text-white",
					)}
				>
					{tab.label}
				</button>
			))}
		</div>
	);
}

