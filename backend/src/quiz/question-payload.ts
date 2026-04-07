import { BadRequestException } from "@nestjs/common";
import { QuestionType } from "../generated/prisma/client.js";
import type { Prisma } from "../generated/prisma/client.js";

export const QUESTION_DATA_VERSION = 1;

export type McOptionStored = { text: string; sortOrder: number };

export type MultipleChoiceData = {
    v?: number;
    options: McOptionStored[];
    /**
     * When true (default), exactly one option may be correct.
     * When false, multiple options may be correct; player picks one and wins if it is among correct indices.
     */
    onlyOneCorrect?: boolean;
    /** 0-based indices of correct options (non-empty). */
    correctIndices: number[];
};

export type TrueFalseData = {
    v?: number;
    /** If true, option index 0 ("True") is correct; otherwise index 1 ("False"). */
    correctIsTrue: boolean;
};

export type ShortAnswerData = {
    v?: number;
    correctText: string;
    /** When false (default), compare case-insensitively. */
    caseSensitive?: boolean;
};

export type NumberInputData = {
    v?: number;
    /** When true, answer is correct if it falls within correctNumber ± rangeProximity (inclusive). */
    allowRange: boolean;
    /**
     * When allowRange is false, the exact expected number.
     * When allowRange is true, this is also required (used with rangeProximity).
     */
    correctNumber?: number;
    /** When allowRange is true (new format), accept answers within ± proximity of correctNumber (inclusive). */
    rangeProximity?: number;
};

/** Option row shape expected by the quiz editor / legacy UI (id = stable 0-based index). */
export type ClientMcOption = {
    id: number;
    questionId?: number;
    text?: string;
    isCorrect: boolean;
    sortOrder: number;
};

function normalizeMcCorrectIndices(o: Record<string, unknown>, optionCount: number): number[] {
    const rawArr = o.correctIndices;
    if (Array.isArray(rawArr)) {
        const set = new Set<number>();
        for (const x of rawArr) {
            if (typeof x === "number" && Number.isFinite(x)) {
                const i = Math.floor(x);
                if (i >= 0 && i < optionCount) set.add(i);
            }
        }
        return [...set].sort((a, b) => a - b);
    }
    const ci = o.correctIndex;
    if (typeof ci === "number" && Number.isFinite(ci)) {
        const i = Math.max(0, Math.min(Math.floor(ci), Math.max(0, optionCount - 1)));
        return optionCount > 0 ? [i] : [];
    }
    return optionCount > 0 ? [0] : [];
}

export function defaultQuestionData(
    type: QuestionType,
): MultipleChoiceData | TrueFalseData | ShortAnswerData | NumberInputData {
    switch (type) {
        case QuestionType.MULTIPLE_CHOICE:
            return {
                v: QUESTION_DATA_VERSION,
                options: [
                    { text: "Option 1", sortOrder: 0 },
                    { text: "Option 2", sortOrder: 1 },
                ],
                onlyOneCorrect: true,
                correctIndices: [0],
            };
        case QuestionType.TRUE_FALSE:
            return { v: QUESTION_DATA_VERSION, correctIsTrue: true };
        case QuestionType.SHORT_ANSWER:
            return { v: QUESTION_DATA_VERSION, correctText: "", caseSensitive: false };
        case QuestionType.NUMBER_INPUT:
            return {
                v: QUESTION_DATA_VERSION,
                allowRange: false,
                correctNumber: 0,
                rangeProximity: 0,
            };
        default:
            throw new BadRequestException("Unsupported question type");
    }
}

