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
}) => {
	const { data } = await apiClient.post<Document>("/documents", params);
	return data;
};

export const getDocuments = async () => {
	const { data } = await apiClient.get<Document[]>("/documents");
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
