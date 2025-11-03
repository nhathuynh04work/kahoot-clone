"use client";

import { QuestionWithOptions } from "@/lib/types/quiz";
import {
	Clock,
	Star,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";

interface QuestionSettingsSidebarProps {
	question: QuestionWithOptions | undefined;
	isOpen: boolean;
	onToggle: () => void;
}

// Reusable component for a dropdown-style select
const SettingsSelect = ({
	label,
	icon: Icon,
	value,
}: {
	label: string;
	icon: React.ElementType;
	value: string;
}) => (
	<div className="mb-8">
		<label className="text-sm font-semibold text-gray-300 flex items-center mb-2">
			<Icon className="w-4 h-4 mr-2" />
			{label}
		</label>
		<button className="w-full flex justify-between items-center p-3 bg-gray-700 rounded-md text-white">
			<span>{value}</span>
			<ChevronDown className="w-5 h-5" />
		</button>
	</div>
);

export default function QuestionSettingsSidebar({
	question,
	isOpen,
	onToggle,
}: QuestionSettingsSidebarProps) {
	return (
		<div
			className={`
                relative shrink-0 bg-gray-800 border-l border-gray-700
                transition-all duration-300 ease-in-out flex flex-col
                ${isOpen ? "w-72" : "w-0"}
            `}>
			<button
				onClick={onToggle}
				className="absolute top-1/2 left-0 z-10 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-gray-600 hover:bg-gray-500 text-white rounded-full shadow-lg transition-colors"
				title={isOpen ? "Close settings" : "Open settings"}>
				{isOpen ? (
					<ChevronRight className="w-5 h-5" />
				) : (
					<ChevronLeft className="w-5 h-5" />
				)}
			</button>

			<div className="grow h-full p-6 overflow-y-auto min-w-72">
				<SettingsSelect
					label="Time limit"
					icon={Clock}
					value="20 seconds"
				/>

				<SettingsSelect
					label="Points"
					icon={Star}
					value="Standard (1000)"
				/>
			</div>

			<div className="min-w-72 p-4 border-t border-gray-700">
				<div className="flex items-center gap-4">
					<button className="flex items-center justify-center gap-2 text-white font-semibold py-2 px-4 rounded-md hover:bg-gray-700 transition-colors flex-1 cursor-pointer">
						Delete
					</button>

					<button className="flex items-center justify-center gap-2 text-white font-semibold py-2 px-4 rounded-md bg-indigo-800 hover:bg-indigo-900 transition-colors flex-1 cursor-pointer">
						Duplicate
					</button>
				</div>
			</div>
		</div>
	);
}
