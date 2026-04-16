"use client";

import Link from "next/link";
import { CloudCheck, Loader2, Settings, Sparkles } from "lucide-react";
import { useState } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { QuizFullDetails } from "@/features/quizzes/types";
import type { GeneratedQuestion } from "@/features/ai-quiz-chat/api/client-actions";
import { SettingsModal } from "./settings-modal";
import { AiChatbotPanel } from "@/features/ai-quiz-chat";
import { AppLogo } from "@/components/layout/app-logo";

interface HeaderProps {
	isSaving: boolean;
	onAiPanelOpenChange?: (open: boolean) => void;
}

export function Header({ isSaving, onAiPanelOpenChange }: HeaderProps) {
	const { watch, control } = useFormContext<QuizFullDetails>();
	const title = watch("title");
	const questions = watch("questions") ?? [];
	const { append } = useFieldArray({ control, name: "questions" });

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);

	const handleAddQuestion = (gen: GeneratedQuestion) => {
		const lastSortOrder =
			questions.length > 0 ? questions[questions.length - 1]?.sortOrder ?? -1 : -1;
		const newId = Date.now() * -1;
		const base = {
			id: newId,
			quizId: watch("id"),
			text: gen.text,
			timeLimit: 20000,
			points: 1000,
			imageUrl: undefined,
			sortOrder: lastSortOrder + 1,
		};

		if (gen.type === "MULTIPLE_CHOICE") {
			const nCorrect = gen.options.filter((o) => o.isCorrect).length;
			append({
				...base,
				type: "MULTIPLE_CHOICE" as const,
				onlyOneCorrect: nCorrect === 1,
				options: gen.options.map((o, i) => ({
					id: newId * 10 - i,
					questionId: newId,
					text: o.text,
					isCorrect: o.isCorrect,
					sortOrder: i,
				})),
			});
			return;
		}
		if (gen.type === "TRUE_FALSE") {
			append({
				...base,
				type: "TRUE_FALSE" as const,
				options: [
					{
						id: newId * 10,
						questionId: newId,
						text: "True",
						isCorrect: gen.correctIsTrue,
						sortOrder: 0,
					},
					{
						id: newId * 10 - 1,
						questionId: newId,
						text: "False",
						isCorrect: !gen.correctIsTrue,
						sortOrder: 1,
					},
				],
			});
			return;
		}
		if (gen.type === "SHORT_ANSWER") {
			append({
				...base,
				type: "SHORT_ANSWER" as const,
				options: [],
				correctText: gen.correctText,
			});
			return;
		}
		append({
			...base,
			type: "NUMBER_INPUT" as const,
			options: [],
			allowRange: true,
			correctNumber: gen.correctNumber,
			rangeProximity: gen.rangeProximity,
		});
	};

	function openTitleModal() {
		setIsModalOpen(true);
	}

	return (
		<>
			<div className="h-[58px] flex items-center gap-4 px-4 border-b border-(--app-border) bg-(--app-surface) text-(--app-fg) shrink-0">
				<Link
					href="/library/quizzes"
					className="text-xl font-extrabold shrink-0 tracking-tight">
					<AppLogo />
				</Link>

				<div className="hidden md:flex flex-1 min-w-0 justify-center">
					<div className="w-full max-w-md border border-(--app-border) bg-(--app-bg) rounded-lg px-4 py-2 flex items-center gap-3 hover:border-indigo-500/40 transition-colors">
						<button
							onClick={openTitleModal}
							className={`font-semibold text-left truncate flex-1 min-w-0 text-sm ${
								title ? "text-(--app-fg)" : "text-(--app-fg-muted)"
							}`}>
							{title || "Quiz title"}
						</button>
						<button
							onClick={() => setIsModalOpen(true)}
							className="bg-(--app-surface-muted) hover:bg-(--app-surface-muted) text-(--app-fg) px-2.5 py-1 rounded text-xs font-semibold transition-colors shrink-0 border border-(--app-border)"
							aria-label="Quiz settings">
							Settings
						</button>
					</div>
				</div>

				<div className="ml-auto flex items-center gap-2 shrink-0">
					<button
						type="button"
						onClick={() => setIsModalOpen(true)}
						className="p-2 rounded-lg text-(--app-fg-muted) hover:text-(--app-fg) hover:bg-(--app-surface-muted) transition-colors md:hidden"
						aria-label="Quiz settings"
					>
						<Settings className="w-5 h-5" aria-hidden />
					</button>

					<button
						onClick={() => {
							setIsAiPanelOpen(true);
							onAiPanelOpenChange?.(true);
						}}
						className="p-2 rounded-lg text-indigo-500 hover:text-indigo-600 hover:bg-(--app-surface-muted) transition-colors"
						aria-label="Generate with AI">
						<Sparkles className="w-5 h-5" />
					</button>

					<div
						className="hidden md:flex items-center justify-center w-9 h-9 rounded-lg text-(--app-fg-muted)"
						aria-label={isSaving ? "Saving" : "Saved"}>
						{isSaving ? (
							<Loader2 className="w-4 h-4 animate-spin" />
						) : (
							<CloudCheck className="w-4 h-4" />
						)}
					</div>

					<Link
						href="/library/quizzes"
						className="font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg px-4 py-2 text-sm transition-colors">
						Done
					</Link>
				</div>
			</div>

			{isModalOpen && (
				<SettingsModal onClose={() => setIsModalOpen(false)} />
			)}

			{isAiPanelOpen && (
				<AiChatbotPanel
					onClose={() => {
						setIsAiPanelOpen(false);
						onAiPanelOpenChange?.(false);
					}}
					quizId={watch("id")}
					onAddQuestion={handleAddQuestion}
				/>
			)}
		</>
	);
}
