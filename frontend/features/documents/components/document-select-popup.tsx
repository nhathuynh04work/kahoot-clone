"use client";

import { X, FileText, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

/** Mock document for UI-only document popup */
export interface MockDocument {
	id: number;
	fileName: string;
	fileSize: number;
	status: "READY" | "PARSING" | "UPLOADED" | "ERROR";
}

interface DocumentSelectPopupProps {
	open: boolean;
	onClose: () => void;
	/** Mock list of documents (UI only) */
	mockDocuments: MockDocument[];
	selectedId: number | null;
	onSelect: (doc: MockDocument | null) => void;
	/** Mock: called when user clicks upload area */
	onMockUpload?: () => void;
	uploadPending?: boolean;
}

export function DocumentSelectPopup({
	open,
	onClose,
	mockDocuments,
	selectedId,
	onSelect,
	onMockUpload,
	uploadPending = false,
}: DocumentSelectPopupProps) {
	if (!open) return null;

	const readyDocs = mockDocuments.filter((d) => d.status === "READY");

	return (
		<div
			className="fixed inset-0 z-60 flex items-end justify-center sm:items-center sm:pb-0 bg-black/20"
			onClick={onClose}
			aria-modal
			role="dialog"
		>
			<div
				className="relative w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-gray-900 border border-gray-700 shadow-2xl max-h-[70vh] flex flex-col"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-center justify-between p-4 border-b border-gray-700">
					<h3 className="font-semibold text-white flex items-center gap-2">
						<FileText className="w-5 h-5 text-indigo-400" />
						Select or upload document
					</h3>
					<button
						type="button"
						onClick={onClose}
						className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
						aria-label="Close"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				<div className="flex-1 overflow-y-auto p-4 space-y-4">
					<section>
						<p className="text-sm text-gray-400 mb-2">Choose a document to use for generating questions.</p>
						{readyDocs.length === 0 ? (
							<div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700 border-dashed text-center">
								<p className="text-sm text-gray-400">No ready documents</p>
								<p className="text-xs text-gray-500 mt-1">Upload a PDF below</p>
							</div>
						) : (
							<div className="space-y-2">
								{readyDocs.map((doc) => (
									<button
										key={doc.id}
										type="button"
										onClick={() => onSelect(selectedId === doc.id ? null : doc)}
										className={cn(
											"w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors",
											"bg-gray-800/50 border-gray-700 hover:border-indigo-500/50",
											selectedId === doc.id && "ring-2 ring-indigo-500 border-indigo-500",
										)}
									>
										<div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center shrink-0">
											<FileText className="w-5 h-5 text-emerald-500" />
										</div>
										<div className="min-w-0 flex-1">
											<p className="font-medium text-white truncate">{doc.fileName}</p>
											<p className="text-xs text-gray-400">{formatBytes(doc.fileSize)}</p>
										</div>
									</button>
								))}
							</div>
						)}
					</section>

					<section>
						<p className="text-sm text-gray-400 mb-2">Upload new PDF</p>
						<button
							type="button"
							onClick={() => onMockUpload?.()}
							disabled={uploadPending}
							className={cn(
								"w-full flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed transition-colors",
								"border-gray-600 hover:border-indigo-500/50 hover:bg-gray-800/50",
								uploadPending && "pointer-events-none opacity-70",
							)}
						>
							{uploadPending ? (
								<div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
							) : (
								<div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
									<Upload className="w-6 h-6 text-gray-400" />
								</div>
							)}
							<span className="text-sm font-medium text-white">
								{uploadPending ? "Uploading..." : "Drop PDF or click to upload"}
							</span>
							<span className="text-xs text-gray-500">Mock upload (UI only)</span>
						</button>
					</section>
				</div>
			</div>
		</div>
	);
}

function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
