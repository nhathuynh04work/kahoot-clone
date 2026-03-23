export type User = {
	id: number;
	email: string;
	name: string | null;
	role: "USER" | "ADMIN";
};
