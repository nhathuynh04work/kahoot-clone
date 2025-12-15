"use client";

interface PlayerWaitingScreenProps {
	nickname: string;
}

export const PlayerWaitingScreen = ({ nickname }: PlayerWaitingScreenProps) => {
	return <div>{nickname}</div>;
};
