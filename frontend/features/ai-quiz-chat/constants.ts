import type { ChatMessage, MockDocument } from "./types";

/** Max messages to keep in the conversation (older ones are dropped) */
export const MAX_CHAT_MESSAGES = 50;

/** Mock documents for UI (no real API) */
export const MOCK_DOCUMENTS: MockDocument[] = [
	{ id: 1, fileName: "Biology Chapter 5.pdf", fileSize: 2.4 * 1024 * 1024, status: "READY" },
	{ id: 2, fileName: "History Notes.pdf", fileSize: 890 * 1024, status: "READY" },
];

/** Initial assistant message shown when chat opens */
export const MOCK_INITIAL_MESSAGE: ChatMessage = {
	id: "welcome",
	role: "assistant",
	content:
		"Hi! I can help you generate quiz questions from your documents. Attach a document using the paperclip in the chat box, then ask me to generate questions (e.g. \"Generate 5 questions\"). I'll show them in the panel on the right and you can add any of them to your quiz.",
};
