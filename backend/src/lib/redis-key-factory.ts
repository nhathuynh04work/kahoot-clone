export const lobbyPinKey = (pin: string) => `lobby:pin:${pin}`;

export const lobbyIndexKey = (lobbyId: number) => `lobby:${lobbyId}:index`;

export const lobbyOnlinePlayersKey = (lobbyId: number) =>
    `lobby:${lobbyId}:online`;

export const lobbyAnsweredKey = (lobbyId: number, questionId: number) =>
    `lobby:${lobbyId}:question:${questionId}:answered`;
