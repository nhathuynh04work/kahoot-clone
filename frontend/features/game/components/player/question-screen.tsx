"use client";

import { Option, QuestionWithOptions } from "@/lib/types/quiz";
import { useState } from "react";
import OptionButton from "../common/option-button";

export default function QuestionScreen({
	question,
	onSelect,
}: {
	question: QuestionWithOptions;
	onSelect: (optionId: number) => void;
}) {
	const [hasSelected, setHasSelected] = useState(false);

	function handleSelectOption(optionId: number) {
		setHasSelected(true);
		onSelect(optionId);
	}

	return (
		<div className="flex flex-col items-center justify-center min-h-screen text-white p-4">
			<h2 className="text-3xl font-bold mb-8 text-center">
				{question?.text}
			</h2>
			<div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
				{question?.options.map((option: Option) => (
					<OptionButton
						key={option.id}
						option={option}
						isDisabled={hasSelected}
						onClick={handleSelectOption}
					/>
				))}
			</div>
		</div>
	);
}
