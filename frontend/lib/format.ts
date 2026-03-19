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

export function formatRelativeTime(iso: string | Date | null): string {
	if (!iso) return "—";
	const date = typeof iso === "string" ? new Date(iso) : iso;
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMins = Math.floor(diffMs / 60000);
	const diffHours = Math.floor(diffMs / 3600000);
	const diffDays = Math.floor(diffMs / 86400000);
	if (diffMins < 1) return "Just now";
	if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;
	if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
	if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
	return formatDate(iso instanceof Date ? iso.toISOString() : iso, { month: "short", day: "numeric", year: "numeric" });
}
