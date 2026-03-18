import { searchQuizzes } from "@/features/quizzes/api/server-actions";
import { DashboardQuizToolbar } from "@/features/quizzes/components/dashboard-quiz-toolbar";
import { QuizGridClient } from "@/features/quizzes/components/quiz-grid-client";

export default async function DashboardPage({
	searchParams,
}: {
	searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
	const sp = (await searchParams) ?? {};
	const q = typeof sp.q === "string" ? sp.q : undefined;
	const sort = typeof sp.sort === "string" ? sp.sort : undefined;
	const { items: quizzes } = await searchQuizzes({
		q,
		sort,
		page: 1,
		pageSize: 200,
	});

	return (
		<div className="p-4 md:p-8">
			<div className="max-w-6xl mx-auto">
				<div className="mb-4 flex items-end justify-between gap-4">
					<div>
						<h2 className="text-2xl font-semibold text-white">
							Your Quizzes
						</h2>
						<p className="mt-1 text-sm text-gray-400">
							Search by title and sort your library.
						</p>
					</div>
				</div>

				<DashboardQuizToolbar />

				{quizzes.length === 0 ? (
					<div className="text-center bg-gray-800 p-10 rounded-lg shadow-sm border border-gray-700">
						<h3 className="text-xl font-medium text-white">
							No quizzes found.
						</h3>
						<p className="text-gray-400 my-2">
							Get started by clicking &quot;Create quiz&quot; in the
							sidebar!
						</p>
					</div>
				) : (
					<QuizGridClient quizzes={quizzes} />
				)}
			</div>
		</div>
	);
}
