"use client";

import { X } from "lucide-react";
import { ProfileEditForm } from "./profile-edit-form";

export function ProfileEditModal({
	open,
	onClose,
	userId,
	initialName,
	initialAvatarUrl,
}: {
	open: boolean;
	onClose: () => void;
	userId: number;
	initialName: string;
	initialAvatarUrl?: string | null;
}) {
	if (!open) return null;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
			onClick={onClose}
			aria-modal
			role="dialog"
		>
			<div
				className="relative w-full max-w-lg rounded-lg bg-(--app-elevated) border border-(--app-border) shadow-2xl"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-center justify-between p-4 border-b border-(--app-border)">
					<h3 className="text-xl font-semibold text-(--app-fg)">Edit profile</h3>
					<button
						type="button"
						onClick={onClose}
						className="p-1 rounded-full text-(--app-fg-muted) hover:bg-(--app-surface-muted) hover:text-(--app-fg) transition-colors"
						aria-label="Close"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				<div className="p-6">
					<ProfileEditForm
						initialName={initialName}
						userId={userId}
						initialAvatarUrl={initialAvatarUrl}
						onDone={onClose}
					/>
				</div>
			</div>
		</div>
	);
}

