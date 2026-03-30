"use server";

import { apiServer } from "@/lib/apiServer";
import type { Document } from "../types";

export type PublicDocumentPageResponse = {
	items: Array<Document>;
	page: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
};

export async function searchPublicDocuments(options: {
	mode: "recent" | "mostSaved";
	page: number;
	pageSize: number;
}): Promise<PublicDocumentPageResponse> {
	const api = await apiServer();
	const params = new URLSearchParams();
	params.set("mode", options.mode);
	params.set("page", String(options.page));
	params.set("pageSize", String(options.pageSize));

	const { data } = await api.get(`/public/documents?${params.toString()}`);
	return data as PublicDocumentPageResponse;
}

export async function searchPublicDocumentsByUserId(
	userId: number,
	options: { mode: "recent" | "mostSaved"; page: number; pageSize: number },
): Promise<PublicDocumentPageResponse> {
	const api = await apiServer();
	const params = new URLSearchParams();
	params.set("mode", options.mode);
	params.set("page", String(options.page));
	params.set("pageSize", String(options.pageSize));

	const { data } = await api.get(
		`/public/users/${userId}/documents?${params.toString()}`,
	);
	return data as PublicDocumentPageResponse;
}

export async function toggleDocumentSaveServer(documentId: number) {
	const api = await apiServer();
	const { data } = await api.post(`/saves/documents/${documentId}`);
	return data as { saved: boolean; documentId: number };
}

