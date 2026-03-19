"use client";

import { useFormContext } from "react-hook-form";
import {
	Clock,
	Star,
	ChevronLeft,
	ChevronRight,
	Copy,
	Trash2,
} from "lucide-react";
import { QuizFullDetails } from "@/features/quizzes/types";
import { Select } from "@/components/ui/select";

interface QuestionSettingsSidebarProps {
	questionIndex: number;
	isOpen: boolean;
	onToggle: () => void;
	onDelete: () => void;
	onDuplicate: () => void;
	canDelete: boolean;
}

export function QuestionSettingsSidebar({
	questionIndex,
	isOpen,
	onToggle,
	onDelete,
	onDuplicate,
	canDelete,
}: QuestionSettingsSidebarProps) {
	const { setValue, watch } = useFormContext<QuizFullDetails>();

	const timeLimit = watch(`questions.${questionIndex}.timeLimit`) ?? 30000;
	const points = watch(`questions.${questionIndex}.points`) ?? 1000;

	return (
		<div
			className={`relative shrink-0 bg-gray-800/50 border-l border-gray-700 transition-all duration-300 ease-in-out flex flex-col ${
				isOpen ? "w-72" : "w-0"
			}`}>
			<button
				onClick={onToggle}
				className="absolute top-1/2 left-0 z-10 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-gray-600 hover:bg-gray-500 text-white rounded-full shadow-lg transition-colors">
				{isOpen ? (
					<ChevronRight className="w-5 h-5" />
				) : (
					<ChevronLeft className="w-5 h-5" />
				)}
			</button>

			<div
				className={`grow h-full p-5 overflow-y-auto min-w-[18rem] ${
					!isOpen && "hidden"
				}`}>
				{/* Time Limit Select */}
				<div className="mb-6">
					<label className="text-sm font-semibold text-gray-300 flex items-center mb-2">
						<Clock className="w-4 h-4 mr-2" />
						Time limit
					</label>
					<Select
						value={String(timeLimit)}
						onValueChange={(v) =>
							setValue(
								`questions.${questionIndex}.timeLimit`,
								parseInt(v, 10),
								{ shouldDirty: true, shouldTouch: true },
							)
						}
						options={[
							{ value: "5000", label: "5 seconds" },
							{ value: "10000", label: "10 seconds" },
							{ value: "20000", label: "20 seconds" },
							{ value: "30000", label: "30 seconds" },
							{ value: "60000", label: "1 minute" },
							{ value: "120000", label: "2 minutes" },
						]}
						ariaLabel="Time limit"
						buttonClassName="bg-gray-700 border-gray-600 rounded-md p-3 focus:ring-indigo-500"
						menuClassName="border-gray-600"
					/>
				</div>

				{/* Points Select */}
				<div className="mb-6">
					<label className="text-sm font-semibold text-gray-300 flex items-center mb-2">
						<Star className="w-4 h-4 mr-2" />
						Points
					</label>
					<Select
						value={String(points)}
						onValueChange={(v) =>
							setValue(
								`questions.${questionIndex}.points`,
								parseInt(v, 10),
								{ shouldDirty: true, shouldTouch: true },
							)
						}
						options={[
							{ value: "0", label: "No points (0)" },
							{ value: "1000", label: "Standard (1000)" },
							{ value: "2000", label: "Double points (2000)" },
						]}
						ariaLabel="Points"
						buttonClassName="bg-gray-700 border-gray-600 rounded-md p-3 focus:ring-indigo-500"
						menuClassName="border-gray-600"
					/>
				</div>
			</div>

			{/* Bottom Actions */}
			<div
				className={`min-w-[18rem] p-4 border-t border-gray-700 ${
					!isOpen && "hidden"
				}`}>
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
			</div>
		</div>
	);
}
