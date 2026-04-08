import type { Metadata } from "next";
import { ReportPageClient } from "@/features/game/components/report";

export const metadata: Metadata = {
	title: "Reports",
	description: "Past game sessions and performance summaries.",
};

export default function ReportsPage() {
	return (
		<div className="p-4 sm:p-6 md:p-8">
			<div className="max-w-6xl mx-auto">
				<ReportPageClient />
			</div>
		</div>
	);
}

