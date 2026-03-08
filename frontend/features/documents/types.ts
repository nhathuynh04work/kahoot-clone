export type DocumentStatus = "UPLOADED" | "PARSING" | "READY" | "ERROR";

export interface Document {
	id: number;
	userId: number;
	fileName: string;
	fileUrl: string;
	fileSize: number;
	mimeType: string;
	status: DocumentStatus;
	createdAt: string;
}
