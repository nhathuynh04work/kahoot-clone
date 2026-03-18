import { HistoryPageClient } from "@/features/game/components/history-page-client";

export default function HistoryPage() {
	return (
		<div className="p-4 md:p-8">
			<div className="max-w-6xl mx-auto">
				<HistoryPageClient />
			</div>
		</div>
	);
}
