import { Option, Question } from "../../generated/prisma/client.js";

export type QuestionWithOptions = Question & { options: Option[] };
