import { redirect } from "next/navigation";
import { getCurrentUser } from "../actions/auth";
import { createQuiz, getQuizzes } from "../actions/quiz";
import Link from "next/link";

export default async function DashboardPage() {
	const user = await getCurrentUser();

	if (!user) {
		redirect("/auth/login");
	}

	const quizzes = await getQuizzes();

	return (
		<div className="min-h-screen bg-slate-50 p-4 md:p-8">
			<div className="max-w-6xl mx-auto">
				{/* Header Section */}
				<div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
					<h1 className="text-3xl font-bold text-gray-800">
						Welcome back, {user.email}!
					</h1>

					<form action={createQuiz}>
						<button
							type="submit"
							className="w-full sm:w-auto text-center bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition shadow-sm">
							Create New Quiz
						</button>
					</form>
				</div>

				{/* Quizzes List Section */}
				<h2 className="text-2xl font-semibold text-gray-700 mb-4">
					Your Quizzes
				</h2>

				{/* Check if quizzes array is empty */}
				{quizzes.length === 0 ? (
					<div className="text-center bg-white p-10 rounded-lg shadow-sm border border-gray-200">
						<h3 className="text-xl font-medium text-gray-800">
							No quizzes found.
						</h3>
						<p className="text-gray-600 my-2">
							Get started by creating a new one!
						</p>
						<Link
							href="/quizzes/create"
							className="font-medium text-blue-600 hover:underline">
							Create your first quiz
						</Link>
					</div>
				) : (
					// Display quizzes in a grid
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{quizzes.map((quiz) => (
							<Link
								href={`/quiz/edit/${quiz.id}`}
								key={quiz.id}
								className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 group">
								<h3 className="text-xl font-semibold text-gray-900 mb-2 truncate">
									{quiz.title || "Untitled Quiz"}
								</h3>
								<p className="text-gray-600 mb-4">
									{quiz.questions.length}{" "}
									{quiz.questions.length === 1
										? "question"
										: "questions"}
								</p>
								<span className="font-medium text-blue-600 group-hover:underline">
									Edit Quiz &rarr;
								</span>
							</Link>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
