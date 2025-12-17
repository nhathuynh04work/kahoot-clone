// Info of lobby keyed by pin
export const lobbyPinKey = (pin: string) => `lobby:pin:${pin}`;

// Number indicating the current question index of lobbyId
export const lobbyCurrentQuestionIndexKey = (lobbyId: number) =>
    `lobby:${lobbyId}:index`;

// Set of nicknames who has an active socket to lobbyId
export const lobbyOnlinePlayersKey = (lobbyId: number) =>
    `lobby:${lobbyId}:online`;

// Set of nicknames who have answered the questionId in lobbyId
export const lobbyAnsweredKey = (lobbyId: number, questionId: number) =>
    `lobby:${lobbyId}:question:${questionId}:answered`;

// Record<string, string> representing how many answer submitted for optionId of questionId in lobbyId
export const questionStatsKey = (lobbyId: number, questionId: number) =>
    `lobby:${lobbyId}:question:${questionId}:stats`;

export const lobbyLeaderboardKey = (lobbyId: number) =>
    `lobby:${lobbyId}:leaderboard`;

// List of all the questions of quizId
export const quizQuestionsKey = (quizId: number) => `quiz:${quizId}:questions`;
