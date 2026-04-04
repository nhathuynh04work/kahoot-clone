export type DocumentStatus = "UPLOADED" | "PARSING" | "READY" | "ERROR";

export interface Document {
	id: number;
	userId: number;
	fileName: string;
	fileUrl: string;
	fileSize: number;
	mimeType: string;
	cloudinaryPublicId?: string;
	status: DocumentStatus;
	visibility?: "PUBLIC" | "PRIVATE";
	createdAt: string;
	saveCount?: number;
	authorName?: string | null;
}
