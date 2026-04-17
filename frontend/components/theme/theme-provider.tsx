"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "app-theme";

type ThemeContextValue = {
	theme: ThemePreference;
	resolvedTheme: ResolvedTheme;
	setTheme: (theme: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredPreference(): ThemePreference {
	return "light";
}

function getSystemTheme(): ResolvedTheme {
	if (typeof window === "undefined") return "light";
	return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";
}

function applyResolvedTheme(resolved: ResolvedTheme) {
	document.documentElement.dataset.theme = resolved;
	document.documentElement.classList.toggle("dark", resolved === "dark");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setThemeState] = useState<ThemePreference>(() => readStoredPreference());
	const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => getSystemTheme());

	const resolvedTheme: ResolvedTheme = theme === "system" ? systemTheme : theme;

	useEffect(() => {
		applyResolvedTheme(resolvedTheme);
		try {
			window.localStorage.setItem(STORAGE_KEY, theme);
		} catch {
			// ignore storage failures (private mode, etc.)
		}
	}, [theme, resolvedTheme]);

	useEffect(() => {
		if (theme !== "system") return;

		const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
		if (!mq) return;

		const onChange = () => setSystemTheme(getSystemTheme());

		if (typeof mq.addEventListener === "function") {
			mq.addEventListener("change", onChange);
			return () => mq.removeEventListener("change", onChange);
		}

		// Safari < 14 fallback
		mq.addListener(onChange);
		return () => mq.removeListener(onChange);
	}, [theme]);

	const value = useMemo<ThemeContextValue>(
		() => ({
			theme,
			resolvedTheme,
			setTheme: setThemeState,
		}),
		[theme, resolvedTheme],
	);

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
	const ctx = useContext(ThemeContext);
	if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
	return ctx;
}

