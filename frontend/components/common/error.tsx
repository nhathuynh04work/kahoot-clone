"use client";

export default function Error({ error }: { error: string }) {
	return (
		<div className="text-center p-10 text-red-400 bg-gray-800 rounded-lg max-w-xl mx-auto mt-10">
			<h2 className="text-xl font-semibold">Error</h2>
			<p>{error}</p>
		</div>
	);
}
