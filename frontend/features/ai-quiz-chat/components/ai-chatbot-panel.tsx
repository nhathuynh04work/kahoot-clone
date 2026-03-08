"use client";

import { useAiChatState } from "../hooks/use-ai-chat-state";
import { ChatHeader } from "./chat-header";
import { ChatMessageList } from "./chat-message-list";
import { ChatInput } from "./chat-input";
import { DocumentAttachMenu } from "./document-attach-menu";
import { GeneratedQuestionsCanvas } from "./generated-questions-canvas";
import { MAX_TOTAL_STORAGE_BYTES } from "@/features/documents/lib/constants";

interface AiChatbotPanelProps {
	onClose: () => void;
	onFileSelect?: (doc: { id: number; fileName: string } | null) => void;
}

export function AiChatbotPanel({ onClose, onFileSelect }: AiChatbotPanelProps) {
	const state = useAiChatState({ onFileSelect });
	const currentQuestions = state.openCanvasMessageId
		? state.generatedQuestionsByMessageId[state.openCanvasMessageId] ?? []
		: [];
	const currentAddedIds = state.openCanvasMessageId
		? state.addedQuestionIdsByMessageId[state.openCanvasMessageId] ?? new Set()
		: new Set();

	return (
		<div
			className="fixed inset-0 z-50 flex flex-col bg-gray-950"
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
				mockDocuments={state.mockDocuments}
				selectedId={state.selectedDoc?.id ?? null}
				onSelect={state.handleSelectDocument}
				onUploadClick={state.handleMockUpload}
				uploadPending={state.uploadPending}
				usedBytes={state.mockDocuments.reduce((a, d) => a + d.fileSize, 0)}
				limitBytes={MAX_TOTAL_STORAGE_BYTES}
			/>
		</div>
	);
}
