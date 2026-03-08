import { FileManager } from "@/features/documents/components/file-manager";

export default function FileManagementPage() {
	return (
		<div className="p-4 md:p-8">
			<div className="max-w-6xl mx-auto">
				<h2 className="text-2xl font-semibold text-white mb-4">
					File Management
				</h2>
				<FileManager />
			</div>
		</div>
	);
}
