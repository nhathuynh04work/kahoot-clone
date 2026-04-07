"use server";

import type { Metadata } from "next";
import { getCurrentUser } from "@/features/auth/api/server-actions";
import { getQuiz } from "@/features/quizzes/api/server-actions";
import { QuizEditor } from "@/features/quizzes/components/quiz-editor/quiz-editor";
import { notFound, redirect } from "next/navigation";

interface QuizEditPageProps {
	params: Promise<{ id: string }>;
}

export async function generateMetadata({
	params,
}: QuizEditPageProps): Promise<Metadata> {
	const id = (await params).id;
	const user = await getCurrentUser();
	if (!user) {
		return { title: "Edit quiz" };
	}
	try {
		const quiz = await getQuiz(id);
		if (!quiz) {
			return { title: "Quiz not found" };
		}
		const name = quiz.title?.trim();
		return { title: name ? `${name} · Editor` : "Quiz editor" };
	} catch {
		return { title: "Edit quiz" };
	}
}

export default async function QuizEditPage({ params }: QuizEditPageProps) {
	const user = await getCurrentUser();

	if (!user) redirect("/auth/login");

	const id = (await params).id;
	const quiz = await getQuiz(id);

	if (!quiz) notFound();

	return (
		<QuizEditor
			quiz={quiz}
			maxQuestionsPerQuiz={user.limits?.maxQuestionsPerQuiz ?? 20}
			canUseVipQuestionTypes={
				user.limits?.canUseShortAnswerAndRange ?? false
			}
		/>
	);
}
