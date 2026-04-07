export interface GeneratedMcOption {
    text: string;
    isCorrect: boolean;
}

export type GeneratedQuestionType =
    | "MULTIPLE_CHOICE"
    | "TRUE_FALSE"
    | "SHORT_ANSWER"
    | "NUMBER_INPUT";

export type GeneratedQuestion =
    | {
          type: "MULTIPLE_CHOICE";
          text: string;
          options: GeneratedMcOption[];
          /** When false, more than one option may be marked correct. */
          onlyOneCorrect?: boolean;
      }
    | {
          type: "TRUE_FALSE";
          text: string;
          correctIsTrue: boolean;
      }
    | {
          type: "SHORT_ANSWER";
          text: string;
          correctText: string;
      }
    | {
          type: "NUMBER_INPUT";
          text: string;
          correctNumber: number;
          rangeProximity: number;
      };

export type QuestionSourceMode = "rag" | "freestyle";

export type RagContextRelevance = "matched" | "mismatch_no_relevant_info";

export interface GenerateQuestionsMeta {
    mode: QuestionSourceMode;
    ragContextRelevance?: RagContextRelevance;
    note?: string;
}

export interface GenerateQuestionsResult {
    questions: GeneratedQuestion[];
    meta?: GenerateQuestionsMeta;
}
