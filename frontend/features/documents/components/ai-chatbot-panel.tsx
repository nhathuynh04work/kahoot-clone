"use client";

import { X, Sparkles, FileText, Send, Bot, User, Paperclip } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { DocumentAttachMenu, type MockDocument } from "./document-attach-menu";
import { MAX_TOTAL_STORAGE_BYTES } from "../lib/constants";
import {
	GeneratedQuestionsCanvas,
	type MockGeneratedQuestion,
} from "./generated-questions-canvas";
import { cn } from "@/lib/utils";

interface AiChatbotPanelProps {
	onClose: () => void;
	onFileSelect?: (doc: { id: number; fileName: string } | null) => void;
}

type ChatRole = "user" | "assistant";

interface ChatMessage {
	id: string;
	role: ChatRole;
	content: string;
	attachedDocument?: { id: number; fileName: string };
	/** Set on assistant messages that have generated questions (for "View N questions" button) */
	generatedCount?: number;
}

/** Mock documents for UI (no real API) */
const MOCK_DOCUMENTS: MockDocument[] = [
	{ id: 1, fileName: "Biology Chapter 5.pdf", fileSize: 2.4 * 1024 * 1024, status: "READY" },
	{ id: 2, fileName: "History Notes.pdf", fileSize: 890 * 1024, status: "READY" },
];

/** Mock initial assistant message */
const MOCK_INITIAL_MESSAGE: ChatMessage = {
	id: "welcome",
	role: "assistant",
	content:
		"Hi! I can help you generate quiz questions from your documents. Attach a document using the paperclip in the chat box, then ask me to generate questions (e.g. \"Generate 5 questions\"). I'll show them in the panel on the right and you can add any of them to your quiz.",
};

/** Max messages to keep in the conversation (older ones are dropped) */
const MAX_CHAT_MESSAGES = 50;

/** Randomized mock question pools for variety when testing */
const MOCK_QUESTION_POOLS: MockGeneratedQuestion[][] = [
	[
		{ id: "gen-1", text: "What is the primary function of mitochondria?", options: [{ text: "Protein synthesis", isCorrect: false }, { text: "ATP production", isCorrect: true }, { text: "DNA replication", isCorrect: false }, { text: "Lipid storage", isCorrect: false }] },
		{ id: "gen-2", text: "Which organelle is responsible for photosynthesis?", options: [{ text: "Mitochondria", isCorrect: false }, { text: "Chloroplast", isCorrect: true }, { text: "Nucleus", isCorrect: false }, { text: "Golgi apparatus", isCorrect: false }] },
		{ id: "gen-3", text: "What type of cell has a cell wall?", options: [{ text: "Animal cell only", isCorrect: false }, { text: "Plant cell only", isCorrect: false }, { text: "Both plant and bacterial cells", isCorrect: true }, { text: "Neither", isCorrect: false }] },
	],
	[
		{ id: "gen-a", text: "In which year did World War II end?", options: [{ text: "1943", isCorrect: false }, { text: "1945", isCorrect: true }, { text: "1947", isCorrect: false }, { text: "1950", isCorrect: false }] },
		{ id: "gen-b", text: "Who wrote Romeo and Juliet?", options: [{ text: "Charles Dickens", isCorrect: false }, { text: "William Shakespeare", isCorrect: true }, { text: "Jane Austen", isCorrect: false }, { text: "Mark Twain", isCorrect: false }] },
		{ id: "gen-c", text: "What is the capital of Japan?", options: [{ text: "Seoul", isCorrect: false }, { text: "Beijing", isCorrect: false }, { text: "Tokyo", isCorrect: true }, { text: "Bangkok", isCorrect: false }] },
		{ id: "gen-d", text: "Which planet is known as the Red Planet?", options: [{ text: "Venus", isCorrect: false }, { text: "Mars", isCorrect: true }, { text: "Jupiter", isCorrect: false }, { text: "Saturn", isCorrect: false }] },
	],
	[
		{ id: "gen-x", text: "What is 15% of 80?", options: [{ text: "10", isCorrect: false }, { text: "12", isCorrect: true }, { text: "14", isCorrect: false }, { text: "16", isCorrect: false }] },
		{ id: "gen-y", text: "Which programming language is known for web browsers?", options: [{ text: "Python", isCorrect: false }, { text: "JavaScript", isCorrect: true }, { text: "Java", isCorrect: false }, { text: "C++", isCorrect: false }] },
	],
];

