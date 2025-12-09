"use server";

import { apiServer } from "@/lib/apiServer";
import { User } from "@/features/auth/types";

export const getCurrentUser = async () => {
	const api = await apiServer();
	let user = null;

	try {
		const { data } = await api.get("/auth/me");
		user = data;
	} catch (error: any) {
		console.log(error);
	}

	return user as User;
};
