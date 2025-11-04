import { Plus } from "lucide-react";
import { optionColors } from "./options-grid";
import { useState } from "react";
import { CreateOptionDto } from "@/lib/dtos/quiz.dto";

interface PlaceholderOptionCardProps {
	index: number;
	onAdd: (payload: CreateOptionDto) => void;
	disabled: boolean;
}

export default function PlaceholderOptionCard({
	index,
	onAdd,
	disabled,
}: PlaceholderOptionCardProps) {
	const [text, setText] = useState("");

	function handleBlur() {
		const newText = text.trim();
		if (newText) {
			onAdd({ text: newText });
			setText("");
		}
	}

	return (
		<div
			className={`p-4 rounded-md border border-gray-700 bg-gray-900 flex items-center gap-3 
                       opacity-50 focus-within:opacity-100 hover:opacity-100 transition-opacity ${
							disabled ? "opacity-30 cursor-not-allowed" : ""
						}`}>
			<div
				className={`w-10 h-10 rounded-md ${
					optionColors[index % 4]
				}`}></div>

			<input
				type="text"
				value={text}
				onChange={(e) => setText(e.target.value)}
				onBlur={handleBlur}
				disabled={disabled}
				className="grow bg-transparent text-white text-lg font-medium placeholder:text-gray-500 focus:outline-none"
				placeholder={disabled ? "Adding..." : "Add option"}
			/>
			{!text && <Plus className="w-5 h-5 text-gray-500 shrink-0" />}
		</div>
	);
}
