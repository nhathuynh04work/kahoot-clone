"use client";

import { useCallback, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	searchDocuments,
	getDocumentsTotalSize,
	deleteDocument,
	updateDocumentStatus,
	updateDocumentVisibility,
	createDocument,
	getDocumentSignature,
	uploadPdfToCloudinary,
	parseDocument,
	parseDocumentStream,
} from "../api/client-actions";
import type { Document } from "../types";

export const documentsQueryKey = ["documents"] as const;

export function useDocuments(options?: { q?: string }) {
	return useQuery({
		queryKey: [...documentsQueryKey, options?.q ?? ""],
		queryFn: () => searchDocuments({ q: options?.q }),
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
		onMutate: async (id: number) => {
			await queryClient.cancelQueries({ queryKey: documentsQueryKey });

			const previousDocs = queryClient.getQueryData<Document[]>(documentsQueryKey);

			queryClient.setQueryData<Document[]>(documentsQueryKey, (old) =>
				old?.filter((doc) => doc.id !== id),
			);

			return { previousDocs };
		},
		onError: (_err, _id, context) => {
			if (context?.previousDocs) {
				queryClient.setQueryData(documentsQueryKey, context.previousDocs);
			}
		},
		onSettled: () => {
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

export function useUpdateDocumentVisibility() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			visibility,
		}: {
			id: number;
			visibility: "PUBLIC" | "PRIVATE";
		}) => updateDocumentVisibility(id, visibility),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: documentsQueryKey });
		},
	});
}

export function useParseDocument() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: number) => parseDocument(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: documentsQueryKey });
		},
	});
}

type ParsingState = { stage: string; progress: number } | null;

/** Parse document with streaming progress. Returns reactive state — no callbacks needed. */
export function useDocumentParser() {
	const queryClient = useQueryClient();
	const [progress, setProgress] = useState<ParsingState>(null);

	const parse = useCallback(
		async (id: number) => {
			setProgress({ stage: "Starting...", progress: 0 });

			try {
				for await (const event of parseDocumentStream(id)) {
					setProgress({ stage: event.stage, progress: event.progress });
				}
			} finally {
				setProgress(null);
				queryClient.invalidateQueries({ queryKey: documentsQueryKey });
			}
		},
		[queryClient],
	);

	const reset = useCallback(() => setProgress(null), []);

	return {
		parse,
		reset,
		isParsing: progress !== null,
		stage: progress?.stage ?? "",
		progress: progress?.progress ?? 0,
	};
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
				cloudinaryPublicId: cloudRes.public_id,
			});

			return doc;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: documentsQueryKey });
		},
	});
}
