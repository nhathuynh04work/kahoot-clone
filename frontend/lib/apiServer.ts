"use server";

import axios, { AxiosError } from "axios";
import { cookies } from "next/headers";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const apiServer = async () => {
	const cookieStore = await cookies();
	const token = cookieStore.get("access_token")?.value;

	const api = axios.create({
		baseURL,
		headers: {
			Cookie: `access_token=${token}`,
		},
	});

	api.interceptors.response.use(
		(response) => response,
		(error: AxiosError) => {
			console.error(`[API Server Error] ${error.response?.data}`);
			return Promise.reject(error);
		}
	);

	return api;
};
