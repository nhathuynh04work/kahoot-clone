"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { apiClient } from "@/lib/apiClient";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { appInputClassName } from "@/components/ui/app-input";
import { appButtonClassName } from "@/components/ui/app-button";
import { cn } from "@/lib/utils";

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

	const inputClasses = cn(
		appInputClassName,
		"px-4 py-3 rounded-xl text-base transition-colors duration-200",
	);
	const labelClasses = "block text-sm font-semibold text-(--app-fg) mb-2";
	const errorClasses = "text-red-600 text-sm mt-1 font-medium dark:text-red-400";

	return (
		<>
			<form
				onSubmit={handleSubmit(onSubmit)}
				className="flex flex-col gap-6">
				{apiError && (
					<div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-center text-sm font-medium text-red-700 dark:text-red-300">
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
						Display name
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
					className={appButtonClassName(
						"primary",
						"w-full rounded-xl px-4 py-3 text-base font-bold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/25 flex items-center justify-center gap-2",
					)}
				>
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

			<div className="mt-8 border-t border-(--app-border) pt-6 text-center">
				<p className="text-sm text-(--app-fg-muted)">
					Already have an account?{" "}
					<Link
						href="/auth/login"
						className="font-semibold text-(--app-accent) hover:opacity-90 transition-opacity"
					>
						Sign in
					</Link>
				</p>
			</div>
		</>
	);
}
