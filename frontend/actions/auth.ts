"use server";

import { apiServer } from "@/lib/apiServer";
import { User } from "@/lib/types/user";

export async function getCurrentUser(): Promise<User> {
	const api = await apiServer();
	let user = null;

	try {
		const { data } = await api.get("/auth/me");
		user = data;
	} catch (error: any) {
		console.log(error);
	}

	return user;
}
