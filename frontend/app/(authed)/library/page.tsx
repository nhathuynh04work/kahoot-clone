import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Library",
};

export default function LibraryHomePage() {
	return (
		<div className="p-4 md:p-8">
			<div className="max-w-6xl mx-auto">
				<div className="rounded-lg border border-(--app-border) bg-(--app-surface-muted)/80 p-10 text-center">
					<h1 className="text-xl font-semibold text-(--app-fg)">My library</h1>
					<p className="mt-2 text-sm text-(--app-fg-muted)">
						Choose a section from the sidebar.
					</p>
				</div>
			</div>
		</div>
	);
}

