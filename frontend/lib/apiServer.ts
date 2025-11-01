"use server";

import axios, { AxiosError } from "axios";
import { cookies } from "next/headers";
import { AppError } from "./app-error";

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
			const data: any = error.response?.data;
			const errorMessage = data?.message || "Unknown API Error";
			const errorStatus = error.status || 500;

			return Promise.reject(new AppError(errorMessage, errorStatus));
		}
	);

	return api;
};
