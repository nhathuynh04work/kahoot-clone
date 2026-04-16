"use client";

import { useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Uploader } from "@/features/img-upload/components/uploader";
import Image from "next/image";
import { Loader2, UploadCloud, Trash2 } from "lucide-react";
import { appInputClassName } from "@/components/ui/app-input";

type ProfileEditFormProps = {
	initialName: string;
	userId: number;
	initialAvatarUrl?: string | null;
	onDone?: () => void;
};

export function ProfileEditForm({
	initialName,
	userId,
	initialAvatarUrl,
	onDone,
}: ProfileEditFormProps) {
	const router = useRouter();
	const [name, setName] = useState(initialName);
	const [isSaving, setIsSaving] = useState(false);
	const [avatarUrl, setAvatarUrl] = useState<string>(initialAvatarUrl ?? "");

	const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (isSaving) return;

		try {
			setIsSaving(true);
			await apiClient.patch("/auth/me", { name, avatarUrl: avatarUrl || null });
			toast.success("Profile updated");
			onDone?.();
			router.refresh();
			router.push(`/users/${userId}`);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to update profile");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<form onSubmit={onSubmit} className="space-y-5">
			<div className="flex items-center gap-4">
				<Uploader
					onUploadSuccess={(url) => {
						setAvatarUrl(url);
					}}
				>
					{({ isUploading, error, triggerUpload }) => (
						<button
							type="button"
							onClick={triggerUpload}
							className="relative w-16 h-16 rounded-full overflow-hidden border border-(--app-border) bg-(--app-surface-muted) shrink-0 group"
							aria-label="Change avatar"
						>
							{avatarUrl ? (
								<Image
									src={avatarUrl}
									alt="Avatar"
									fill
									className="object-cover"
									sizes="64px"
								/>
							) : (
								<div className="absolute inset-0 flex items-center justify-center text-(--app-fg-muted) font-semibold">
									{(name?.trim()?.[0] ?? "?").toUpperCase()}
								</div>
							)}

							<div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
								{isUploading ? (
									<Loader2 className="w-4 h-4 animate-spin text-white" />
								) : (
									<UploadCloud className="w-4 h-4 text-white" />
								)}
							</div>

							{error && (
								<div className="absolute inset-x-0 bottom-0 px-2 py-1 text-[10px] bg-red-600/80 text-white">
									Upload failed
								</div>
							)}
						</button>
					)}
				</Uploader>

				<div className="flex-1 min-w-0">
					<p className="text-sm font-medium text-(--app-fg)">Avatar</p>
					<p className="text-xs text-(--app-fg-muted)">
						Hover and click to change.
					</p>
					{avatarUrl && (
						<button
							type="button"
							onClick={() => setAvatarUrl("")}
							className="mt-2 inline-flex items-center gap-2 text-xs text-red-600 hover:text-red-500 dark:text-red-300 dark:hover:text-red-200"
						>
							<Trash2 className="w-3.5 h-3.5" />
							Remove
						</button>
					)}
				</div>
			</div>

			<div>
				<label className="block text-sm font-medium text-(--app-fg-muted) mb-2">
					Display name
				</label>
				<input
					value={name}
					onChange={(e) => setName(e.target.value)}
					type="text"
					className={`${appInputClassName} p-3 rounded-md text-lg`}
					placeholder="Your name"
				/>
			</div>

			<div className="flex items-center justify-end gap-3">
				<button
					type="button"
					onClick={() => router.push(`/users/${userId}`)}
					className="font-semibold text-(--app-fg-muted) py-2 px-6 rounded-md hover:bg-(--app-surface-muted) hover:text-(--app-fg) transition-colors"
					disabled={isSaving}
				>
					Cancel
				</button>
				<button
					type="submit"
					disabled={isSaving}
					className="font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md px-6 py-2 transition-colors shadow-lg shadow-indigo-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
				>
					{isSaving ? "Saving..." : "Save"}
				</button>
			</div>
		</form>
	);
}

