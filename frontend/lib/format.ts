/**
 * Shared date and duration formatting for the app.
 */

export function formatDate(
	iso: string | null,
	options?: Intl.DateTimeFormatOptions,
): string {
	if (!iso) return "—";
	const defaultOptions: Intl.DateTimeFormatOptions = {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	};
	return new Date(iso).toLocaleDateString(undefined, options ?? defaultOptions);
}

export function formatDateTime(iso: string | null): string {
	if (!iso) return "—";
	return new Date(iso).toLocaleString();
}

export function formatDurationMs(ms: number | null): string {
	if (ms === null || !Number.isFinite(ms) || ms <= 0) return "—";
	const totalSeconds = Math.round(ms / 1000);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	if (minutes <= 0) return `${seconds}s`;
	return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}
