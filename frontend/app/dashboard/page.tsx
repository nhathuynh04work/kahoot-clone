import { getQuizzes } from "../actions/quiz";
import Link from "next/link";
import { Image } from "lucide-react";

export default async function DashboardPage() {
	const quizzes = await getQuizzes();

	return (
		<div className="p-4 md:p-8">
			<div className="max-w-6xl mx-auto">
				<h2 className="text-2xl font-semibold text-white mb-4">
					Your Quizzes
				</h2>

				{/* Check if quizzes array is empty */}
				{quizzes.length === 0 ? (
					<div className="text-center bg-gray-800 p-10 rounded-lg shadow-sm border border-gray-700">
						<h3 className="text-xl font-medium text-white">
							No quizzes found.
						</h3>
						<p className="text-gray-400 my-2">
							Get started by clicking &quot;Create&quot; in the
							top bar!
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						{quizzes.map((quiz) => (
							<Link
								href={`/quiz/edit/${quiz.id}`}
								key={quiz.id}
								className="block bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-700 group overflow-hidden hover:border-indigo-600">
								{/* Image Placeholder */}
								<div className="h-40 bg-gray-700 flex items-center justify-center text-gray-500 group-hover:opacity-90">
									<Image className="w-12 h-12" />
								</div>

								<div className="p-4">
									<h3 className="text-xl font-semibold text-white mb-2 truncate">
										{quiz.title || "Untitled Quiz"}
									</h3>
									<p className="text-gray-400 mb-4">
										{quiz.questions.length}{" "}
										{quiz.questions.length < 2
											? "question"
											: "questions"}
									</p>
									<span className="font-medium text-indigo-400 group-hover:underline">
										Edit Quiz &rarr;
									</span>
								</div>
							</Link>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
