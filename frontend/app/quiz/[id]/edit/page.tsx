"use server";

import { getCurrentUser } from "@/actions/auth";
import { getQuiz } from "@/actions/quiz";
import QuizEditor from "@/components/quiz-editor/quiz-editor";
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

	return <QuizEditor quiz={quiz} />;
}
