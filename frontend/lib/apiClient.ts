"use client";

import axios, { AxiosError } from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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
		const rawMessage: unknown = data?.message;
		const errorMessage = Array.isArray(rawMessage)
			? String(rawMessage[0] ?? "An error occurred")
			: typeof rawMessage === "string"
				? rawMessage
				: "An error occurred";

		// 401 Unauthorized
		if (error.response && error.response.status === 401) {
			if (
				typeof window !== "undefined" &&
				!(
					window.location.pathname === "/auth/login" ||
					window.location.pathname === "/auth/admin-login"
				)
			) {
				const isAdminRoute =
					window.location.pathname.startsWith("/admin/") ||
					window.location.pathname.startsWith("/admin");

				window.location.href = isAdminRoute ? "/auth/admin-login" : "/auth/login";
			}
		}

		return Promise.reject(new Error(errorMessage));
	}
);
