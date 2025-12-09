"use client";

import Link from "next/link";
import { CloudCheck, Loader2 } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { QuizFullDetails } from "@/features/quizzes/types";
import SettingsModal from "./settings-modal";

interface HeaderProps {
	isSaving: boolean;
}

export default function Header({ isSaving }: HeaderProps) {
	const { watch } = useFormContext<QuizFullDetails>();
	const title = watch("title");

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [focusOn, setFocusOn] = useState<"title" | null>(null);

	function openTitleModal() {
		setFocusOn("title");
		setIsModalOpen(true);
	}

	return (
		<>
			<div className="flex items-center px-4 py-2 border-b border-gray-700 bg-gray-800">
				<Link
					href="/dashboard"
					className="text-3xl mr-24 font-semibold">
					Kahoot!
				</Link>

				<div className="border border-gray-700 bg-gray-900 rounded-md pl-5 pr-2 py-2 flex items-center gap-10 hover:border-gray-500 transition-colors">
					<button
						onClick={openTitleModal}
						className={`font-semibold text-left truncate max-w-[300px] ${
							title ? "text-white" : "text-gray-400"
						}`}>
						{title || "Enter quiz title..."}
					</button>
					<button
						onClick={() => {
							setFocusOn(null);
							setIsModalOpen(true);
						}}
						className="bg-gray-300 hover:bg-white text-black px-3 py-1 rounded-sm text-sm font-semibold transition-colors">
						Settings
					</button>
				</div>

				<div className="ml-auto flex items-center gap-4">
					<div className="text-sm text-gray-400 flex items-center gap-2">
						{isSaving ? (
							<>
								<Loader2 className="w-4 h-4 animate-spin" />
								<span>Saving...</span>
							</>
						) : (
							<>
								<CloudCheck className="w-4 h-4 text-gray-400" />
								<span>Saved</span>
							</>
						)}
					</div>

					<Link
						href="/dashboard"
						className="font-semibold text-white bg-indigo-800 hover:bg-indigo-900 rounded-md px-8 py-3 transition-colors">
						Done
					</Link>
				</div>
			</div>

			{isModalOpen && (
				<SettingsModal
					focusOn={focusOn}
					onClose={() => setIsModalOpen(false)}
				/>
			)}
		</>
	);
}
