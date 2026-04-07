import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Library",
};

export default function LibraryHomePage() {
	return (
		<div className="p-4 md:p-8">
			<div className="max-w-6xl mx-auto">
				<div className="rounded-lg border border-gray-700 bg-gray-800/50 p-10 text-center">
					<h1 className="text-xl font-semibold text-white">My library</h1>
					<p className="mt-2 text-sm text-gray-400">
						Choose a section from the sidebar.
					</p>
				</div>
			</div>
		</div>
	);
}

