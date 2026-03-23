"use client";

import { useRef, useEffect } from "react";
import type { ComponentType } from "react";
import { AlertCircle, CheckCircle2, FileText, Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAX_FILE_SIZE_BYTES } from "@/features/documents/lib/constants";
import {
	autoUpdate,
	flip,
	offset,
	shift,
	useFloating,
} from "@floating-ui/react-dom";

/** Document shape for attach menu (from API or mock) */
export interface AttachDocument {
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
	documents: AttachDocument[];
	selectedId: number | null;
	onSelect: (doc: AttachDocument | null) => void;
	/** Called when user selects a file. Triggers upload + parse. */
	onUpload?: (file: File) => void | Promise<void>;
	uploadPending?: boolean;
	activeParsingDocId?: number | null;
	parsingStageText?: string;
	parsingProgress?: number;
	usedBytes?: number;
	remainingBytes?: number;
	limitBytes?: number;
}

export function DocumentAttachMenu({
	open,
	onClose,
	anchorRef,
	documents,
	selectedId,
	onSelect,
	onUpload,
	uploadPending = false,
	activeParsingDocId,
	parsingStageText,
	parsingProgress,
	usedBytes = 0,
	remainingBytes,
	limitBytes,
}: DocumentAttachMenuProps) {
	const menuRef = useRef<HTMLDivElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { refs: floatingRefs, x, y, strategy } = useFloating({
		placement: "bottom-end",
		strategy: "fixed",
		whileElementsMounted: autoUpdate,
		middleware: [
			offset(6),
			flip({ fallbackPlacements: ["top-end"], padding: 8 }),
			shift({ padding: 8 }),
		],
	});

	const handleUploadClick = () => {
		if (!onUpload) return;
		fileInputRef.current?.click();
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		e.target.value = "";
		if (!file || !onUpload) return;
		await onUpload(file);
	};

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
		if (!open) return;
		if (!anchorRef.current) return;
		floatingRefs.setReference(anchorRef.current);
	}, [open, anchorRef, floatingRefs]);

	if (!open) return null;

	const parsingStageDisplay =
		parsingStageText &&
		(parsingProgress != null
			? `${parsingStageText} ${Math.round(parsingProgress)}%`
			: parsingStageText);
	const isBusy = uploadPending || !!parsingStageDisplay;
	const remaining = remainingBytes ?? Math.max(0, (limitBytes ?? 0) - usedBytes);

	const statusMeta: Record<
		AttachDocument["status"],
		{ label: string; badgeClass: string; icon: ComponentType<{ className?: string }> }
	> = {
		READY: {
			label: "Ready",
			badgeClass: "text-emerald-500 bg-emerald-500/10",
			icon: CheckCircle2,
		},
		PARSING: {
			label: "Processing",
			badgeClass: "text-emerald-300 bg-emerald-500/10",
			icon: Loader2,
		},
		UPLOADED: {
			label: "Uploaded",
			badgeClass: "text-gray-400 bg-gray-500/10",
			icon: FileText,
		},
		ERROR: {
			label: "Error",
			badgeClass: "text-red-500 bg-red-500/10",
			icon: AlertCircle,
		},
	};

	return (
		<div
			ref={(node) => {
				menuRef.current = node;
				floatingRefs.setFloating(node);
			}}
			className="min-w-[220px] max-w-[280px] rounded-xl border border-gray-700 bg-gray-900 shadow-xl py-1.5"
			role="menu"
			style={{
				position: strategy,
				left: x ?? 0,
				top: y ?? 0,
				zIndex: 60,
			}}
		>
			<input
				ref={fileInputRef}
				type="file"
				accept=".pdf,application/pdf"
				className="hidden"
				onChange={handleFileChange}
			/>
			{onUpload && (
				<button
					type="button"
					onClick={handleUploadClick}
					disabled={isBusy}
					role="menuitem"
					className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm text-gray-200 hover:bg-gray-700/80 transition-colors disabled:opacity-60 disabled:pointer-events-none"
				>
					<Upload className="w-4 h-4 text-gray-400 shrink-0" />
					<span>
						{uploadPending
							? "Uploading..."
							: parsingStageDisplay
								? parsingStageDisplay
								: "Upload files"}
					</span>
				</button>
			)}

			{(uploadPending || parsingStageText) && (
				<>
					<div className="my-1 border-t border-gray-700" />
					<div className="px-3 py-2.5">
						<div className="flex items-center justify-between gap-3 text-xs">
							<span className="text-gray-300">
								{uploadPending ? "Uploading..." : parsingStageText ?? "Processing..."}
							</span>
							{parsingProgress != null && (
								<span className="text-indigo-300 font-medium">
									{Math.round(parsingProgress)}%
								</span>
							)}
						</div>
						<div className="h-1.5 bg-gray-700 rounded-full overflow-hidden mt-2">
							<div
								className="h-full bg-indigo-500 rounded-full transition-all duration-300 ease-out"
								style={{
									width: `${Math.min(100, Math.max(0, Math.round(parsingProgress ?? 0)))}%`,
								}}
							/>
						</div>
					</div>
				</>
			)}

			{documents.length > 0 ? (
				<>
					<div className="my-1 border-t border-gray-700" />
					<div className="max-h-[240px] overflow-y-auto">
						{documents.map((doc) => {
							const meta = statusMeta[doc.status];
							const selectable = doc.status === "READY";
							const Icon = meta.icon;
							const isSelected = selectable && selectedId === doc.id;
							const isActive = activeParsingDocId != null && activeParsingDocId === doc.id;
							const iconClass =
								doc.status === "PARSING"
									? "w-5 h-5 text-emerald-300 animate-spin"
									: doc.status === "READY"
										? "w-5 h-5 text-emerald-400"
										: doc.status === "ERROR"
											? "w-5 h-5 text-red-400"
											: "w-5 h-5 text-gray-400";
							return (
								<button
									key={doc.id}
									type="button"
									disabled={!selectable}
									onClick={() => {
										onSelect(selectedId === doc.id ? null : doc);
										onClose();
									}}
									role="menuitem"
									className={cn(
										"w-full flex items-start gap-3 px-3 py-2.5 text-left text-sm transition-colors disabled:pointer-events-none disabled:opacity-60",
										isSelected
											? "bg-indigo-500/20 text-indigo-300"
											: isActive
												? "ring-1 ring-indigo-500/30 bg-indigo-500/10 text-indigo-200"
											: selectable
												? "text-gray-200 hover:bg-gray-700/80"
												: "text-gray-400",
									)}
								>
									<div className="shrink-0 w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center border border-gray-700/80">
										<Icon className={iconClass} />
									</div>
									<div className="flex-1 min-w-0">
										<p className="font-medium text-white truncate">{doc.fileName}</p>
										<p className="text-xs text-gray-400">{formatBytes(doc.fileSize)}</p>
									</div>
									<span
										className={cn(
											"shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold border border-white/10",
											meta.badgeClass,
										)}
									>
										{meta.label}
									</span>
								</button>
							);
						})}
					</div>
				</>
			) : (
				<div className="px-3 py-2.5 text-xs text-gray-500">
					No documents yet. Upload a PDF above.
				</div>
			)}

			{limitBytes != null && (
				<>
					<div className="my-1 border-t border-gray-700" />
					<div className="px-3 py-2 space-y-2">
						<div className="text-xs text-gray-500 flex items-center justify-between gap-3">
							<span>
								{formatBytes(usedBytes)} / {formatBytes(limitBytes)} used
							</span>
							<span className="text-gray-400">{formatBytes(remaining)} free</span>
						</div>
						<div className="text-[11px] text-gray-600">
							Max {formatBytes(MAX_FILE_SIZE_BYTES)} per file • PDF only
						</div>
					</div>
				</>
			)}
		</div>
	);
}
