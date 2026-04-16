"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Expand, X } from "lucide-react";

export function QrJoinCard({
	pin,
	pathname = "/game/join",
	showDetails = true,
	expandable = false,
	frameless = false,
	overlay = true,
	expanded: controlledExpanded,
	onExpandedChange,
	size = 110,
	className,
}: {
	pin: string;
	pathname?: string;
	showDetails?: boolean;
	expandable?: boolean;
	frameless?: boolean;
	overlay?: boolean;
	expanded?: boolean;
	onExpandedChange?: (expanded: boolean) => void;
	size?: number | "responsive";
	className?: string;
}) {
	const joinUrl = useMemo(() => {
		if (typeof window === "undefined") return "";
		const origin = window.location.origin;
		return `${origin}${pathname}?pin=${encodeURIComponent(pin)}`;
	}, [pathname, pin]);

	const [dataUrl, setDataUrl] = useState<string>("");
	const [uncontrolledExpanded, setUncontrolledExpanded] = useState(false);
	const expanded = controlledExpanded ?? uncontrolledExpanded;
	const setExpanded =
		controlledExpanded === undefined
			? setUncontrolledExpanded
			: (next: boolean) => onExpandedChange?.(next);

	useEffect(() => {
		let cancelled = false;
		async function run() {
			if (!joinUrl) return;
			const baseSize = typeof size === "number" ? size : 360;
			const qrWidth = Math.max(360, Math.round(baseSize * 3));
			const url = await QRCode.toDataURL(joinUrl, {
				margin: 1,
				width: qrWidth,
				color: {
					dark: "#000000",
					light: "#FFFFFF",
				},
			});
			if (!cancelled) setDataUrl(url);
		}
		run();
		return () => {
			cancelled = true;
		};
	}, [joinUrl, size]);

	useEffect(() => {
		if (!expanded) return;
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") setExpanded(false);
		};
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [expanded]);

	useEffect(() => {
		onExpandedChange?.(expanded);
	}, [expanded, onExpandedChange]);

	const canExpand = expandable && (controlledExpanded === undefined || !!onExpandedChange);

	return (
		<>
			<div
				className={
					className ??
					"rounded-2xl border border-(--app-border) bg-(--app-surface-muted)/60 p-4 flex items-center gap-4"
				}
			>
				<div
					className={[
						"relative group",
						frameless ? "" : "rounded-xl border border-white/10 bg-white/5 p-2",
					].join(" ")}
				>
					{canExpand && (
						<button
							type="button"
							onClick={() => setExpanded(true)}
							className="absolute top-2 right-2 z-10 inline-flex items-center justify-center h-8 w-8 rounded-md border border-white/10 bg-black/60 text-white transition-opacity hover:bg-black/70 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
							aria-label="Expand QR and PIN"
						>
							<Expand className="h-4 w-4" aria-hidden />
						</button>
					)}
					{dataUrl ? (
						<img
							src={dataUrl}
							alt="QR code to join"
							className={
								typeof size === "number"
									? "bg-white"
									: "bg-white w-[min(80vw,360px)] h-[min(80vw,360px)]"
							}
							style={
								typeof size === "number"
									? { width: size, height: size }
									: undefined
							}
						/>
					) : (
						<div
							className={
								typeof size === "number"
									? "rounded-lg bg-white/5 animate-pulse"
									: "rounded-lg bg-white/5 animate-pulse w-[min(80vw,360px)] h-[min(80vw,360px)]"
							}
							style={
								typeof size === "number"
									? { width: size, height: size }
									: undefined
							}
						/>
					)}
				</div>
				{showDetails && (
					<div className="min-w-0">
						<p className="text-xs uppercase tracking-widest text-(--app-fg-muted)">
							Join with PIN
						</p>
						<p className="mt-1 text-2xl font-black font-mono tracking-widest text-(--app-fg)">
							{pin}
						</p>
						<p className="mt-1 text-xs text-(--app-fg-muted) break-all">{joinUrl}</p>
					</div>
				)}
			</div>

			{overlay && canExpand && expanded && (
				<div
					className="fixed inset-0 z-50"
					role="dialog"
					aria-modal="true"
					aria-label="Expanded QR and PIN"
				>
					<button
						type="button"
						className="absolute inset-0 bg-black/70"
						onClick={() => setExpanded(false)}
						aria-label="Close expanded view"
					/>

					<div className="relative z-10 min-h-dvh flex items-start justify-center pt-10 md:pt-14 px-4">
						<div className="flex flex-col items-center gap-6">
							<div className="text-center select-none">
								<p className="text-xs font-black uppercase tracking-widest text-white/70">
									Game PIN
								</p>
								<p className="mt-2 text-5xl md:text-6xl font-mono font-black tracking-widest text-white">
									{pin}
								</p>
							</div>

							<div className="relative">
								<button
									type="button"
									onClick={() => setExpanded(false)}
									className="absolute -top-3 -right-3 inline-flex items-center justify-center h-9 w-9 rounded-full border border-black/30 bg-white text-gray-900 shadow-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
									aria-label="Close"
								>
									<X className="h-4 w-4" aria-hidden />
								</button>

								{dataUrl ? (
									<img
										src={dataUrl}
										alt="QR code to join"
										className="bg-white w-[min(80vw,360px)] h-[min(80vw,360px)]"
									/>
								) : (
									<div className="bg-white/10 animate-pulse w-[min(80vw,360px)] h-[min(80vw,360px)]" />
								)}
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}

