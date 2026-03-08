"use client";

import { useState, useRef, useEffect } from "react";
import type { ChatMessage, MockDocument, MockGeneratedQuestion } from "../types";
import { MAX_CHAT_MESSAGES, MOCK_DOCUMENTS, MOCK_INITIAL_MESSAGE } from "../constants";
import { getRandomGeneratedQuestions } from "../lib/mock-questions";

interface UseAiChatStateProps {
	onFileSelect?: (doc: { id: number; fileName: string } | null) => void;
}

export function useAiChatState({ onFileSelect }: UseAiChatStateProps = {}) {
	const [messages, setMessages] = useState<ChatMessage[]>([MOCK_INITIAL_MESSAGE]);
	const [input, setInput] = useState("");
	const [docPopupOpen, setDocPopupOpen] = useState(false);
	const [mockDocuments, setMockDocuments] = useState<MockDocument[]>(MOCK_DOCUMENTS);
	const [selectedDoc, setSelectedDoc] = useState<MockDocument | null>(null);
	const [uploadPending, setUploadPending] = useState(false);
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

	useEffect(() => {
		scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
	}, [messages]);

	const handleSelectDocument = (doc: MockDocument | null) => {
		setSelectedDoc(doc);
		onFileSelect?.(doc ? { id: doc.id, fileName: doc.fileName } : null);
	};

	const handleMockUpload = () => {
		setUploadPending(true);
		setTimeout(() => {
			setMockDocuments((prev) => [
				...prev,
				{
					id: Date.now(),
					fileName: `Uploaded doc ${prev.length + 1}.pdf`,
					fileSize: 1024 * 1024,
					status: "READY",
				},
			]);
			setUploadPending(false);
		}, 1500);
	};

	const handleAddToQuiz = (question: MockGeneratedQuestion) => {
		if (!openCanvasMessageId) return;
		setAddedQuestionIdsByMessageId((prev) => ({
			...prev,
			[openCanvasMessageId]: new Set(prev[openCanvasMessageId] ?? []).add(question.id),
		}));
	};

	const handleUpdateQuestion = (
		questionId: string,
		updates: Partial<Pick<MockGeneratedQuestion, "text">> & {
			option?: { index: number; text?: string; isCorrect?: boolean };
		}
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
	};

	const sendMessage = (text: string) => {
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

		const looksLikeGenerate = /generate|questions|quiz/i.test(trimmed);
		const docRef = selectedDoc;
		setTimeout(() => {
			const questions = looksLikeGenerate ? getRandomGeneratedQuestions() : [];
			const msgId = `assistant-${Date.now()}`;
			const assistantContent = looksLikeGenerate
				? `I've generated ${questions.length} questions based on your document${docRef ? ` "${docRef.fileName}"` : ""}. You can edit them in the panel and add any to your quiz.`
				: "This is a mock response. Try asking to \"Generate 5 questions\" to see the generated questions panel.";
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
			if (looksLikeGenerate && questions.length > 0) {
				setGeneratedQuestionsByMessageId((prev) => ({ ...prev, [msgId]: questions }));
				setOpenCanvasMessageId(msgId);
			}
			setIsGenerating(false);
		}, 1200);
	};

	return {
		messages,
		input,
		setInput,
		docPopupOpen,
		setDocPopupOpen,
		mockDocuments,
		selectedDoc,
		uploadPending,
		generatedQuestionsByMessageId,
		openCanvasMessageId,
		setOpenCanvasMessageId,
		addedQuestionIdsByMessageId,
		isGenerating,
		scrollRef,
		attachButtonRef,
		handleSelectDocument,
		handleMockUpload,
		handleAddToQuiz,
		handleUpdateQuestion,
		sendMessage,
	};
}
