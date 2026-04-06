import type { MockGeneratedQuestion } from "../types";

/** Randomized mock question pools for variety when testing */
export const MOCK_QUESTION_POOLS: MockGeneratedQuestion[][] = [
	[
		{ id: "gen-1", type: "MULTIPLE_CHOICE", text: "What is the primary function of mitochondria?", options: [{ text: "Protein synthesis", isCorrect: false }, { text: "ATP production", isCorrect: true }, { text: "DNA replication", isCorrect: false }, { text: "Lipid storage", isCorrect: false }] },
		{ id: "gen-2", type: "MULTIPLE_CHOICE", text: "Which organelle is responsible for photosynthesis?", options: [{ text: "Mitochondria", isCorrect: false }, { text: "Chloroplast", isCorrect: true }, { text: "Nucleus", isCorrect: false }, { text: "Golgi apparatus", isCorrect: false }] },
		{ id: "gen-3", type: "MULTIPLE_CHOICE", text: "What type of cell has a cell wall?", options: [{ text: "Animal cell only", isCorrect: false }, { text: "Plant cell only", isCorrect: false }, { text: "Both plant and bacterial cells", isCorrect: true }, { text: "Neither", isCorrect: false }] },
	],
	[
		{ id: "gen-a", type: "MULTIPLE_CHOICE", text: "In which year did World War II end?", options: [{ text: "1943", isCorrect: false }, { text: "1945", isCorrect: true }, { text: "1947", isCorrect: false }, { text: "1950", isCorrect: false }] },
		{ id: "gen-b", type: "MULTIPLE_CHOICE", text: "Who wrote Romeo and Juliet?", options: [{ text: "Charles Dickens", isCorrect: false }, { text: "William Shakespeare", isCorrect: true }, { text: "Jane Austen", isCorrect: false }, { text: "Mark Twain", isCorrect: false }] },
		{ id: "gen-c", type: "MULTIPLE_CHOICE", text: "What is the capital of Japan?", options: [{ text: "Seoul", isCorrect: false }, { text: "Beijing", isCorrect: false }, { text: "Tokyo", isCorrect: true }, { text: "Bangkok", isCorrect: false }] },
		{ id: "gen-d", type: "MULTIPLE_CHOICE", text: "Which planet is known as the Red Planet?", options: [{ text: "Venus", isCorrect: false }, { text: "Mars", isCorrect: true }, { text: "Jupiter", isCorrect: false }, { text: "Saturn", isCorrect: false }] },
	],
	[
		{ id: "gen-x", type: "MULTIPLE_CHOICE", text: "What is 15% of 80?", options: [{ text: "10", isCorrect: false }, { text: "12", isCorrect: true }, { text: "14", isCorrect: false }, { text: "16", isCorrect: false }] },
		{ id: "gen-y", type: "MULTIPLE_CHOICE", text: "Which programming language is known for web browsers?", options: [{ text: "Python", isCorrect: false }, { text: "JavaScript", isCorrect: true }, { text: "Java", isCorrect: false }, { text: "C++", isCorrect: false }] },
	],
];

/** Returns a random set of generated questions (random pool and count) for mock variety */
export function getRandomGeneratedQuestions(): MockGeneratedQuestion[] {
	const pool = MOCK_QUESTION_POOLS[Math.floor(Math.random() * MOCK_QUESTION_POOLS.length)];
	const count = 2 + Math.floor(Math.random() * (pool.length - 1));
	const shuffled = [...pool].sort(() => Math.random() - 0.5);
	return shuffled.slice(0, count).map((q, i) => ({
		...q,
		id: `${q.id}-${Date.now()}-${i}`,
	}));
}
