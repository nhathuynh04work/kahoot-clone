"use client";

import Link from "next/link";
import { useFormContext } from "react-hook-form";
import {
	BetweenHorizontalStart,
	Binary,
	Clock,
	ListChecks,
	Shapes,
	Star,
	TextCursorInput,
} from "lucide-react";
import type { QuizFullDetails, QuestionType } from "@/features/quizzes/types";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

function SettingsSwitch({
	checked,
	onCheckedChange,
	label,
	description,
}: {
	checked: boolean;
	onCheckedChange: (next: boolean) => void;
	label: string;
	description?: string;
}) {
	return (
		<button
			type="button"
			role="switch"
			aria-checked={checked}
			onClick={() => onCheckedChange(!checked)}
			className={cn(
				"w-full flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
				checked
					? "border-indigo-500/60 bg-indigo-500/10"
					: "border-gray-700 bg-gray-900/30 hover:bg-gray-800/40",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950"
			)}
		>
			<span className="min-w-0">
				<span className="block text-sm font-semibold text-gray-200">{label}</span>
				{description ? (
					<span className="block text-xs text-gray-500 mt-0.5">{description}</span>
				) : null}
			</span>
			<span
				aria-hidden
				className={cn(
					"relative shrink-0 h-6 w-11 rounded-full border transition-colors",
					checked
						? "bg-indigo-500/80 border-indigo-400/60"
						: "bg-gray-800 border-gray-700"
				)}
			>
				<span
					className={cn(
						"absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
						checked ? "translate-x-5" : "translate-x-0.5"
					)}
				/>
			</span>
		</button>
	);
}

