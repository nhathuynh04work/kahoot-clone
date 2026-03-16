"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { ChatMessage, MockGeneratedQuestion } from "../types";
import type { GeneratedQuestion } from "../api/client-actions";
import type { AttachDocument } from "../components/document-attach-menu";
import { MAX_CHAT_MESSAGES } from "../constants";
import { generateQuestions } from "../api/client-actions";
import { useDocuments, useUploadDocument, useDocumentParser } from "@/features/documents/hooks/use-documents";
import { MAX_TOTAL_STORAGE_BYTES } from "@/features/documents/lib/constants";

const INITIAL_MESSAGE: ChatMessage = {
	id: "welcome",
	role: "assistant",
	content:
		"Hi! I can help you generate quiz questions. Attach a document (optional) using the paperclip, then describe what questions you want (e.g. \"Generate 5 questions about photosynthesis\" or \"Create a quiz on World War 2\"). I'll show them in the panel on the right and you can add any to your quiz.",
};

interface UseAiChatStateProps {
	onFileSelect?: (doc: { id: number; fileName: string } | null) => void;
	onAddQuestion?: (question: GeneratedQuestion) => void;
}

export function useAiChatState({ onFileSelect, onAddQuestion }: UseAiChatStateProps = {}) {
	const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
	const [input, setInput] = useState("");
	const [docPopupOpen, setDocPopupOpen] = useState(false);
	const [selectedDoc, setSelectedDoc] = useState<AttachDocument | null>(null);
	const [generatedQuestionsByMessageId, setGeneratedQuestionsByMessageId] = useState<
		Record<string, MockGeneratedQuestion[]>
	>({});
	const [openCanvasMessageId, setOpenCanvasMessageId] = useState<string | null>(null);
	const [addedQuestionIdsByMessageId, setAddedQuestionIdsByMessageId] = useState<
		Record<string, Set<string>>
	>({});
	const [isGenerating, setIsGenerating] = useState(false);
	const scrollRef = useRef<HTMLDivElement>(null);
	const attachButtonRef = useRef<HTMLButtonElement>(null);

	const { data: documents = [] } = useDocuments();
	const uploadMutation = useUploadDocument();
	const { parse, isParsing, stage: parsingStage, progress } = useDocumentParser();

	const docsForMenu: AttachDocument[] = documents.map((d) => ({
		id: d.id,
		fileName: d.fileName,
		fileSize: d.fileSize,
		status: d.status,
	}));

	const usedBytes = documents.reduce((a, d) => a + d.fileSize, 0);

	useEffect(() => {
		scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
	}, [messages]);

	const handleSelectDocument = useCallback(
		(doc: AttachDocument | null) => {
			setSelectedDoc(doc);
			onFileSelect?.(doc ? { id: doc.id, fileName: doc.fileName } : null);
		},
		[onFileSelect],
	);

	const handleUpload = useCallback(
		async (file: File) => {
			try {
				const doc = await uploadMutation.mutateAsync(file);
				await parse(doc.id);
			} catch (err) {
				console.error("Upload/parse failed:", err);
				throw err;
			}
		},
		[uploadMutation, parse],
	);

	const handleAddToQuiz = useCallback(
		(question: MockGeneratedQuestion) => {
			if (!openCanvasMessageId) return;
			setAddedQuestionIdsByMessageId((prev) => ({
				...prev,
				[openCanvasMessageId]: new Set([...(prev[openCanvasMessageId] ?? new Set<string>()), question.id]),
			}));
			const genQuestion: GeneratedQuestion = {
				text: question.text,
				options: question.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
			};
			onAddQuestion?.(genQuestion);
		},
		[openCanvasMessageId, onAddQuestion],
	);

	const handleUpdateQuestion = useCallback(
		(
			questionId: string,
			updates: Partial<Pick<MockGeneratedQuestion, "text">> & {
				option?: { index: number; text?: string; isCorrect?: boolean };
			},
		) => {
			if (!openCanvasMessageId) return;
			setGeneratedQuestionsByMessageId((prev) => {
				const list = prev[openCanvasMessageId] ?? [];
				return {
					...prev,
					[openCanvasMessageId]: list.map((q) => {
						if (q.id !== questionId) return q;
						if (updates.text !== undefined) return { ...q, text: updates.text };
						if (updates.option !== undefined) {
							const { index, text: optText, isCorrect } = updates.option;
							const newOptions = q.options.map((o, i) => {
								if (i !== index) {
									if (isCorrect === true) return { ...o, isCorrect: false };
									return o;
								}
								return {
									...o,
									...(optText !== undefined && { text: optText }),
									...(isCorrect !== undefined && { isCorrect }),
								};
							});
							return { ...q, options: newOptions };
						}
						return q;
					}),
				};
			});
		},
		[openCanvasMessageId],
	);

	const sendMessage = useCallback(
		async (text: string) => {
			const trimmed = text.trim();
			if (!trimmed) return;

			const userMsg: ChatMessage = {
				id: `user-${Date.now()}`,
				role: "user",
				content: trimmed,
				attachedDocument: selectedDoc
					? { id: selectedDoc.id, fileName: selectedDoc.fileName }
					: undefined,
			};
			setMessages((prev) => {
				const next = [...prev, userMsg];
				return next.length > MAX_CHAT_MESSAGES ? next.slice(-MAX_CHAT_MESSAGES) : next;
			});
			setInput("");
			setIsGenerating(true);

			const docRef = selectedDoc;
			const msgId = `assistant-${Date.now()}`;

			try {
				const result = await generateQuestions(trimmed, selectedDoc?.id);

				const questions: MockGeneratedQuestion[] = result.questions.map((q, i) => ({
					id: `gen-${msgId}-${i}`,
					text: q.text,
					options: q.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
				}));

				const baseSummary =
					questions.length > 0
						? `I've generated ${questions.length} question${questions.length !== 1 ? "s" : ""}${docRef ? ` based on "${docRef.fileName}"` : ""}.`
						: "I couldn't generate any questions from your request. Try rephrasing or providing more detail.";

				const note = result.meta?.note?.trim();
				const assistantContent = [note, questions.length > 0 ? "You can edit them in the panel and add any to your quiz." : null]
					.filter(Boolean)
					.join(" ") || baseSummary;

				setMessages((prev) => {
					const next = [
						...prev,
						{
							id: msgId,
							role: "assistant",
							content: assistantContent,
							generatedCount: questions.length > 0 ? questions.length : undefined,
						} as ChatMessage,
					];
					return next.length > MAX_CHAT_MESSAGES ? next.slice(-MAX_CHAT_MESSAGES) : next;
				});

				if (questions.length > 0) {
					setGeneratedQuestionsByMessageId((prev) => ({ ...prev, [msgId]: questions }));
					setOpenCanvasMessageId(msgId);
				}
			} catch (err) {
				const errorMessage =
					err && typeof err === "object" && "response" in err
						? (err as { response?: { data?: { message?: string | string[] } } }).response?.data?.message
						: null;
				const msg = Array.isArray(errorMessage) ? errorMessage[0] : errorMessage ?? "Something went wrong.";
				setMessages((prev) => {
					const next = [
						...prev,
						{
							id: msgId,
							role: "assistant",
							content: msg,
						} as ChatMessage,
					];
					return next.length > MAX_CHAT_MESSAGES ? next.slice(-MAX_CHAT_MESSAGES) : next;
				});
			} finally {
				setIsGenerating(false);
			}
		},
		[selectedDoc],
	);

	return {
		messages,
		input,
		setInput,
		docPopupOpen,
		setDocPopupOpen,
		documents: docsForMenu,
		selectedDoc,
		uploadPending: uploadMutation.isPending,
		parsingStage: isParsing ? `${parsingStage} ${Math.round(progress)}%` : undefined,
		usedBytes,
		limitBytes: MAX_TOTAL_STORAGE_BYTES,
		generatedQuestionsByMessageId,
		openCanvasMessageId,
		setOpenCanvasMessageId,
		addedQuestionIdsByMessageId,
		isGenerating,
		scrollRef,
		attachButtonRef,
		handleSelectDocument,
		handleUpload,
		handleAddToQuiz,
		handleUpdateQuestion,
		sendMessage,
	};
}
