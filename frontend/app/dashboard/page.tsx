import { getQuizzes } from "@/features/quizzes/api/server-actions";
import { QuizGridClient } from "@/features/quizzes/components/quiz-grid-client";

export default async function DashboardPage() {
	const quizzes = await getQuizzes();

	return (
		<div className="p-4 md:p-8">
			<div className="max-w-6xl mx-auto">
				<h2 className="text-2xl font-semibold text-white mb-4">
					Your Quizzes
				</h2>

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
