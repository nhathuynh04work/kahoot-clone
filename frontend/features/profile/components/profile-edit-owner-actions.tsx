"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { ProfileEditModal } from "./profile-edit-modal";

export function ProfileEditOwnerActions({
	userId,
	initialName,
	initialAvatarUrl,
}: {
	userId: number;
	initialName: string;
	initialAvatarUrl?: string | null;
}) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<button
				type="button"
				onClick={() => setOpen(true)}
				className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors"
				aria-label="Edit profile"
				title="Edit profile"
			>
				<Pencil className="w-4 h-4 text-white" aria-hidden />
			</button>

			<ProfileEditModal
				open={open}
				onClose={() => setOpen(false)}
				userId={userId}
				initialName={initialName}
				initialAvatarUrl={initialAvatarUrl}
			/>
		</>
	);
}

