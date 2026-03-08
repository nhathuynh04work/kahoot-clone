"use client";

import { useCallback } from "react";
import { updateDocumentStatus } from "../api/client-actions";
import { useUpdateDocumentStatus } from "./use-documents";

const PARSING_STAGES = [
	{ label: "Extracting text...", duration: 1200 },
	{ label: "Generating chunks...", duration: 1500 },
	{ label: "Indexing content...", duration: 1000 },
];

const TOTAL_DURATION = PARSING_STAGES.reduce((acc, s) => acc + s.duration, 0);

export function useSimulateParsing() {
	const { mutateAsync: updateStatus } = useUpdateDocumentStatus();

	const simulateParsing = useCallback(
		async (
			documentId: number,
			onProgress?: (stage: string, progress: number) => void,
		) => {
			await updateStatus({ id: documentId, status: "PARSING" });

			let elapsed = 0;
			for (const stage of PARSING_STAGES) {
				onProgress?.(stage.label, (elapsed / TOTAL_DURATION) * 100);
				await new Promise((r) => setTimeout(r, stage.duration));
				elapsed += stage.duration;
			}

			onProgress?.("Done", 100);
			await updateStatus({ id: documentId, status: "READY" });
		},
		[updateStatus],
	);

	return { simulateParsing, totalDuration: TOTAL_DURATION };
}
