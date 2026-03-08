"use client";

import { FolderOpen } from "lucide-react";
import { PdfUploadZone } from "./pdf-upload-zone";
import { DocumentCard } from "./document-card";
import { useDocuments, useDocumentsTotalSize } from "../hooks/use-documents";
import {
	MAX_TOTAL_STORAGE_BYTES,
	formatBytes,
} from "../lib/constants";

export function FileManager() {
	const { data: documents = [], isLoading, error } = useDocuments();
	const { data: totalSize = 0 } = useDocumentsTotalSize();
	const usagePercent = (totalSize / MAX_TOTAL_STORAGE_BYTES) * 100;

	return (
		<div className="space-y-6">
			{/* Storage usage bar */}
			<div className="p-4 rounded-lg bg-gray-800 border border-gray-700">
				<div className="flex justify-between text-sm mb-2">
					<span className="text-gray-400">Storage used</span>
					<span className="text-white font-medium">
						{formatBytes(totalSize)} / {formatBytes(MAX_TOTAL_STORAGE_BYTES)}
					</span>
				</div>
				<div className="h-2 bg-gray-700 rounded-full overflow-hidden">
					<div
						className="h-full bg-indigo-500 rounded-full transition-all duration-500"
						style={{ width: `${Math.min(100, usagePercent)}%` }}
					/>
				</div>
			</div>

			{/* Upload zone */}
			<PdfUploadZone />

			{/* Document list */}
			<div>
				<h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
					<FolderOpen className="w-5 h-5 text-gray-400" />
					Your documents
				</h3>

				{isLoading ? (
					<div className="flex items-center justify-center py-12 text-gray-400">
						Loading...
					</div>
				) : error ? (
					<div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
						Failed to load documents
					</div>
				) : documents.length === 0 ? (
					<div className="p-8 rounded-lg bg-gray-800/50 border border-gray-700 border-dashed text-center">
						<p className="text-gray-400">No documents yet</p>
						<p className="text-sm text-gray-500 mt-1">
							Upload a PDF above to get started
						</p>
					</div>
				) : (
					<div className="space-y-3">
						{documents.map((doc) => (
							<DocumentCard
								key={doc.id}
								document={doc}
								showDelete
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
