"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import {
	MAX_FILE_SIZE_BYTES,
	MAX_TOTAL_STORAGE_BYTES,
	formatBytes,
	ALLOWED_MIME_TYPES,
} from "../lib/constants";
import {
	useUploadDocument,
	useDocumentsTotalSize,
	useParseDocument,
} from "../hooks/use-documents";
import { ParsingProgress } from "./parsing-progress";
import { toast } from "sonner";

interface PdfUploadZoneProps {
	onUploadComplete?: (docId: number) => void;
	className?: string;
}

export function PdfUploadZone({
	onUploadComplete,
	className = "",
}: PdfUploadZoneProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const { mutateAsync: uploadDoc, isPending } = useUploadDocument();
	const { mutateAsync: parseDoc } = useParseDocument();
	const { data: totalSize = 0 } = useDocumentsTotalSize();
	const [parsing, setParsing] = useState<{
		fileName: string;
		stage: string;
		progress: number;
	} | null>(null);

	const remainingBytes = Math.max(0, MAX_TOTAL_STORAGE_BYTES - totalSize);

	const handleFiles = useCallback(
		async (files: FileList | null) => {
			if (!files?.length) return;

			const file = files[0];
			if (file.size > MAX_FILE_SIZE_BYTES) {
				toast.error(
					`File too large. Maximum ${formatBytes(MAX_FILE_SIZE_BYTES)} per file.`,
				);
				return;
			}
			if (file.size > remainingBytes) {
				toast.error(
					`Not enough storage. You have ${formatBytes(remainingBytes)} remaining.`,
				);
				return;
			}
			if (!ALLOWED_MIME_TYPES.includes(file.type)) {
				toast.error("Only PDF and TXT files are allowed.");
				return;
			}

			try {
				const doc = await uploadDoc(file);
				onUploadComplete?.(doc.id);

				setParsing({
					fileName: file.name,
					stage: "Extracting text and indexing...",
					progress: 50,
				});
				await parseDoc(doc.id);
				setParsing((p) => (p ? { ...p, stage: "Done", progress: 100 } : null));
				toast.success(`${file.name} is ready for quiz generation`);
			} catch (err) {
				toast.error(err instanceof Error ? err.message : "Upload or processing failed");
			} finally {
				setParsing(null);
			}
		},
		[uploadDoc, parseDoc, remainingBytes, onUploadComplete],
	);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		handleFiles(e.target.files);
		if (inputRef.current) inputRef.current.value = "";
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		handleFiles(e.dataTransfer.files);
	};

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
	};

	return (
		<div className={className}>
			<input
				ref={inputRef}
				type="file"
				accept=".pdf,application/pdf,.txt,text/plain"
				onChange={handleChange}
				className="hidden"
			/>

			{parsing ? (
				<ParsingProgress
					fileName={parsing.fileName}
					stage={parsing.stage}
					progress={parsing.progress}
				/>
			) : (
				<div
					onDrop={handleDrop}
					onDragOver={handleDragOver}
					onClick={() => !isPending && inputRef.current?.click()}
					className={`
						flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed
						transition-colors cursor-pointer
						${isPending ? "border-indigo-500/50 bg-indigo-500/5 cursor-wait" : "border-gray-600 hover:border-indigo-500/50 hover:bg-gray-800/50"}
					`}
				>
					{isPending ? (
						<Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
					) : (
						<div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
							<Upload className="w-6 h-6 text-gray-400" />
						</div>
					)}
					<div className="text-center">
						<p className="font-medium text-white">
							{isPending ? "Uploading..." : "Drop PDF/TXT or click to upload"}
						</p>
						<p className="text-sm text-gray-400 mt-1">
							{formatBytes(MAX_FILE_SIZE_BYTES)} max • {formatBytes(remainingBytes)} free
						</p>
					</div>
				</div>
			)}
		</div>
	);
}
