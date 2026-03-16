"use client";

import axios, { AxiosError } from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const apiClient = axios.create({ baseURL, withCredentials: true });

apiClient.interceptors.response.use(
	(response) => response,

	(error: AxiosError) => {
		if (error.code === "ECONNABORTED") {
			return Promise.reject(
				new Error(
					"The AI took too long to respond. Try a smaller document or splitting it into parts.",
				),
			);
		}
		const data: any = error.response?.data;
		const errorMessage = data?.message || "An error occurred";

		// 401 Unauthorized
		if (error.response && error.response.status === 401) {
			if (
				typeof window !== "undefined" &&
				window.location.pathname !== "/auth/login"
			) {
				// Redirect to the login page
				window.location.href = "/auth/login";
			}
		}

		return Promise.reject(new Error(errorMessage));
	}
);
