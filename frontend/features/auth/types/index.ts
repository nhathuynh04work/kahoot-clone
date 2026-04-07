export type UserVip = {
	isVip: boolean;
	source: string;
	currentPeriodEnd: string | null;
	cancelAtPeriodEnd: boolean;
};

export type UserLimits = {
	maxQuestionsPerQuiz: number;
	maxDocuments: number;
	maxTotalStorageBytes: number;
	canUseShortAnswerAndRange: boolean;
};

export type User = {
	id: number;
	email: string;
	name: string | null;
	avatarUrl?: string | null;
	role: "USER" | "ADMIN";
	vip?: UserVip;
	limits?: UserLimits;
};
