import { HistoryPageClient } from "@/features/game/components/history-page-client";

export default function HistoryPage() {
	return (
		<div className="p-4 md:p-8">
			<div className="max-w-6xl mx-auto">
				<h2 className="text-2xl font-semibold text-white mb-4">
					Quiz Session History
				</h2>
				<HistoryPageClient />
			</div>
		</div>
	);
}