/** Returns a random set of generated questions (random pool and count) for mock variety */
function getRandomGeneratedQuestions(): MockGeneratedQuestion[] {
	const pool = MOCK_QUESTION_POOLS[Math.floor(Math.random() * MOCK_QUESTION_POOLS.length)];
	const count = 2 + Math.floor(Math.random() * (pool.length - 1)); // 2 to pool.length
	const shuffled = [...pool].sort(() => Math.random() - 0.5);
	return shuffled.slice(0, count).map((q, i) => ({
		...q,
		id: `${q.id}-${Date.now()}-${i}`,
	}));
}

export function AiChatbotPanel({ onClose, onFileSelect }: AiChatbotPanelProps) {
	const [messages, setMessages] = useState<ChatMessage[]>([MOCK_INITIAL_MESSAGE]);
	const [input, setInput] = useState("");
	const [docPopupOpen, setDocPopupOpen] = useState(false);
	const [mockDocuments, setMockDocuments] = useState<MockDocument[]>(MOCK_DOCUMENTS);
	const [selectedDoc, setSelectedDoc] = useState<MockDocument | null>(null);
	const [uploadPending, setUploadPending] = useState(false);
	/** Generated questions per assistant message id (so each "View N questions" shows the right set) */
	const [generatedQuestionsByMessageId, setGeneratedQuestionsByMessageId] = useState<
		Record<string, MockGeneratedQuestion[]>
	>({});
	/** Which message's canvas is open (null = closed) */
	const [openCanvasMessageId, setOpenCanvasMessageId] = useState<string | null>(null);
	/** Added-to-quiz question ids per message id */
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
			const newDoc: MockDocument = {
				id: Date.now(),
				fileName: `Uploaded doc ${mockDocuments.length + 1}.pdf`,
				fileSize: 1024 * 1024,
				status: "READY",
			};
			setMockDocuments((prev) => [...prev, newDoc]);
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

	return (
		<div
			className="fixed inset-0 z-50 flex flex-col bg-gray-950"
			aria-modal
			role="dialog"
		>
			{/* Header */}
			<header className="flex items-center justify-between shrink-0 h-14 px-4 border-b border-gray-800 bg-gray-900/80">
				<div className="flex items-center gap-3">
					<div className="w-9 h-9 rounded-lg bg-indigo-500/20 flex items-center justify-center">
						<Sparkles className="w-5 h-5 text-indigo-400" />
					</div>
					<h1 className="font-semibold text-white">AI Quiz Generator</h1>
				</div>
				<button
					type="button"
					onClick={onClose}
					className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
					aria-label="Close"
				>
					<X className="w-5 h-5" />
				</button>
			</header>

			{/* Main layout: chat + optional canvas */}
			<div className="flex-1 flex min-h-0">
				{/* Chat area — full height, scrollable messages */}
				<div className="flex-1 flex flex-col min-w-0">
					<div
						ref={scrollRef}
						className="flex-1 overflow-y-auto px-4 py-6"
					>
						<div className="max-w-2xl mx-auto space-y-6">
							{messages.map((msg) => (
								<div
									key={msg.id}
									className={cn(
										"flex gap-3",
										msg.role === "user" && "flex-row-reverse",
									)}
								>
									<div
										className={cn(
											"shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
											msg.role === "user"
												? "bg-indigo-600"
												: "bg-gray-700",
										)}
									>
										{msg.role === "user" ? (
											<User className="w-4 h-4 text-white" />
										) : (
											<Bot className="w-4 h-4 text-gray-300" />
										)}
									</div>
									<div
										className={cn(
											"rounded-2xl px-4 py-3 max-w-[85%] flex flex-col gap-2",
											msg.role === "user"
												? "bg-indigo-600 text-white"
												: "bg-gray-800 text-gray-100 border border-gray-700",
										)}
									>
										{msg.role === "user" && msg.attachedDocument && (
											<div className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-white/10">
												<FileText className="w-4 h-4 shrink-0" />
												<span className="text-xs truncate">{msg.attachedDocument.fileName}</span>
											</div>
										)}
										<p className="text-sm whitespace-pre-wrap">{msg.content}</p>
										{msg.role === "assistant" &&
											msg.generatedCount != null &&
											msg.generatedCount > 0 && (
												<button
													type="button"
													onClick={() => setOpenCanvasMessageId(msg.id)}
													className="self-start mt-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:underline"
												>
													View {msg.generatedCount} question{msg.generatedCount !== 1 ? "s" : ""}
												</button>
											)}
									</div>
								</div>
							))}
							{isGenerating && (
								<div className="flex gap-3">
									<div className="shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
										<Bot className="w-4 h-4 text-gray-300" />
									</div>
									<div className="rounded-2xl px-4 py-3 bg-gray-800 border border-gray-700 flex items-center gap-2">
										<span className="flex gap-1">
											<span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce [animation-delay:0ms]" />
											<span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce [animation-delay:150ms]" />
											<span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce [animation-delay:300ms]" />
										</span>
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Input area: message input on top, document + send on same line below */}
					<div className="shrink-0 border-t border-gray-800 bg-gray-900/50 px-4 py-4">
						<div className="max-w-2xl mx-auto">
							<div className="rounded-2xl border border-gray-700 bg-gray-800/80 focus-within:border-indigo-500/50 transition-colors overflow-hidden">
								{/* Attached document chip (above input) */}
								{selectedDoc && (
									<div className="flex items-center gap-2 px-4 py-2 border-b border-gray-700/80 bg-gray-800/50">
										<FileText className="w-4 h-4 text-indigo-400 shrink-0" />
										<span className="text-sm text-gray-200 truncate flex-1 min-w-0">
											{selectedDoc.fileName}
										</span>
										<button
											type="button"
											onClick={() => handleSelectDocument(null)}
											className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors shrink-0"
											aria-label="Remove document"
										>
											<X className="w-4 h-4" />
										</button>
									</div>
								)}
								{/* Chat message input — full width */}
								<div className="px-3 pt-3">
									<textarea
										value={input}
										onChange={(e) => setInput(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter" && !e.shiftKey) {
												e.preventDefault();
												sendMessage(input);
											}
										}}
										placeholder={
											selectedDoc
												? "Ask to generate questions..."
												: "Attach a document, then ask to generate questions..."
										}
										rows={1}
										className="w-full min-h-[44px] max-h-32 py-2.5 px-3 bg-transparent text-white placeholder:text-gray-500 resize-none focus:outline-none text-sm"
									/>
								</div>
								{/* Same line below: document button + send button */}
								<div className="flex items-center justify-end gap-1 px-2 pb-2">
									<button
										ref={attachButtonRef}
										type="button"
										onClick={() => setDocPopupOpen((open) => !open)}
										className={cn(
											"shrink-0 p-2 rounded-lg transition-colors",
											selectedDoc
												? "text-indigo-400 bg-indigo-500/10"
												: "text-gray-400 hover:text-indigo-400 hover:bg-gray-700/50",
										)}
										aria-label="Attach document"
									>
										<Paperclip className="w-5 h-5" />
									</button>
									<button
										type="button"
										onClick={() => sendMessage(input)}
										disabled={!input.trim() || isGenerating}
										className="shrink-0 p-2 rounded-lg text-indigo-400 hover:bg-indigo-500/20 disabled:opacity-40 disabled:pointer-events-none transition-colors"
										aria-label="Send"
									>
										<Send className="w-5 h-5" />
									</button>
								</div>
							</div>
							<p className="text-xs text-gray-500 mt-2 text-center">
								Mock UI — use &quot;Generate 5 questions&quot; to see the canvas.
							</p>
						</div>
					</div>
				</div>

				{/* Canvas panel — show the set for the currently open message */}
				{openCanvasMessageId &&
					(generatedQuestionsByMessageId[openCanvasMessageId]?.length ?? 0) > 0 && (
					<GeneratedQuestionsCanvas
						questions={generatedQuestionsByMessageId[openCanvasMessageId] ?? []}
						onAddToQuiz={handleAddToQuiz}
						onUpdateQuestion={handleUpdateQuestion}
						addedIds={addedQuestionIdsByMessageId[openCanvasMessageId] ?? new Set()}
						onClose={() => setOpenCanvasMessageId(null)}
						className="w-[380px] shrink-0"
					/>
				)}
			</div>

			<DocumentAttachMenu
				open={docPopupOpen}
				onClose={() => setDocPopupOpen(false)}
				anchorRef={attachButtonRef}
				mockDocuments={mockDocuments}
				selectedId={selectedDoc?.id ?? null}
				onSelect={handleSelectDocument}
				onUploadClick={handleMockUpload}
				uploadPending={uploadPending}
				usedBytes={mockDocuments.reduce((a, d) => a + d.fileSize, 0)}
				limitBytes={MAX_TOTAL_STORAGE_BYTES}
			/>
		</div>
	);
}
