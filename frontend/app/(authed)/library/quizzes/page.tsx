import {
	getMySavedPublicQuizzes,
	searchQuizzes,
} from "@/features/quizzes/api/server-actions";
import { DashboardQuizToolbar } from "@/features/quizzes/components/dashboard-quiz-toolbar";
import { QuizGrid } from "@/features/quizzes/components/quiz-grid";
import { getCurrentUser } from "@/features/auth/api/server-actions";

export default async function LibraryQuizzesPage({
	searchParams,
}: {
	searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
	const viewer = await getCurrentUser();
	const sp = (await searchParams) ?? {};
	const q = typeof sp.q === "string" ? sp.q : undefined;
	const tab =
		typeof sp.tab === "string" && sp.tab === "favorites" ? "favorites" : "my";

	const quizzes =
		tab === "favorites"
			? await getMySavedPublicQuizzes().then((items) => {
					if (!q?.trim()) return items;
					const needle = q.trim().toLowerCase();
					return items.filter((quiz) =>
						(quiz.title ?? "").toLowerCase().includes(needle),
					);
				})
			: await searchQuizzes({
					q,
					page: 1,
					pageSize: 200,
				}).then((r) => r.items);

	return (
		<div className="p-4 md:p-8">
			<div className="max-w-6xl mx-auto">
				<DashboardQuizToolbar />

				{quizzes.length === 0 ? (
					<div className="text-center bg-gray-800 p-10 rounded-lg shadow-sm border border-gray-700">
						<h3 className="text-xl font-medium text-white">No quizzes found.</h3>
						<p className="text-gray-400 my-2">
							Get started by clicking &quot;Create quiz&quot; in the sidebar!
						</p>
					</div>
				) : (
					<QuizGrid quizzes={quizzes} viewerId={viewer?.id} />
				)}
			</div>
		</div>
	);
}

