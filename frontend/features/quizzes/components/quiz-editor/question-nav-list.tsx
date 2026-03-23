"use client";

import { useEffect, useState } from "react";
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
} from "@dnd-kit/core";
import {
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { QuestionWithOptions } from "@/features/quizzes/types";
import { QuestionNavItem } from "./question-nav-item";
import { SortableQuestionNavItem } from "./sortable-question-nav-item";
import { Plus } from "lucide-react";

interface QuestionNavListProps {
	questions: QuestionWithOptions[];
	activeQuestionId: number;
	onQuestionSelect: (id: number) => void;
	onAddQuestion: () => void;
	onMoveQuestion?: (fromIndex: number, toIndex: number) => void;
}

export function QuestionNavList({
	questions,
	activeQuestionId,
	onQuestionSelect,
	onAddQuestion,
	onMoveQuestion,
}: QuestionNavListProps) {
	const [isMounted, setIsMounted] = useState(false);
	useEffect(() => {
		const t = window.setTimeout(() => setIsMounted(true), 0);
		return () => window.clearTimeout(t);
	}, []);

	const canDrag = Boolean(onMoveQuestion) && isMounted;

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!onMoveQuestion || !over || active.id === over.id) return;

		const fromIndex = questions.findIndex((q) => String(q.id) === active.id);
		const toIndex = questions.findIndex((q) => String(q.id) === over.id);
		if (fromIndex >= 0 && toIndex >= 0) {
			onMoveQuestion(fromIndex, toIndex);
		}
	};

	const listContent = (
		<div className="grow overflow-y-auto py-2 space-y-1">
			{canDrag ? (
				<DndContext
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragEnd={handleDragEnd}>
					<SortableContext
						items={questions.map((q) => String(q.id))}
						strategy={verticalListSortingStrategy}>
						{questions.map((q, i) => (
							<SortableQuestionNavItem
								key={q.id ?? `temp-${i}`}
								id={q.id}
								question={q}
								index={i}
								isActive={q.id === activeQuestionId}
								onSelect={() => onQuestionSelect(q.id)}
							/>
						))}
					</SortableContext>
				</DndContext>
			) : (
				questions.map((q, i) => (
					<div
						key={q.id ?? `temp-${i}`}
						onClick={() => onQuestionSelect(q.id)}
						className="px-2">
						<QuestionNavItem
							question={q}
							index={i}
							isActive={q.id === activeQuestionId}
						/>
					</div>
				))
			)}
		</div>
	);

	return (
		<div className="flex-1 flex flex-col h-full">
			{listContent}

			<div className="shrink-0 w-full p-3">
				<button
					onClick={onAddQuestion}
					className="flex items-center justify-center gap-2 w-full font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors py-3 rounded-lg cursor-pointer text-sm">
					<Plus className="w-5 h-5" />
					<span>Add question</span>
				</button>
			</div>
		</div>
	);
}
