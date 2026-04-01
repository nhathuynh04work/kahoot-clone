import { apiClient } from "@/lib/apiClient";
import axios from "axios";
import type { Document } from "../types";

interface DocumentSignatureResponse {
	signature: string;
	timestamp: number;
	folder: string;
	apiKey: string;
	cloudName: string;
}

export const getDocumentSignature = async () => {
	const { data } = await apiClient.get<DocumentSignatureResponse>(
		"/upload/signature/document",
	);
	return data;
};

export const uploadPdfToCloudinary = async (params: {
	formData: FormData;
	cloudName: string;
}) => {
	const { formData, cloudName } = params;
	const url = `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`;
	const { data } = await axios.post(url, formData);
	return data;
};

export const createDocument = async (params: {
	fileName: string;
	fileUrl: string;
	fileSize: number;
	mimeType?: string;
	cloudinaryPublicId?: string;
}) => {
	const { data } = await apiClient.post<Document>("/documents", params);
	return data;
};

export const getDocuments = async () => {
	const { data } = await apiClient.get<Document[]>("/documents");
	return data;
};

export const searchDocuments = async (options: { q?: string }) => {
	const params = new URLSearchParams();
	if (options.q?.trim()) params.set("q", options.q.trim());
	const qs = params.toString();
	const { data } = await apiClient.get<Document[]>(
		qs ? `/documents?${qs}` : "/documents",
	);
	return data;
};

export type DocumentPageResponse = {
	items: Document[];
	page: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
};

export const searchDocumentsPage = async (options: {
	q?: string;
	page: number;
	pageSize: number;
	sort?: string;
}) => {
	const params = new URLSearchParams();
	params.set("page", String(options.page));
	params.set("pageSize", String(options.pageSize));
	if (options.q?.trim()) params.set("q", options.q.trim());
	if (options.sort?.trim()) params.set("sort", options.sort.trim());
	const { data } = await apiClient.get<DocumentPageResponse>(
		`/documents?${params.toString()}`,
	);
	return data;
};

export const getDocumentsTotalSize = async (): Promise<number> => {
	const { data } = await apiClient.get<number>("/documents/total-size");
	return typeof data === "number" ? data : 0;
};

export const deleteDocument = async (id: number) => {
	await apiClient.delete(`/documents/${id}`);
};

export const updateDocumentStatus = async (
	id: number,
	status: Document["status"],
) => {
	const { data } = await apiClient.patch<Document>(`/documents/${id}/status`, {
		status,
	});
	return data;
};

export const updateDocumentVisibility = async (
	id: number,
	visibility: "PUBLIC" | "PRIVATE",
) => {
	const { data } = await apiClient.patch<Document>(
		`/documents/${id}/visibility`,
		{ visibility },
	);
	return data;
};

export const toggleDocumentSave = async (documentId: number) => {
	const { data } = await apiClient.post(
		`/saves/documents/${documentId}`,
	);
	return data as { saved: boolean; documentId: number };
};

export const getMySavedDocumentIds = async (): Promise<number[]> => {
	const { data } = await apiClient.get<{ documentIds: number[] }>(
		"/saves/documents",
	);
	return data.documentIds;
};

export const getMySavedPublicDocuments = async (): Promise<Document[]> => {
	const { data } = await apiClient.get<Document[]>("/saves/documents/public");
	return data;
};

/** Parse and index document for RAG. May take 30s–2min for larger PDFs. */
export const parseDocument = async (id: number) => {
	const { data } = await apiClient.post<{ success: boolean }>(
		`/documents/${id}/parse`,
		{},
		{ timeout: 120_000 },
	);
	return data;
};

export interface ParseProgressEvent {
	stage: string;
	progress: number;
	error?: string;
}

/** Opens the SSE connection for document parse stream. */
async function openParseStream(id: number): Promise<ReadableStreamDefaultReader<Uint8Array>> {
	const baseURL = apiClient.defaults.baseURL || "";
	const url = `${baseURL}/documents/${id}/parse-stream`;
	const res = await fetch(url, { method: "GET", credentials: "include" });
	if (!res.ok) {
		const text = await res.text();
		throw new Error(text || `Parse stream failed: ${res.status}`);
	}
	const reader = res.body?.getReader();
	if (!reader) throw new Error("No response body");
	return reader;
}

/** Extracts and parses a single "data: {...}" line from an SSE block. */
function parseSSEBlock(block: string): ParseProgressEvent | null {
	// NestJS SSE may emit either:
	// - single-line JSON payload: `data: {...}`
	// - or multiple `data:` lines (SSE spec) for a single event.
	const dataLines = Array.from(block.matchAll(/^data:\s*(.*)$/gm)).map((m) => m[1]);
	if (dataLines.length === 0) return null;
	try {
		const jsonText = dataLines.join("\n").trim();
		return JSON.parse(jsonText) as ParseProgressEvent;
	} catch (e) {
		if (e instanceof SyntaxError) return null;
		throw e;
	}
}

/** Splits buffer by double-newline, parses complete blocks, returns events + leftover. */
function processSSEBuffer(
	buffer: string,
): { events: ParseProgressEvent[]; remaining: string } {
	// Normalize line endings so we can safely split on SSE "blank line" delimiters.
	const normalized = buffer.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
	const blocks = normalized.split("\n\n");
	const remaining = blocks.pop() ?? "";
	const events = blocks
		.map(parseSSEBlock)
		.filter((e): e is ParseProgressEvent => e !== null);
	return { events, remaining };
}

/** Reads stream chunks, decodes, parses SSE format, yields progress events. */
async function* streamSSEEvents(
	reader: ReadableStreamDefaultReader<Uint8Array>,
): AsyncGenerator<ParseProgressEvent> {
	const decoder = new TextDecoder();
	let buffer = "";

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;

		buffer += decoder.decode(value, { stream: true });
		const { events, remaining } = processSSEBuffer(buffer);
		buffer = remaining;

		for (const event of events) {
			yield event;
			if (event.error) throw new Error(event.error);
		}
	}
}

/** Stream parse progress via SSE. Yields progress events as they arrive. */
export async function* parseDocumentStream(
	id: number,
): AsyncGenerator<ParseProgressEvent> {
	const reader = await openParseStream(id);
	yield* streamSSEEvents(reader);
}
