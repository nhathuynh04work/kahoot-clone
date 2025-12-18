"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { apiClient } from "@/lib/apiClient";
import Link from "next/link";
import { Loader2 } from "lucide-react";

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
			router.push("/dashboard");
		} catch (error: any) {
			setApiError(error?.message);
		}
	}

	// Dark theme styles
	const inputClasses =
		"w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200";
	const labelClasses = "block text-sm font-medium text-gray-300 mb-2";
	const errorClasses = "text-red-400 text-sm mt-1 font-medium";

	return (
		<div className="bg-gray-800 border border-gray-700 p-8 shadow-xl rounded-xl">
			<form
				onSubmit={handleSubmit(onSubmit)}
				className="flex flex-col gap-6">
				{/* API Error Box */}
				{apiError && (
					<div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-center text-sm font-medium">
						{apiError}
					</div>
				)}

				{/* Email */}
				<div>
					<label htmlFor="email" className={labelClasses}>
						Email Address
					</label>
					<input
						id="email"
						type="email"
						{...register("email", {
							required: "Email is required",
						})}
						className={inputClasses}
						placeholder="name@example.com"
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
					className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 px-4 rounded-lg font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2">
					{isSubmitting ? (
						<>
							<Loader2 className="animate-spin" size={20} />
							Logging in...
						</>
					) : (
						"Log In"
					)}
				</button>
			</form>

			{/* Link to Register Page */}
			<div className="text-center mt-8 pt-6 border-t border-gray-700">
				<p className="text-sm text-gray-400">
					Don&apos;t have an account?{" "}
					<Link
						href="/auth/register"
						className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
						Sign up
					</Link>
				</p>
			</div>
		</div>
	);
}
