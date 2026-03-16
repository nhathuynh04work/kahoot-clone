"use client";

import { useAiChatState } from "../hooks/use-ai-chat-state";
import { ChatHeader } from "./chat-header";
import { ChatMessageList } from "./chat-message-list";
import { ChatInput } from "./chat-input";
import { DocumentAttachMenu } from "./document-attach-menu";
import { GeneratedQuestionsCanvas } from "./generated-questions-canvas";
interface AiChatbotPanelProps {
	onClose: () => void;
	quizId?: number | null;
	onFileSelect?: (doc: { id: number; fileName: string } | null) => void;
	onAddQuestion?: (question: { text: string; options: { text: string; isCorrect: boolean }[] }) => void;
}

export function AiChatbotPanel({ onClose, quizId, onFileSelect, onAddQuestion }: AiChatbotPanelProps) {
	const state = useAiChatState({ quizId, onFileSelect, onAddQuestion });
	const currentQuestions = state.openCanvasMessageId
		? state.generatedQuestionsByMessageId[state.openCanvasMessageId] ?? []
		: [];
	const currentAddedIds: Set<string> = state.openCanvasMessageId
		? state.addedQuestionIdsByMessageId[state.openCanvasMessageId] ?? new Set<string>()
		: new Set<string>();

	return (
		<div
			className="fixed inset-0 z-50 flex flex-col bg-gray-900"
			aria-modal
			role="dialog"
		>
			<ChatHeader onClose={onClose} />

			<div className="flex-1 flex min-h-0">
				<div className="flex-1 flex flex-col min-w-0">
					<div
						ref={state.scrollRef}
						className="flex-1 overflow-y-auto px-4 py-6"
					>
						<ChatMessageList
							messages={state.messages}
							isGenerating={state.isGenerating}
							isHistoryLoading={state.isHistoryLoading}
							onOpenCanvas={state.setOpenCanvasMessageId}
						/>
					</div>
					<ChatInput
						input={state.input}
						onInputChange={state.setInput}
						onSend={() => state.sendMessage(state.input)}
						selectedDoc={state.selectedDoc}
						onRemoveDoc={() => state.handleSelectDocument(null)}
						onAttachClick={() => state.setDocPopupOpen((open) => !open)}
						attachButtonRef={state.attachButtonRef}
						isGenerating={state.isGenerating}
					/>
				</div>

				{state.openCanvasMessageId && currentQuestions.length > 0 && (
					<GeneratedQuestionsCanvas
						questions={currentQuestions}
						onAddToQuiz={state.handleAddToQuiz}
						onUpdateQuestion={state.handleUpdateQuestion}
						addedIds={currentAddedIds}
						onClose={() => state.setOpenCanvasMessageId(null)}
						className="w-[380px] shrink-0"
					/>
				)}
			</div>

			<DocumentAttachMenu
				open={state.docPopupOpen}
				onClose={() => state.setDocPopupOpen(false)}
				anchorRef={state.attachButtonRef}
				documents={state.documents}
				selectedId={state.selectedDoc?.id ?? null}
				onSelect={state.handleSelectDocument}
				onUpload={state.handleUpload}
				uploadPending={state.uploadPending}
				parsingStage={state.parsingStage}
				usedBytes={state.usedBytes}
				limitBytes={state.limitBytes}
			/>
		</div>
	);
}
