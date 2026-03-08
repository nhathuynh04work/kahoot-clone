"use client";

import { X, Sparkles, FileText } from "lucide-react";
import { useState } from "react";
import { PdfUploadZone } from "./pdf-upload-zone";
import { DocumentCard } from "./document-card";
import { useDocuments } from "../hooks/use-documents";
import type { Document } from "../types";

interface AiChatbotPanelProps {
	onClose: () => void;
	onFileSelect?: (doc: Document | null) => void;
}

export function AiChatbotPanel({
	onClose,
	onFileSelect,
}: AiChatbotPanelProps) {
	const { data: documents = [], isLoading } = useDocuments();
	const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

	const handleSelect = (doc: Document) => {
		const next = selectedDoc?.id === doc.id ? null : doc;
		setSelectedDoc(next);
		onFileSelect?.(next);
	};

	const readyDocs = documents.filter((d) => d.status === "READY");

	return (
		<div className="fixed inset-0 z-50 flex justify-end">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-sm"
				onClick={onClose}
				aria-hidden
			/>

			{/* Panel */}
			<div
				className="relative w-full max-w-md bg-gray-900 border-l border-gray-700 shadow-xl flex flex-col animate-in slide-in-from-right duration-300"
				aria-modal
				role="dialog"
			>
				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b border-gray-700">
					<div className="flex items-center gap-2">
						<div className="w-9 h-9 rounded-lg bg-indigo-500/20 flex items-center justify-center">
							<Sparkles className="w-5 h-5 text-indigo-400" />
						</div>
						<div>
							<h2 className="font-semibold text-white">
								AI Quiz Generator
							</h2>
							<p className="text-xs text-gray-400">
								Generate questions from your PDFs
							</p>
						</div>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
						aria-label="Close panel"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-4 space-y-6">
					{/* Source file */}
					<section>
						<h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
							<FileText className="w-4 h-4" />
							Source document
						</h3>
						<p className="text-sm text-gray-500 mb-3">
							Select a PDF to generate questions from. Only ready documents
							can be used.
						</p>

						{readyDocs.length === 0 ? (
							<div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700 border-dashed text-center">
								<p className="text-sm text-gray-400">
									No ready documents yet
								</p>
								<p className="text-xs text-gray-500 mt-1">
									Upload a PDF below first
								</p>
							</div>
						) : (
							<div className="space-y-2 max-h-48 overflow-y-auto">
								{readyDocs.map((doc) => (
									<DocumentCard
										key={doc.id}
										document={doc}
										selectable
										isSelected={selectedDoc?.id === doc.id}
										onSelect={handleSelect}
										showDelete={false}
									/>
								))}
							</div>
						)}
					</section>

					{/* Upload */}
					<section>
						<h3 className="text-sm font-medium text-gray-400 mb-3">
							Upload new PDF
						</h3>
						<PdfUploadZone
							onUploadComplete={() => {
								// Refetch will happen via query invalidation
							}}
						/>
					</section>

					{/* Placeholder for future chat/generate */}
					<section className="pt-4 border-t border-gray-700">
						<div className="p-4 rounded-lg bg-gray-800/30 border border-gray-700 border-dashed">
							<p className="text-sm text-gray-500 text-center">
								Chat & generate UI coming soon. Selected:{" "}
								{selectedDoc ? (
									<span className="text-indigo-400">{selectedDoc.fileName}</span>
								) : (
									<span className="text-gray-600">None</span>
								)}
							</p>
						</div>
					</section>
				</div>
			</div>
		</div>
	);
}
