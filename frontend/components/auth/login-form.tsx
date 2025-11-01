"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { apiClient } from "@/lib/apiClient";
import Link from "next/link";

type LoginInput = {
	email: string;
	password: string;
};

export default function LoginForm() {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginInput>();

	const router = useRouter();
	const [apiError, setApiError] = useState<string | null>(null);

	async function onSubmit(values: LoginInput) {
		setApiError(null);

		try {
			await apiClient.post("/auth/login", values);
			router.push("/");
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			setApiError(error?.message);
		}
	}

	const inputClasses =
		"w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
	const labelClasses = "block text-sm font-medium text-gray-700 mb-1";
	const errorClasses = "text-red-600 text-sm mt-1";

	return (
		<div className="bg-white p-8 shadow-lg rounded-lg">
			<form
				onSubmit={handleSubmit(onSubmit)}
				className="flex flex-col gap-5">
				{/* API Error Box */}
				{apiError && (
					<div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-center">
						{apiError}
					</div>
				)}

				{/* Email */}
				<div>
					<label htmlFor="email" className={labelClasses}>
						Email
					</label>
					<input
						id="email"
						type="email"
						{...register("email", {
							required: "Email is required",
						})}
						className={inputClasses}
						placeholder="you@example.com"
					/>
					{errors.email && (
						<p className={errorClasses}>{errors.email.message}</p>
					)}
				</div>

				{/* Password */}
				<div>
					<label htmlFor="password" className={labelClasses}>
						Password
					</label>
					<input
						id="password"
						type="password"
						{...register("password", {
							required: "Password is required",
						})}
						className={inputClasses}
						placeholder="••••••••"
					/>
					{errors.password && (
						<p className={errorClasses}>
							{errors.password.message}
						</p>
					)}
				</div>

				{/* Submit button */}
				<button
					type="submit"
					disabled={isSubmitting}
					className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200">
					{isSubmitting ? "Logging in..." : "Log In"}
				</button>
			</form>

			{/* Link to Register Page */}
			<p className="text-center text-sm text-gray-600 mt-6">
				Don&apos;t have an account?
				<Link
					href="/auth/register"
					className="font-medium text-blue-600 hover:text-blue-500">
					Sign up
				</Link>
			</p>
		</div>
	);
}
