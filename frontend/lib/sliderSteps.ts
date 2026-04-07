export function computeNiceStep(
	min: number,
	max: number,
	targetStops = 20,
): number {
	if (!Number.isFinite(min) || !Number.isFinite(max)) return 1;
	const lo = Math.min(min, max);
	const hi = Math.max(min, max);
	const span = Math.max(hi - lo, 1e-9);

	const stops = Math.max(2, Math.floor(targetStops));
	const raw = span / (stops - 1);
	if (!Number.isFinite(raw) || raw <= 0) return 1;

	const pow10 = Math.pow(10, Math.floor(Math.log10(raw)));
	const norm = raw / pow10;

	let nice = 1;
	if (norm <= 1) nice = 1;
	else if (norm <= 2) nice = 2;
	else if (norm <= 5) nice = 5;
	else nice = 10;

	return nice * pow10;
}

export function snapToStep(value: number, min: number, step: number): number {
	if (!Number.isFinite(value) || !Number.isFinite(min)) return value;
	const s = Number.isFinite(step) && step > 0 ? step : 1;
	const n = Math.round((value - min) / s);
	return min + n * s;
}

export function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

export function normalizeRange(
	a: number,
	b: number,
	min: number,
	max: number,
): [number, number] {
	const lo = clamp(Math.min(a, b), min, max);
	const hi = clamp(Math.max(a, b), min, max);
	return [lo, hi];
}