export function parseQuestionData(
    type: QuestionType,
    raw: Prisma.JsonValue,
): MultipleChoiceData | TrueFalseData | ShortAnswerData | NumberInputData {
    if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
        return defaultQuestionData(type);
    }
    const o = raw as Record<string, unknown>;
    switch (type) {
        case QuestionType.MULTIPLE_CHOICE: {
            const optionsRaw = o.options;
            const options: McOptionStored[] = Array.isArray(optionsRaw)
                ? optionsRaw.map((item, i) => {
                      if (!item || typeof item !== "object" || Array.isArray(item)) {
                          return { text: "", sortOrder: i };
                      }
                      const r = item as Record<string, unknown>;
                      const text = typeof r.text === "string" ? r.text : "";
                      const sortOrder =
                          typeof r.sortOrder === "number" && Number.isFinite(r.sortOrder)
                              ? r.sortOrder
                              : i;
                      return { text, sortOrder };
                  })
                : [];
            const onlyOneCorrect =
                typeof o.onlyOneCorrect === "boolean" ? o.onlyOneCorrect : true;
            let correctIndices = normalizeMcCorrectIndices(o, options.length);

            // If only one correct answer is allowed, normalize to exactly one index.
            // Default to the first option (index 0) if multiple are marked correct.
            if (onlyOneCorrect !== false) {
                if (correctIndices.length === 0) correctIndices = options.length > 0 ? [0] : [];
                else if (correctIndices.length > 1) correctIndices = [correctIndices[0]];
            }
            return {
                v: typeof o.v === "number" ? o.v : QUESTION_DATA_VERSION,
                options,
                onlyOneCorrect,
                correctIndices,
            };
        }
        case QuestionType.TRUE_FALSE: {
            const correctIsTrue =
                typeof o.correctIsTrue === "boolean" ? o.correctIsTrue : true;
            return {
                v: typeof o.v === "number" ? o.v : QUESTION_DATA_VERSION,
                correctIsTrue,
            };
        }
        case QuestionType.SHORT_ANSWER: {
            const correctText = typeof o.correctText === "string" ? o.correctText : "";
            const caseSensitive =
                typeof o.caseSensitive === "boolean" ? o.caseSensitive : false;
            return {
                v: typeof o.v === "number" ? o.v : QUESTION_DATA_VERSION,
                correctText,
                caseSensitive,
            };
        }
        case QuestionType.NUMBER_INPUT: {
            const allowRange = typeof o.allowRange === "boolean" ? o.allowRange : false;
            const correctNumber =
                typeof o.correctNumber === "number" && Number.isFinite(o.correctNumber)
                    ? o.correctNumber
                    : undefined;
            const rangeProximity =
                typeof o.rangeProximity === "number" &&
                Number.isFinite(o.rangeProximity) &&
                o.rangeProximity >= 0
                    ? o.rangeProximity
                    : undefined;
            return {
                v: typeof o.v === "number" ? o.v : QUESTION_DATA_VERSION,
                allowRange,
                correctNumber,
                rangeProximity,
            };
        }
        default:
            throw new BadRequestException("Unsupported question type");
    }
}

export function validateQuestionDataForSave(type: QuestionType, raw: Prisma.JsonValue): void {
    const data = parseQuestionData(type, raw);
    if (type === QuestionType.MULTIPLE_CHOICE) {
        const mc = data as MultipleChoiceData;
        const sorted = sortMcOptions(mc.options);
        if (sorted.length < 2 || sorted.length > 4) {
            throw new BadRequestException("Multiple choice questions need between 2 and 4 options.");
        }
        for (const opt of sorted) {
            if (!opt.text?.trim()) {
                throw new BadRequestException("Each option must have non-empty text.");
            }
        }
        if (mc.correctIndices.length === 0) {
            throw new BadRequestException("At least one correct option is required.");
        }
        for (const idx of mc.correctIndices) {
            if (idx < 0 || idx >= sorted.length) {
                throw new BadRequestException("Invalid correctIndices for multiple choice question.");
            }
        }
        const onlyOne = mc.onlyOneCorrect !== false;
        if (!onlyOne && mc.correctIndices.length < 1) {
            throw new BadRequestException("Mark at least one correct option.");
        }
    }
    if (type === QuestionType.TRUE_FALSE) {
        /* correctIsTrue is always valid boolean */
    }
    if (type === QuestionType.SHORT_ANSWER) {
        if (!(data as ShortAnswerData).correctText?.trim()) {
            throw new BadRequestException("Short answer questions require a non-empty correctText.");
        }
    }
    if (type === QuestionType.NUMBER_INPUT) {
        const ni = data as NumberInputData;
        if (ni.correctNumber == null || !Number.isFinite(ni.correctNumber)) {
            throw new BadRequestException("Number input questions require correctNumber.");
        }

        if (ni.allowRange === true) {
            if (
                ni.rangeProximity == null ||
                !Number.isFinite(ni.rangeProximity) ||
                ni.rangeProximity < 0
            ) {
                throw new BadRequestException("Number input range requires rangeProximity >= 0.");
            }
        }
    }
}

export function sortMcOptions(options: McOptionStored[]): McOptionStored[] {
    return [...options].sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
        return 0;
    });
}

export function mcOptionsToClient(questionId: number, data: MultipleChoiceData): ClientMcOption[] {
    const sorted = sortMcOptions(data.options);
    const correct = new Set(data.correctIndices);
    return sorted.map((opt, index) => ({
        id: index,
        questionId,
        text: opt.text,
        isCorrect: correct.has(index),
        sortOrder: opt.sortOrder,
    }));
}

