"use server";

import { apiServer } from "@/lib/apiServer";
import { User } from "@/lib/types/user";
import { redirect } from "next/navigation";

export async function getCurrentUser(): Promise<User> {
	const api = await apiServer();
	let user = null;

	try {
		const { data } = await api.get("/auth/me");
		user = data;
	} catch (error: any) {
		if (error.statusCode === 401) {
			redirect("/auth/login");
		}
		console.log(error.message);
	}

	return user;
}
