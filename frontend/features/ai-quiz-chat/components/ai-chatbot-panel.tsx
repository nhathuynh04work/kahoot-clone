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
	const {
		docPopupOpen,
		setDocPopupOpen,
		attachButtonRef,
		ownedDocumentsForMenu,
		savedDocumentsForMenu,
		selectedDoc,
		messages,
		input,
		isGenerating,
		isHistoryLoading,
		scrollRef,
		openCanvasMessageId,
		generatedQuestionsByMessageId,
		addedQuestionIdsByMessageId,
		setOpenCanvasMessageId,
		setInput,
		sendMessage,
		handleAddToQuiz,
		handleUpdateQuestion,
		handleSelectDocument,
		handleUpload,
		uploadPending,
		activeParsingDocId,
		parsingStageText,
		parsingProgress,
		usedBytes,
		remainingBytes,
		limitBytes,
	} = state;
	const currentQuestions = openCanvasMessageId
		? generatedQuestionsByMessageId[openCanvasMessageId] ?? []
		: [];
	const currentAddedIds: Set<string> = openCanvasMessageId
		? addedQuestionIdsByMessageId[openCanvasMessageId] ?? new Set<string>()
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
						ref={scrollRef}
						className="flex-1 overflow-y-auto px-4 py-6"
					>
						<ChatMessageList
							messages={messages}
							isGenerating={isGenerating}
							isHistoryLoading={isHistoryLoading}
							onOpenCanvas={setOpenCanvasMessageId}
						/>
					</div>
					<ChatInput
						input={input}
						onInputChange={setInput}
						onSend={() => sendMessage(input)}
						selectedDoc={selectedDoc}
						onRemoveDoc={() => handleSelectDocument(null)}
						onAttachClick={() => setDocPopupOpen((open) => !open)}
						attachButtonRef={attachButtonRef}
						isGenerating={isGenerating}
					/>
				</div>

				{openCanvasMessageId && currentQuestions.length > 0 && (
					<GeneratedQuestionsCanvas
						questions={currentQuestions}
						onAddToQuiz={handleAddToQuiz}
						onUpdateQuestion={handleUpdateQuestion}
						addedIds={currentAddedIds}
						onClose={() => setOpenCanvasMessageId(null)}
						className="w-[380px] shrink-0"
					/>
				)}
			</div>

			<DocumentAttachMenu
				open={docPopupOpen}
				onClose={() => setDocPopupOpen(false)}
				anchorRef={attachButtonRef}
				ownedDocuments={ownedDocumentsForMenu}
				savedDocuments={savedDocumentsForMenu}
				selectedId={selectedDoc?.id ?? null}
				onSelect={handleSelectDocument}
				onUpload={handleUpload}
				uploadPending={uploadPending}
				activeParsingDocId={activeParsingDocId}
				parsingStageText={parsingStageText}
				parsingProgress={parsingProgress}
				usedBytes={usedBytes}
				remainingBytes={remainingBytes}
				limitBytes={limitBytes}
			/>
		</div>
	);
}
