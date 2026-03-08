/** Chat participant role */
export type ChatRole = "user" | "assistant";

/** Single message in the AI quiz chat */
export interface ChatMessage {
	id: string;
	role: ChatRole;
	content: string;
	attachedDocument?: { id: number; fileName: string };
	/** Set on assistant messages that have generated questions (for "View N questions" button) */
	generatedCount?: number;
}

/** Mock document for attach menu (UI only, no real API) */
export interface MockDocument {
	id: number;
	fileName: string;
	fileSize: number;
	status: "READY" | "PARSING" | "UPLOADED" | "ERROR";
}

/** Mock generated question for the canvas (UI only) */
export interface MockGeneratedQuestion {
	id: string;
	text: string;
	options: { text: string; isCorrect: boolean }[];
}
