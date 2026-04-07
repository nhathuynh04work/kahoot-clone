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

/** Generated question in the canvas (editable before add-to-quiz) */
export type MockGeneratedQuestion =
	| {
			id: string;
			type: "MULTIPLE_CHOICE";
			text: string;
			options: { text: string; isCorrect: boolean }[];
	  }
	| {
			id: string;
			type: "TRUE_FALSE";
			text: string;
			correctIsTrue: boolean;
	  }
	| {
			id: string;
			type: "SHORT_ANSWER";
			text: string;
			correctText: string;
	  }
	| {
			id: string;
			type: "NUMBER_INPUT";
			text: string;
			correctNumber: number;
			rangeProximity: number;
	  };
