"use client";

import {
	FileText,
	Loader2,
	CheckCircle2,
	AlertCircle,
	Globe,
	Lock,
	Trash2,
	Bookmark,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Document } from "../types";
import { formatBytes } from "../lib/constants";
import { toggleDocumentSave } from "../api/client-actions";
import {
	useDeleteDocument,
	useUpdateDocumentVisibility,
} from "../hooks/use-documents";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useRouter } from "next/navigation";

interface DocumentCardProps {
	document: Document;
	onSelect?: (doc: Document) => void;
	isSelected?: boolean;
	selectable?: boolean;
	showDelete?: boolean;
	showVisibilityToggle?: boolean;
	showSave?: boolean;
	isSaved?: boolean;
	viewerId?: number;
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
		className: "text-emerald-300",
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
	showVisibilityToggle = false,
	showSave = false,
	isSaved = false,
	viewerId,
}: DocumentCardProps) {
	const { mutate: deleteDoc, isPending: isDeleting } = useDeleteDocument();
	const { mutate: updateVisibility, isPending: isUpdatingVisibility } = useUpdateDocumentVisibility();
	const config = statusConfig[document.status];
	const Icon = config.icon;
	const visibility = document.visibility ?? "PRIVATE";
	const queryClient = useQueryClient();
	const router = useRouter();
	const isOwner = typeof viewerId === "number" && viewerId === document.userId;

	const {
		mutate: toggleSave,
		isPending: isSaving,
	} = useMutation({
		mutationFn: () => toggleDocumentSave(document.id),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["mySavedDocuments"] });
			void queryClient.invalidateQueries({ queryKey: ["mySavedPublicDocuments"] });
			router.refresh();
		},
	});

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
			<div className="shrink-0 w-10 h-10 rounded-lg bg-gray-700 border border-gray-600/50 flex items-center justify-center">
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
				<div className="mt-2 flex items-center gap-2 min-w-0">
					<Link
						href={`/users/${document.userId}`}
						className="flex items-center gap-2 min-w-0 text-xs text-gray-400 hover:text-gray-200 transition-colors"
						onClick={(e) => e.stopPropagation()}
					>
						<UserAvatar name={document.authorName ?? undefined} size={18} />
						<span className="truncate">{document.authorName ?? "Unknown"}</span>
					</Link>
					{typeof document.saveCount === "number" && (
						<span className="text-xs text-gray-500">
							• {document.saveCount} {document.saveCount === 1 ? "save" : "saves"}
						</span>
					)}
				</div>
			</div>

			{showVisibilityToggle && isOwner && (
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						const nextVisibility = visibility === "PUBLIC" ? "PRIVATE" : "PUBLIC";
						updateVisibility({ id: document.id, visibility: nextVisibility });
					}}
					disabled={isUpdatingVisibility}
					className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors disabled:opacity-50"
					aria-label={
						visibility === "PUBLIC" ? "Make document private" : "Make document public"
					}
					title={visibility === "PUBLIC" ? "Public" : "Private"}
				>
					{visibility === "PUBLIC" ? (
						<Globe className="w-4 h-4" />
					) : (
						<Lock className="w-4 h-4" />
					)}
				</button>
			)}

			{showSave && !isOwner && (
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						toggleSave();
					}}
					disabled={isSaving}
					className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors disabled:opacity-50"
					aria-label="Toggle document save"
				>
					<Bookmark className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} />
				</button>
			)}

			{showDelete && isOwner && (
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						deleteDoc(document.id);
					}}
					disabled={isDeleting}
					className="p-2 rounded-md text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
					aria-label="Delete document"
					title="Delete"
				>
					<Trash2 className="w-4 h-4" />
				</button>
			)}
		</div>
	);
}
