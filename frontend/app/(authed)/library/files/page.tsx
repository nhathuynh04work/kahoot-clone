import { FileManager } from "@/features/documents/components/file-manager";
import { getCurrentUser } from "@/features/auth/api/server-actions";

export default async function LibraryFilesPage() {
	const viewer = await getCurrentUser();
	return (
		<div className="p-4 md:p-8">
			<div className="max-w-6xl mx-auto">
				<FileManager viewerId={viewer?.id} />
			</div>
		</div>
	);
}

