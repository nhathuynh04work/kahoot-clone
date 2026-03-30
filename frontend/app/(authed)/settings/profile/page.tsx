import { getCurrentUser } from "@/features/auth/api/server-actions";
import { ProfileEditForm } from "@/features/profile/components/profile-edit-form";

export default async function ProfileSettingsPage() {
	const user = await getCurrentUser();

	return (
		<div className="p-4 md:p-8">
			<div className="max-w-xl mx-auto space-y-6">
				<header>
					<h1 className="text-2xl font-bold">Edit profile</h1>
					<p className="text-sm text-gray-400 mt-2">{user?.email}</p>
				</header>

				{user && <ProfileEditForm initialName={user.name ?? ""} userId={user.id} />}
			</div>
		</div>
	);
}

