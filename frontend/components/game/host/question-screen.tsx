"use client";

import { QuestionWithOptions } from "@/lib/types/quiz";

export default function QuestionScreen({
	question,
}: {
	question: QuestionWithOptions;
}) {
	return <div>{question.text}</div>;
}
