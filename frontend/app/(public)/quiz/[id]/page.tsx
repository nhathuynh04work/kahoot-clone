import { notFound } from "next/navigation";
import { getPublicQuiz } from "@/features/quizzes/api/server-actions";
import type { QuizFullDetails } from "@/features/quizzes/types";
import { PublicQuizDetailsDrawer } from "@/features/public/components/public-quiz-details-drawer";

export default async function PublicQuizPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const quizId = Number(id);
	if (!Number.isFinite(quizId) || quizId <= 0) notFound();

	let publicQuiz: (QuizFullDetails & { saveCount?: number; playCount?: number }) | null =
		null;
	try {
		publicQuiz = (await getPublicQuiz(String(quizId))) as any;
	} catch {
		publicQuiz = null;
	}

	return <PublicQuizDetailsDrawer quizId={quizId} publicQuiz={publicQuiz} />;
}

