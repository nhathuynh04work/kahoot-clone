"use client";

import { useRef, useEffect } from "react";
import { Upload, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MockDocument {
	id: number;
	fileName: string;
	fileSize: number;
	status: "READY" | "PARSING" | "UPLOADED" | "ERROR";
}

function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface DocumentAttachMenuProps {
	open: boolean;
	onClose: () => void;
	anchorRef: React.RefObject<HTMLElement | null>;
	mockDocuments: MockDocument[];
	selectedId: number | null;
	onSelect: (doc: MockDocument | null) => void;
	onUploadClick?: () => void;
	uploadPending?: boolean;
	/** Used storage in bytes (for limit display) */
	usedBytes?: number;
	/** Total limit in bytes */
	limitBytes?: number;
}

export function DocumentAttachMenu({
	open,
	onClose,
	anchorRef,
	mockDocuments,
	selectedId,
	onSelect,
	onUploadClick,
	uploadPending = false,
	usedBytes = 0,
	limitBytes,
}: DocumentAttachMenuProps) {
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;
		const handleClickOutside = (e: MouseEvent) => {
			if (
				menuRef.current &&
				!menuRef.current.contains(e.target as Node) &&
				anchorRef.current &&
				!anchorRef.current.contains(e.target as Node)
			) {
				onClose();
			}
		};
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("keydown", handleEscape);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleEscape);
		};
	}, [open, onClose, anchorRef]);

	useEffect(() => {
		if (!open || !anchorRef.current || !menuRef.current) return;
		const rect = anchorRef.current.getBoundingClientRect();
		const menu = menuRef.current;
		menu.style.position = "fixed";
		menu.style.left = `${rect.left}px`;
		menu.style.top = `${rect.bottom + 6}px`;
		menu.style.bottom = "auto";
		menu.style.zIndex = "60";
	}, [open, anchorRef]);

	if (!open) return null;

	const readyDocs = mockDocuments.filter((d) => d.status === "READY");

	return (
		<div
			ref={menuRef}
			className="min-w-[220px] max-w-[280px] rounded-xl border border-gray-700 bg-gray-900 shadow-xl py-1.5"
			role="menu"
		>
			<button
				type="button"
				onClick={() => {
					onUploadClick?.();
				}}
				disabled={uploadPending}
				role="menuitem"
				className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm text-gray-200 hover:bg-gray-700/80 transition-colors disabled:opacity-60 disabled:pointer-events-none"
			>
				<Upload className="w-4 h-4 text-gray-400 shrink-0" />
				<span>{uploadPending ? "Uploading..." : "Upload files"}</span>
			</button>

			{readyDocs.length > 0 && (
				<>
					<div className="my-1 border-t border-gray-700" />
					<div className="max-h-[240px] overflow-y-auto">
						{readyDocs.map((doc) => (
							<button
								key={doc.id}
								type="button"
								onClick={() => {
									onSelect(selectedId === doc.id ? null : doc);
									onClose();
								}}
								role="menuitem"
								className={cn(
									"w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors",
									selectedId === doc.id
										? "bg-indigo-500/20 text-indigo-300"
										: "text-gray-200 hover:bg-gray-700/80",
								)}
							>
								<FileText className="w-4 h-4 text-indigo-400 shrink-0" />
								<span className="truncate flex-1 min-w-0">{doc.fileName}</span>
							</button>
						))}
					</div>
				</>
			)}

			{readyDocs.length === 0 && (
				<div className="px-3 py-2.5 text-xs text-gray-500">
					No documents yet. Upload a PDF above.
				</div>
			)}

			{limitBytes != null && (
				<>
					<div className="my-1 border-t border-gray-700" />
					<div className="px-3 py-1.5 text-xs text-gray-500">
						{formatBytes(usedBytes)} / {formatBytes(limitBytes)} used
					</div>
				</>
			)}
		</div>
	);
}
