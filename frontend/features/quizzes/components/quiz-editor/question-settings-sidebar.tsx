"use client";

import { useFormContext } from "react-hook-form";
import {
	Clock,
	Star,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	Copy,
	Trash2,
} from "lucide-react";
import { QuizFullDetails } from "@/features/quizzes/types";

interface QuestionSettingsSidebarProps {
	questionIndex: number;
	isOpen: boolean;
	onToggle: () => void;
	onDelete: () => void;
	canDelete: boolean;
}

export default function QuestionSettingsSidebar({
	questionIndex,
	isOpen,
	onToggle,
	onDelete,
	canDelete,
}: QuestionSettingsSidebarProps) {
	const { register } = useFormContext<QuizFullDetails>();

	return (
		<div
			className={`relative shrink-0 bg-gray-800 border-l border-gray-700 transition-all duration-300 ease-in-out flex flex-col ${
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
				className={`grow h-full p-6 overflow-y-auto min-w-[18rem] ${
					!isOpen && "hidden"
				}`}>
				{/* Time Limit Select */}
				<div className="mb-8">
					<label className="text-sm font-semibold text-gray-300 flex items-center mb-2">
						<Clock className="w-4 h-4 mr-2" />
						Time limit
					</label>
					<div className="relative">
						<select
							{...register(
								`questions.${questionIndex}.timeLimit`,
								{ valueAsNumber: true }
							)}
							className="w-full appearance-none p-3 bg-gray-700 rounded-md text-white outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
							<option value={5000}>5 seconds</option>
							<option value={10000}>10 seconds</option>
							<option value={20000}>20 seconds</option>
							<option value={30000}>30 seconds</option>
							<option value={60000}>1 minute</option>
							<option value={120000}>2 minutes</option>
						</select>
						<ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
					</div>
				</div>

				{/* Points Select */}
				<div className="mb-8">
					<label className="text-sm font-semibold text-gray-300 flex items-center mb-2">
						<Star className="w-4 h-4 mr-2" />
						Points
					</label>
					<div className="relative">
						<select
							{...register(`questions.${questionIndex}.points`, {
								valueAsNumber: true,
							})}
							className="w-full appearance-none p-3 bg-gray-700 rounded-md text-white outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
							<option value={0}>No points (0)</option>
							<option value={1000}>Standard (1000)</option>
							<option value={2000}>Double points (2000)</option>
						</select>
						<ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
					</div>
				</div>
			</div>

			{/* Bottom Actions */}
			<div
				className={`min-w-[18rem] p-4 border-t border-gray-700 ${
					!isOpen && "hidden"
				}`}>
				<div className="flex items-center gap-4">
					<button
						onClick={onDelete}
						disabled={!canDelete}
						className="flex items-center justify-center gap-2 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-900/50 hover:text-red-200 transition-colors flex-1 disabled:opacity-50 disabled:cursor-not-allowed">
						<Trash2 className="w-4 h-4" />
						Delete
					</button>
					<button
						className="flex items-center justify-center gap-2 text-white font-semibold py-2 px-4 rounded-md bg-indigo-800 hover:bg-indigo-900 transition-colors flex-1 disabled:opacity-50"
						title="Duplicate (Coming Soon)">
						<Copy className="w-4 h-4" />
						Duplicate
					</button>
				</div>
			</div>
		</div>
	);
}
