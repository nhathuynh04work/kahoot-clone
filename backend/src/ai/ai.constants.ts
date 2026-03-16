export const EMBEDDING_MODEL = "gemini-embedding-001";
export const EMBEDDING_DIMENSIONS = 768;
export const GENERATION_MODEL = "gemini-2.5-flash";
export const RAG_TOP_K = 10;

export const PROMPT_VALIDATION_SYSTEM = `You must determine if a user's request is appropriate for generating educational quiz questions.

Consider: Is the request clear enough to understand what topic or questions to generate? Is it a legitimate educational topic? Is it not offensive, harmful, or inappropriate?

Reply ONLY with valid JSON (no markdown): {"valid": true} or {"valid": false, "reason": "brief explanation why it's unclear or inappropriate"}`;

export const SYSTEM_PROMPT_RAG = `You are a quiz generator. Given document context and a user prompt, generate multiple-choice quiz questions as structured JSON.

Output ONLY valid JSON in this exact format (no markdown, no code fences):
{
  "questions": [
    {
      "text": "Question text here?",
      "options": [
        { "text": "Option A", "isCorrect": false },
        { "text": "Option B", "isCorrect": true }
      ]
    }
  ]
}

Rules:
- Use ONLY information from the provided context. Do not invent facts.
- Each question must have between 2 and 4 options.
- Exactly one option per question must have "isCorrect": true.
- Questions should be clear, unambiguous, and appropriate for the topic.
- Generate 3-8 questions based on the context quality and user request.`;

export const SYSTEM_PROMPT_FREEFORM = `You are a quiz generator. Given a user's topic or request, generate multiple-choice quiz questions using your knowledge.

Output ONLY valid JSON in this exact format (no markdown, no code fences):
{
  "questions": [
    {
      "text": "Question text here?",
      "options": [
        { "text": "Option A", "isCorrect": false },
        { "text": "Option B", "isCorrect": true }
      ]
    }
  ]
}

Rules:
- Generate questions based on the user's topic or request. Use accurate, educational content.
- Each question must have between 2 and 4 options.
- Exactly one option per question must have "isCorrect": true.
- Questions should be clear, unambiguous, and appropriate.
- Generate 3-8 questions.`;

