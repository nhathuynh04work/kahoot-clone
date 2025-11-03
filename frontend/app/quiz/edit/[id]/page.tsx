"use server";

import { getCurrentUser } from "@/app/actions/auth";
import { getQuiz } from "@/app/actions/quiz";
import QuestionNavList from "@/components/quiz-editor/question-nav-list";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

interface QuizEditPageProps {
	params: Promise<{ id: string }>;
}

export default async function QuizEditPage({ params }: QuizEditPageProps) {
	const user = await getCurrentUser();

	if (!user) redirect("/auth/login");

	const id = (await params).id;
	const quiz = await getQuiz(id);

	if (!quiz) notFound();

	return (
		<div className="flex flex-col h-screen">
			<div className="flex items-center px-4 py-2 border-b border-gray-700">
				<p className="text-3xl mr-24">Logo</p>
				<div className="border border-gray-200 pl-5 pr-2 py-2 flex items-center gap-10">
					<p className={`${quiz.title ? "" : "text-gray-300"}`}>
						{quiz.title ? quiz.title : "Enter quiz title..."}
					</p>

					<button className="bg-gray-300 text-black px-2 py-1 rounded-xs text-sm">
						Settings
					</button>
				</div>

				<div className="ml-auto">
					<Link
						href={"/dashboard"}
						className="border border-gray-200 px-4 py-2">
						Save
					</Link>
				</div>
			</div>

			<div className="flex-1 grid grid-cols-12 grid-rows-1 overflow-hidden">
				{/* List */}
				<QuestionNavList questions={quiz.questions} quizId={quiz.id} />

				{/* Content Editor */}
				<div className="col-span-7 col-start-3">2</div>

				{/* Item Settings */}
				<div className="col-span-3 col-start-10">3</div>
			</div>
		</div>
	);
}
