"use client";

import { Loader2 } from "lucide-react";

export default function Loading() {
	return (
		<div className="flex flex-col items-center justify-center h-64 text-white">
			<Loader2 className="animate-spin w-8 h-8 text-indigo-400" />
			<p className="mt-4">Creating Lobby...</p>
		</div>
	);
}
