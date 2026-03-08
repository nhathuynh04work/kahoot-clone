"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getDocuments,
	getDocumentsTotalSize,
	deleteDocument,
	updateDocumentStatus,
	createDocument,
	getDocumentSignature,
	uploadPdfToCloudinary,
} from "../api/client-actions";
import type { Document } from "../types";

export const documentsQueryKey = ["documents"] as const;

export function useDocuments() {
	return useQuery({
		queryKey: documentsQueryKey,
		queryFn: getDocuments,
	});
}

export function useDocumentsTotalSize() {
	return useQuery({
		queryKey: [...documentsQueryKey, "total-size"],
		queryFn: getDocumentsTotalSize,
	});
}

export function useDeleteDocument() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteDocument,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: documentsQueryKey });
		},
	});
}

export function useUpdateDocumentStatus() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, status }: { id: number; status: Document["status"] }) =>
			updateDocumentStatus(id, status),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: documentsQueryKey });
		},
	});
}

export function useUploadDocument() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (file: File) => {
			const signatureData = await getDocumentSignature();
			const { signature, timestamp, folder, apiKey, cloudName } =
				signatureData;

			const formData = new FormData();
			formData.append("file", file);
			formData.append("api_key", apiKey);
			formData.append("timestamp", timestamp.toString());
			formData.append("signature", signature);
			formData.append("folder", folder);

			const cloudRes = await uploadPdfToCloudinary({
				formData,
				cloudName,
			});

			const doc = await createDocument({
				fileName: file.name,
				fileUrl: cloudRes.secure_url,
				fileSize: file.size,
				mimeType: file.type || "application/pdf",
			});

			return doc;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: documentsQueryKey });
		},
	});
}