export function QuestionSettingsForm({
	questionIndex,
	canUseVipQuestionTypes,
	className,
}: {
	questionIndex: number;
	canUseVipQuestionTypes: boolean;
	className?: string;
}) {
	const { setValue, watch, register } = useFormContext<QuizFullDetails>();
	const prefix = `questions.${questionIndex}` as const;

	const timeLimit = watch(`${prefix}.timeLimit`) ?? 30000;
	const points = watch(`${prefix}.points`) ?? 1000;
	const questionType = (watch(`${prefix}.type`) as QuestionType | undefined) ?? "MULTIPLE_CHOICE";
	const onlyOneCorrect = watch(`${prefix}.onlyOneCorrect`) !== false;

	function applyQuestionType(next: QuestionType) {
		setValue(`${prefix}.type`, next, { shouldDirty: true, shouldTouch: true });
		if (next === "MULTIPLE_CHOICE") {
			setValue(`${prefix}.onlyOneCorrect`, true, { shouldDirty: true });
			const opts = watch(`${prefix}.options`);
			if (!opts?.length) {
				const newId = Date.now() * -1;
				setValue(`${prefix}.options`, [
					{
						id: newId,
						questionId: watch(`${prefix}.id`),
						text: "Option 1",
						isCorrect: true,
						sortOrder: 0,
					},
					{
						id: newId - 1,
						questionId: watch(`${prefix}.id`),
						text: "Option 2",
						isCorrect: false,
						sortOrder: 1,
					},
				]);
			}
		}
		if (next === "TRUE_FALSE") {
			const qid = watch(`${prefix}.id`);
			const newId = Date.now() * -1;
			setValue(`${prefix}.options`, [
				{ id: newId, questionId: qid, text: "True", isCorrect: true, sortOrder: 0 },
				{ id: newId - 1, questionId: qid, text: "False", isCorrect: false, sortOrder: 1 },
			]);
		}
		if (next === "SHORT_ANSWER") {
			setValue(`${prefix}.options`, [], { shouldDirty: true });
			setValue(`${prefix}.correctText`, watch(`${prefix}.correctText`) ?? "", { shouldDirty: true });
			setValue(`${prefix}.caseSensitive`, watch(`${prefix}.caseSensitive`) ?? false, { shouldDirty: true });
		}
		if (next === "NUMBER_INPUT") {
			setValue(`${prefix}.options`, [], { shouldDirty: true });
			setValue(`${prefix}.allowRange`, watch(`${prefix}.allowRange`) ?? false, { shouldDirty: true });
			setValue(`${prefix}.correctNumber`, watch(`${prefix}.correctNumber`) ?? 0, { shouldDirty: true });
			setValue(`${prefix}.rangeProximity`, watch(`${prefix}.rangeProximity`) ?? 0, { shouldDirty: true });
		}
	}

	return (
		<div className={cn("space-y-6", className)}>
			<div>
				<label className="text-sm font-semibold text-gray-300 flex items-center mb-2">
					<Shapes className="w-4 h-4 mr-2" aria-hidden />
					Question type
				</label>
				<Select
					value={questionType}
					onValueChange={(v) => applyQuestionType(v as QuestionType)}
					options={[
						{ value: "MULTIPLE_CHOICE", label: "Multiple choice", icon: <ListChecks /> },
						{ value: "TRUE_FALSE", label: "True / false", icon: <Binary /> },
						{
							value: "SHORT_ANSWER",
							label: "Short answer",
							disabled: !canUseVipQuestionTypes,
							icon: <TextCursorInput />,
						},
						{
							value: "NUMBER_INPUT",
							label: "Number input",
							disabled: !canUseVipQuestionTypes,
							icon: <BetweenHorizontalStart />,
						},
					]}
					ariaLabel="Question type"
					buttonClassName="bg-gray-700 border-gray-600 rounded-md p-3 focus:ring-indigo-500"
					menuClassName="border-gray-600"
				/>
				{!canUseVipQuestionTypes ? (
					<p className="mt-2 text-xs text-gray-500">
						Short answer and number input are VIP-only.{" "}
						<Link href="/settings/subscription" className="text-indigo-400 hover:text-indigo-300">
							View plans
						</Link>
					</p>
				) : null}
			</div>

			<div>
				<label className="text-sm font-semibold text-gray-300 flex items-center mb-2">
					<Clock className="w-4 h-4 mr-2" />
					Time limit
				</label>
				<Select
					value={String(timeLimit)}
					onValueChange={(v) =>
						setValue(`${prefix}.timeLimit`, parseInt(v, 10), {
							shouldDirty: true,
							shouldTouch: true,
						})
					}
					options={[
						{ value: "5000", label: "5 seconds" },
						{ value: "10000", label: "10 seconds" },
						{ value: "20000", label: "20 seconds" },
						{ value: "30000", label: "30 seconds" },
						{ value: "60000", label: "1 minute" },
						{ value: "120000", label: "2 minutes" },
					]}
					ariaLabel="Time limit"
					buttonClassName="bg-gray-700 border-gray-600 rounded-md p-3 focus:ring-indigo-500"
					menuClassName="border-gray-600"
				/>
			</div>

			<div>
				<label className="text-sm font-semibold text-gray-300 flex items-center mb-2">
					<Star className="w-4 h-4 mr-2" />
					Points
				</label>
				<Select
					value={String(points)}
					onValueChange={(v) =>
						setValue(`${prefix}.points`, parseInt(v, 10), {
							shouldDirty: true,
							shouldTouch: true,
						})
					}
					options={[
						{ value: "0", label: "No points (0)" },
						{ value: "1000", label: "Standard (1000)" },
						{ value: "2000", label: "Double points (2000)" },
					]}
					ariaLabel="Points"
					buttonClassName="bg-gray-700 border-gray-600 rounded-md p-3 focus:ring-indigo-500"
					menuClassName="border-gray-600"
				/>
			</div>

			{questionType === "MULTIPLE_CHOICE" ||
			questionType === "SHORT_ANSWER" ||
			questionType === "NUMBER_INPUT" ? (
				<div>
					<label className="text-sm font-semibold text-gray-300 flex items-center mb-2">
						<Shapes className="w-4 h-4 mr-2" aria-hidden />
						Type-specific settings
					</label>

					{questionType === "MULTIPLE_CHOICE" ? (
						<SettingsSwitch
							checked={onlyOneCorrect}
							onCheckedChange={(next) => {
								setValue(`${prefix}.onlyOneCorrect`, next, {
									shouldDirty: true,
									shouldTouch: true,
								});

								if (next) {
									const opts = (watch(`${prefix}.options`) ?? []).map((o, i) => ({
										...o,
										sortOrder: o.sortOrder ?? i,
									}));
									if (opts.length > 0) {
										const sorted = [...opts].sort((a, b) => {
											if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
											return 0;
										});
										const firstId = sorted[0]?.id;
										setValue(
											`${prefix}.options`,
											opts.map((o) => ({ ...o, isCorrect: o.id === firstId })),
											{ shouldDirty: true, shouldTouch: true }
										);
									}
								}
							}}
							label={onlyOneCorrect ? "Only one correct answer" : "Multiple correct answers"}
							description={
								onlyOneCorrect
									? "Exactly one option must be marked correct."
									: "Mark one or more options as correct."
							}
						/>
					) : null}

					{questionType === "SHORT_ANSWER" ? (
						<SettingsSwitch
							checked={watch(`${prefix}.caseSensitive`) === true}
							onCheckedChange={(next) =>
								setValue(`${prefix}.caseSensitive`, next, {
									shouldDirty: true,
									shouldTouch: true,
								})
							}
							label="Case-sensitive matching"
							description="When off, answers are matched case-insensitively."
						/>
					) : null}

					{questionType === "NUMBER_INPUT" ? (
						<div className="space-y-3">
							<SettingsSwitch
								checked={watch(`${prefix}.allowRange`) === true}
								onCheckedChange={(next) => {
									setValue(`${prefix}.allowRange`, next, {
										shouldDirty: true,
										shouldTouch: true,
									});
									if (next) {
										setValue(`${prefix}.correctNumber`, watch(`${prefix}.correctNumber`) ?? 0, {
											shouldDirty: true,
										});
										setValue(`${prefix}.rangeProximity`, watch(`${prefix}.rangeProximity`) ?? 0, {
											shouldDirty: true,
										});
									}
								}}
								label="Allow range"
								description="Accept answers within ± proximity of the correct number."
							/>

							{watch(`${prefix}.allowRange`) === true ? (
								<div>
									<label className="text-sm font-semibold text-gray-300 flex items-center mb-2">
										Proximity
									</label>
									<input
										type="number"
										step="any"
										{...register(`${prefix}.rangeProximity`, { valueAsNumber: true, min: 0 })}
										className="w-full rounded-lg bg-gray-700 border border-gray-600 px-3 py-2 text-sm text-white"
										placeholder="0"
									/>
									<p className="mt-2 text-xs text-gray-500">
										Correct = 1, proximity = 500 → accepts -499 to 501.
									</p>
								</div>
							) : null}
						</div>
					) : null}
				</div>
			) : null}
		</div>
	);
}

