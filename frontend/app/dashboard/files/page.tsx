import { FileManager } from "@/features/documents/components/file-manager";

export default function FileManagementPage() {
	return (
		<div className="p-4 md:p-8">
			<div className="max-w-4xl mx-auto">
				<h2 className="text-2xl font-semibold text-white mb-1">
					File Management
				</h2>
				<p className="text-gray-400 mb-6">
					Upload PDFs to generate quiz questions with AI. Select files when
					creating questions in the quiz editor.
				</p>
				<FileManager />
			</div>
		</div>
	);
}
