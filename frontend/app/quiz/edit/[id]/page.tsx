"use server";

import { getQuiz } from "@/app/actions/quiz";
import { notFound } from "next/navigation";

interface QuizEditPageProps {
	params: Promise<{ id: string }>;
}

export default async function QuizEditPage({ params }: QuizEditPageProps) {
	const id = (await params).id;
	const quiz = await getQuiz(id);

	if (!quiz) notFound();

	return (
		<div>
			<h1 className="text-3xl font-bold">Editing: {quiz.title}</h1>

			<p>{quiz.questions.length} questions</p>

			<pre className="mt-4 p-4 bg-gray-100 rounded text-black">
				{JSON.stringify(quiz, null, 2)}
			</pre>
		</div>
	);
}
