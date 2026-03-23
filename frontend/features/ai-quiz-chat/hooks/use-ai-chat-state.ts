"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { ChatMessage, MockGeneratedQuestion } from "../types";
import type { GeneratedQuestion } from "../api/client-actions";
import type { AttachDocument } from "../components/document-attach-menu";
import { MAX_CHAT_MESSAGES } from "../constants";
import { generateQuestions, getQuizChat } from "../api/client-actions";
import {
	documentsQueryKey,
	useDocuments,
	useUploadDocument,
	useDocumentParser,
} from "@/features/documents/hooks/use-documents";
import { MAX_TOTAL_STORAGE_BYTES } from "@/features/documents/lib/constants";

const INITIAL_MESSAGE: ChatMessage = {
	id: "welcome",
	role: "assistant",
	content:
		"Hi! I can help you generate quiz questions. Attach a document (optional) using the paperclip, then describe what questions you want (e.g. \"Generate 5 questions about photosynthesis\" or \"Create a quiz on World War 2\"). I'll show them in the panel on the right and you can add any to your quiz.",
};

interface UseAiChatStateProps {
	quizId?: number | null;
	onFileSelect?: (doc: { id: number; fileName: string } | null) => void;
	onAddQuestion?: (question: GeneratedQuestion) => void;
}

export function useAiChatState({ quizId, onFileSelect, onAddQuestion }: UseAiChatStateProps = {}) {
	const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
	const [input, setInput] = useState("");
	const [docPopupOpen, setDocPopupOpen] = useState(false);
	const [selectedDoc, setSelectedDoc] = useState<AttachDocument | null>(null);
	const [activeParsingDocId, setActiveParsingDocId] = useState<number | null>(null);
	const parsingStartedAtRef = useRef<number | null>(null);
	const didStallResetRef = useRef(false);
	const [isHistoryLoading, setIsHistoryLoading] = useState(false);
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
	const queryClient = useQueryClient();

	const { data: documents = [] } = useDocuments();
	const uploadMutation = useUploadDocument();
	const { parse, reset, isParsing, stage: parsingStage, progress } = useDocumentParser();

	const docsForMenu: AttachDocument[] = documents.map((d) => ({
		id: d.id,
		fileName: d.fileName,
		fileSize: d.fileSize,
		status: d.status,
	}));

	const usedBytes = documents.reduce((a, d) => a + d.fileSize, 0);
	const remainingBytes = Math.max(0, MAX_TOTAL_STORAGE_BYTES - usedBytes);
	const activeParsingDocStatus =
		activeParsingDocId != null ? documents.find((d) => d.id === activeParsingDocId)?.status : null;

	useEffect(() => {
		let cancelled = false;
		(async () => {
			if (!quizId || quizId <= 0) {
				setMessages([INITIAL_MESSAGE]);
				setGeneratedQuestionsByMessageId({});
				setOpenCanvasMessageId(null);
				setIsHistoryLoading(false);
				return;
			}
			setIsHistoryLoading(true);
			try {
				const data = await getQuizChat(quizId);
				if (cancelled) return;
				const hydrated: ChatMessage[] = data.messages.map((m) => ({
					id: `persisted-${m.id}`,
					role: m.role,
					content: m.content,
					attachedDocument: m.attachedDocument,
					generatedCount: m.generatedCount,
				}));

				const hydratedQuestions: Record<string, MockGeneratedQuestion[]> = {};
				for (const m of data.messages) {
					if (m.role !== "assistant") continue;
					if (!m.generatedQuestions || m.generatedQuestions.length === 0) continue;
					const msgId = `persisted-${m.id}`;
					hydratedQuestions[msgId] = m.generatedQuestions.map((q, i) => ({
						id: `persisted-gen-${m.id}-${i}`,
						text: q.text,
						options: q.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
					}));
				}

				setMessages([INITIAL_MESSAGE, ...hydrated].slice(-MAX_CHAT_MESSAGES));
				setGeneratedQuestionsByMessageId(hydratedQuestions);
				setOpenCanvasMessageId(null);
				setIsHistoryLoading(false);
			} catch {
				// If chat history load fails, keep a working local chat instead of blocking the UI.
				setMessages([INITIAL_MESSAGE]);
				setGeneratedQuestionsByMessageId({});
				setOpenCanvasMessageId(null);
				setIsHistoryLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [quizId]);

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
				setActiveParsingDocId(doc.id);
				parsingStartedAtRef.current = Date.now();
				didStallResetRef.current = false;
				await parse(doc.id);
				setActiveParsingDocId(null);
				parsingStartedAtRef.current = null;
			} catch (err) {
				console.error("Upload/parse failed:", err);
				setActiveParsingDocId(null);
				parsingStartedAtRef.current = null;
				didStallResetRef.current = false;
				reset();
				throw err;
			}
		},
		[uploadMutation, parse, reset],
	);

	// Poll document status while parsing so we can clear the UI even if the SSE stream stalls.
	useEffect(() => {
		if (activeParsingDocId == null) return;

		queryClient.invalidateQueries({ queryKey: documentsQueryKey });
		const intervalId = window.setInterval(() => {
			queryClient.invalidateQueries({ queryKey: documentsQueryKey });
		}, 4000);

		return () => window.clearInterval(intervalId);
	}, [activeParsingDocId, queryClient]);

	// Stop showing parsing UI when the backend reports READY/ERROR.
	useEffect(() => {
		if (activeParsingDocId == null) return;
		if (activeParsingDocStatus !== "READY" && activeParsingDocStatus !== "ERROR") return;

		reset();
		setActiveParsingDocId(null);
		parsingStartedAtRef.current = null;
		didStallResetRef.current = false;
	}, [activeParsingDocId, activeParsingDocStatus, reset]);

	// If SSE stalls (no READY/ERROR yet), hide the progress UI after a short timeout.
	useEffect(() => {
		if (activeParsingDocId == null) return;
		if (didStallResetRef.current) return;
		if (!parsingStartedAtRef.current) return;
		if (activeParsingDocStatus === "READY" || activeParsingDocStatus === "ERROR") return;

		const timeoutId = window.setTimeout(() => {
			// Re-check status at the moment the timeout fires.
			if (
				activeParsingDocStatus !== "READY" &&
				activeParsingDocStatus !== "ERROR"
			) {
				reset();
				didStallResetRef.current = true;
			}
		}, 120_000);

		return () => window.clearTimeout(timeoutId);
	}, [activeParsingDocId, activeParsingDocStatus, reset]);

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
				const result = await generateQuestions(trimmed, selectedDoc?.id, quizId);

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
				const msg =
					err instanceof Error
						? err.message
						: "I couldn’t generate questions from that. Try describing a topic and how many questions you want.";
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
		[selectedDoc, quizId],
	);

	return {
		messages,
		input,
		setInput,
		isHistoryLoading,
		docPopupOpen,
		setDocPopupOpen,
		documents: docsForMenu,
		selectedDoc,
		uploadPending: uploadMutation.isPending,
		activeParsingDocId,
		parsingStageText: isParsing ? parsingStage : undefined,
		parsingProgress: isParsing ? progress : undefined,
		usedBytes,
		remainingBytes,
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
