"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { QuestionWithOptions } from "@/features/quizzes/types";
import QuestionNavItem from "./question-nav-item";

interface SortableQuestionNavItemProps {
	id: number;
	question: QuestionWithOptions;
	index: number;
	isActive: boolean;
	onSelect: () => void;
}

export default function SortableQuestionNavItem({
	id,
	question,
	index,
	isActive,
	onSelect,
}: SortableQuestionNavItemProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: String(id) });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			onClick={onSelect}
			className={`px-2 cursor-grab active:cursor-grabbing ${isDragging ? "opacity-50" : ""}`}>
			<QuestionNavItem
				question={question}
				index={index}
				isActive={isActive}
			/>
		</div>
	);
}
