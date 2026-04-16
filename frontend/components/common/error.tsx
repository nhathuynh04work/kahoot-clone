"use client";

export default function Error({ error }: { error: string }) {
	return (
		<div className="text-center p-10 text-red-600 dark:text-red-400 bg-(--app-surface-muted) border border-(--app-border) rounded-lg max-w-xl mx-auto mt-10">
			<h2 className="text-xl font-semibold">Error</h2>
			<p>{error}</p>
		</div>
	);
}
