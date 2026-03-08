"use client";

import Link from "next/link";
import { CloudCheck, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { QuizFullDetails } from "@/features/quizzes/types";
import SettingsModal from "./settings-modal";
import { AiChatbotPanel } from "@/features/ai-quiz-chat";

interface HeaderProps {
	isSaving: boolean;
}

export default function Header({ isSaving }: HeaderProps) {
	const { watch } = useFormContext<QuizFullDetails>();
	const title = watch("title");

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);

	function openTitleModal() {
		setIsModalOpen(true);
	}

	return (
		<>
			<div className="h-[58px] flex items-center gap-4 px-4 border-b border-gray-700 bg-gray-800 text-white shrink-0">
				<Link
					href="/dashboard"
					className="text-xl font-semibold shrink-0">
					Kahoot!
				</Link>

				<div className="flex-1 min-w-0 flex justify-center">
					<div className="w-full max-w-md border border-gray-700 bg-gray-900 rounded-lg px-4 py-2 flex items-center gap-3 hover:border-gray-500 transition-colors">
						<button
							onClick={openTitleModal}
							className={`font-semibold text-left truncate flex-1 min-w-0 text-sm ${
								title ? "text-white" : "text-gray-400"
							}`}>
							{title || "Quiz title"}
						</button>
						<button
							onClick={() => setIsModalOpen(true)}
							className="bg-gray-700 hover:bg-gray-600 text-white px-2.5 py-1 rounded text-xs font-semibold transition-colors shrink-0"
							aria-label="Quiz settings">
							Settings
						</button>
					</div>
				</div>

				<div className="ml-auto flex items-center gap-2 shrink-0">
					<button
						onClick={() => setIsAiPanelOpen(true)}
						className="p-2 rounded-lg text-indigo-400 hover:text-indigo-300 hover:bg-gray-700/70 transition-colors"
						aria-label="Generate with AI">
						<Sparkles className="w-5 h-5" />
					</button>

					<div
						className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-400"
						aria-label={isSaving ? "Saving" : "Saved"}>
						{isSaving ? (
							<Loader2 className="w-4 h-4 animate-spin" />
						) : (
							<CloudCheck className="w-4 h-4" />
						)}
					</div>

					<Link
						href="/dashboard"
						className="font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg px-4 py-2 text-sm transition-colors">
						Done
					</Link>
				</div>
			</div>

			{isModalOpen && (
				<SettingsModal onClose={() => setIsModalOpen(false)} />
			)}

			{isAiPanelOpen && (
				<AiChatbotPanel onClose={() => setIsAiPanelOpen(false)} />
			)}
		</>
	);
}
