"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { apiClient } from "@/lib/apiClient";
import Link from "next/link";
import { Loader2 } from "lucide-react";

type RegisterInput = {
	email: string;
	password: string;
	name?: string;
};

export function RegisterForm() {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<RegisterInput>();

	const router = useRouter();
	const [apiError, setApiError] = useState<string | null>(null);

	async function onSubmit(values: RegisterInput) {
		setApiError(null);

		try {
			await apiClient.post("/auth/register", values);
			router.push("/auth/login");
		} catch (error: any) {
			setApiError(error?.message);
		}
	}

	const inputClasses =
		"w-full px-4 py-3 bg-gray-950/40 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-transparent transition-all duration-200";
	const labelClasses = "block text-sm font-semibold text-gray-300 mb-2";
	const errorClasses = "text-red-400 text-sm mt-1 font-medium";

	return (
		<>
			<form
				onSubmit={handleSubmit(onSubmit)}
				className="flex flex-col gap-6">
				{apiError && (
					<div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-center text-sm font-medium text-red-300">
						{apiError}
					</div>
				)}

				<div>
					<label htmlFor="email" className={labelClasses}>
						Email
					</label>
					<input
						id="email"
						type="email"
						autoComplete="email"
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

				<div>
					<label htmlFor="password" className={labelClasses}>
						Password
					</label>
					<input
						id="password"
						type="password"
						autoComplete="new-password"
						{...register("password", {
							required: "Password is required",
							minLength: {
								value: 8,
								message:
									"Password must be at least 8 characters",
							},
						})}
						className={inputClasses}
						placeholder="At least 8 characters"
					/>
					{errors.password && (
						<p className={errorClasses}>
							{errors.password.message}
						</p>
					)}
				</div>

				<div>
					<label htmlFor="name" className={labelClasses}>
						Display name{" "}
						<span className="text-gray-500 font-normal">
							(Optional)
						</span>
					</label>
					<input
						id="name"
						type="text"
						autoComplete="name"
						{...register("name")}
						className={inputClasses}
						placeholder="How should we call you?"
					/>
				</div>

				<button
					type="submit"
					disabled={isSubmitting}
					className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white shadow-lg shadow-indigo-600/20 transition-all duration-200 hover:bg-indigo-500 hover:shadow-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:ring-offset-2 focus:ring-offset-gray-950 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2">
					{isSubmitting ? (
						<>
							<Loader2 className="animate-spin" size={20} />
							Creating account…
						</>
					) : (
						"Create account"
					)}
				</button>
			</form>

			<div className="mt-8 border-t border-gray-800 pt-6 text-center">
				<p className="text-sm text-gray-400">
					Already have an account?{" "}
					<Link
						href="/auth/login"
						className="font-semibold text-indigo-300 hover:text-indigo-200 transition-colors">
						Sign in
					</Link>
				</p>
			</div>
		</>
	);
}