function trueFalseOptionsToClient(questionId: number, data: TrueFalseData): ClientMcOption[] {
    const t = data.correctIsTrue;
    return [
        {
            id: 0,
            questionId,
            text: "True",
            isCorrect: t,
            sortOrder: 0,
        },
        {
            id: 1,
            questionId,
            text: "False",
            isCorrect: !t,
            sortOrder: 1,
        },
    ];
}

export function getMcCorrectIndicesForGrading(
    type: QuestionType,
    data: Prisma.JsonValue,
): number[] | null {
    if (type === QuestionType.MULTIPLE_CHOICE) {
        return (parseQuestionData(type, data) as MultipleChoiceData).correctIndices;
    }
    if (type === QuestionType.TRUE_FALSE) {
        const tf = parseQuestionData(type, data) as TrueFalseData;
        return [tf.correctIsTrue ? 0 : 1];
    }
    return null;
}

/** Strips correct answer for live play payloads (MC/TF options without isCorrect). */
export function stripQuestionForPlay<T extends { type: QuestionType; data: Prisma.JsonValue }>(
    q: T,
): T & { options: ClientMcOption[] } {
    const type = q.type;
    if (type === QuestionType.MULTIPLE_CHOICE) {
        const mc = parseQuestionData(type, q.data) as MultipleChoiceData;
        const sorted = sortMcOptions(mc.options);
        const options: ClientMcOption[] = sorted.map((opt, index) => ({
            id: index,
            text: opt.text,
            isCorrect: false,
            sortOrder: opt.sortOrder,
        }));
        return { ...q, options };
    }
    if (type === QuestionType.TRUE_FALSE) {
        const options: ClientMcOption[] = [
            { id: 0, text: "True", isCorrect: false, sortOrder: 0 },
            { id: 1, text: "False", isCorrect: false, sortOrder: 1 },
        ];
        return { ...q, options };
    }
    if (type === QuestionType.SHORT_ANSWER) {
        // Strip correctText; keep case-sensitivity so the client can show a hint if needed.
        const sa = parseQuestionData(type, q.data) as ShortAnswerData;
        return {
            ...q,
            options: [],
            data: {
                v: typeof (sa as any).v === "number" ? (sa as any).v : QUESTION_DATA_VERSION,
                caseSensitive: sa.caseSensitive === true,
            } as unknown as Prisma.JsonValue,
        };
    }
    if (type === QuestionType.NUMBER_INPUT) {
        const ni = parseQuestionData(type, q.data) as NumberInputData;
        const allowRange = ni.allowRange === true;
        return {
            ...q,
            options: [],
            data: {
                v: typeof (ni as any).v === "number" ? (ni as any).v : QUESTION_DATA_VERSION,
                allowRange,
                ...(allowRange ? { rangeProximity: ni.rangeProximity } : {}),
            } as unknown as Prisma.JsonValue,
        };
    }
    return { ...q, options: [], data: {} as Prisma.JsonValue };
}

/** Full question for host/editor: MC/TF options with isCorrect; SA/NR flattened for forms. */
export function attachClientOptions<
    T extends { id: number; type: QuestionType; data: Prisma.JsonValue },
>(
    q: T,
): T & {
    options: ClientMcOption[];
    correctText?: string;
    caseSensitive?: boolean;
    allowRange?: boolean;
    correctNumber?: number;
    rangeProximity?: number;
    onlyOneCorrect?: boolean;
    correctIsTrue?: boolean;
} {
    if (q.type === QuestionType.MULTIPLE_CHOICE) {
        const mc = parseQuestionData(q.type, q.data) as MultipleChoiceData;
        return {
            ...q,
            options: mcOptionsToClient(q.id, mc),
            onlyOneCorrect: mc.onlyOneCorrect !== false,
        };
    }
    if (q.type === QuestionType.TRUE_FALSE) {
        const tf = parseQuestionData(q.type, q.data) as TrueFalseData;
        return {
            ...q,
            options: trueFalseOptionsToClient(q.id, tf),
            correctIsTrue: tf.correctIsTrue,
        };
    }
    if (q.type === QuestionType.SHORT_ANSWER) {
        const sa = parseQuestionData(q.type, q.data) as ShortAnswerData;
        return {
            ...q,
            options: [],
            correctText: sa.correctText,
            caseSensitive: sa.caseSensitive === true,
        };
    }
    const ni = parseQuestionData(q.type, q.data) as NumberInputData;
    return {
        ...q,
        options: [],
        allowRange: ni.allowRange === true,
        correctNumber: ni.correctNumber,
        rangeProximity: ni.rangeProximity,
    };
}

export function getNumberInput(type: QuestionType, data: Prisma.JsonValue): NumberInputData | null {
    if (type !== QuestionType.NUMBER_INPUT) return null;
    return parseQuestionData(type, data) as NumberInputData;
}
