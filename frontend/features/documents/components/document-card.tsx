"use client";

import { FileText, Loader2, CheckCircle2, AlertCircle, Trash2 } from "lucide-react";
import type { Document } from "../types";
import { formatBytes } from "../lib/constants";
import { useDeleteDocument } from "../hooks/use-documents";
import { cn } from "@/lib/utils";

interface DocumentCardProps {
	document: Document;
	onSelect?: (doc: Document) => void;
	isSelected?: boolean;
	selectable?: boolean;
	showDelete?: boolean;
}

const statusConfig = {
	UPLOADED: {
		icon: FileText,
		label: "Uploaded",
		className: "text-gray-400",
	},
	PARSING: {
		icon: Loader2,
		label: "Processing...",
		className: "text-indigo-400",
	},
	READY: {
		icon: CheckCircle2,
		label: "Ready",
		className: "text-emerald-500",
	},
	ERROR: {
		icon: AlertCircle,
		label: "Error",
		className: "text-red-500",
	},
};

export function DocumentCard({
	document,
	onSelect,
	isSelected,
	selectable = false,
	showDelete = true,
}: DocumentCardProps) {
	const { mutate: deleteDoc, isPending: isDeleting } = useDeleteDocument();
	const config = statusConfig[document.status];
	const Icon = config.icon;

	return (
		<div
			className={cn(
				"flex items-center gap-3 p-4 rounded-lg border transition-colors",
				"bg-gray-800/50 border-gray-700",
				selectable &&
					"cursor-pointer hover:border-indigo-500/50 hover:bg-gray-800",
				isSelected && "ring-2 ring-indigo-500 border-indigo-500",
			)}
			onClick={() => selectable && onSelect?.(document)}
			role={selectable ? "button" : undefined}
		>
			<div className="shrink-0 w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center">
				<Icon
					className={cn(
						"w-5 h-5",
						config.className,
						document.status === "PARSING" && "animate-spin",
					)}
				/>
			</div>

			<div className="flex-1 min-w-0">
				<p className="font-medium text-white truncate">{document.fileName}</p>
				<p className="text-sm text-gray-400">
					{formatBytes(document.fileSize)} • {config.label}
				</p>
			</div>

			{showDelete && (
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						deleteDoc(document.id);
					}}
					disabled={isDeleting}
					className="p-2 rounded-md text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
					aria-label="Delete document"
				>
					<Trash2 className="w-4 h-4" />
				</button>
			)}
		</div>
	);
}
