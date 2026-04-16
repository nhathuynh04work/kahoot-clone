"use client";

import { Player } from "../../types";
import { Users, Play, X, Loader2 } from "lucide-react";
import { useState } from "react";
import { QrJoinCard } from "../common/qr-join-card";
import { PlayerChip } from "../common/player-chip";
import { AppLogo } from "@/components/layout/app-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";

interface HostWaitingScreenProps {
	pin: string;
	players: Player[];
	onStart: () => void;
}

export const HostWaitingScreen = ({
	pin,
	players,
	onStart,
}: HostWaitingScreenProps) => {
	const [joinExpanded, setJoinExpanded] = useState(false);
	const isPinReady = Boolean(pin);

	const copyPin = () => {
		if (!isPinReady) return;
		navigator.clipboard.writeText(pin);
	};

	return (
		<div className="min-h-dvh bg-(--app-bg) p-4 md:p-8 relative overflow-hidden">
			<div className="pointer-events-none absolute inset-0 bg-linear-to-br from-indigo-500/12 via-transparent to-indigo-500/8" />

			<div className="w-full max-w-6xl mx-auto flex flex-col gap-6 relative z-10">
				{!joinExpanded && (
					/* Top strip: PIN + QR (no links/copy) */
					<div className="flex justify-center">
						<div className="w-full max-w-xl rounded-2xl border border-(--app-border) bg-(--app-elevated) px-4 py-4 md:px-5 md:py-5 shadow-sm">
							<div className="flex flex-col items-center justify-center gap-4">
							<div className="text-center w-full">
								<p className="text-xs font-black uppercase tracking-widest text-(--app-fg-muted)">
									Game PIN
								</p>
								<button
									type="button"
									onClick={copyPin}
									disabled={!isPinReady}
									className={`mt-2 inline-flex items-center focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg px-1 ${
										isPinReady
											? "cursor-pointer"
											: "cursor-not-allowed opacity-70"
									}`}
									aria-label="Copy game PIN"
								>
									{isPinReady ? (
										<span className="text-4xl sm:text-5xl md:text-6xl font-mono font-black tracking-widest text-(--app-fg) select-none">
											{pin}
										</span>
									) : (
										<span className="inline-flex items-center gap-3 text-(--app-fg)">
											<Loader2 className="h-7 w-7 animate-spin" />
											<span className="text-lg font-semibold">
												Creating lobby…
											</span>
										</span>
									)}
								</button>
							</div>

							<div className="shrink-0 flex justify-center w-full">
								{isPinReady ? (
									<QrJoinCard
										pin={pin}
										showDetails={false}
										expandable
										overlay={false}
										expanded={joinExpanded}
										onExpandedChange={setJoinExpanded}
										frameless
										size={132}
										className="border-0 bg-transparent p-0 flex items-center justify-center"
									/>
								) : (
									<div className="h-[132px] w-[132px] rounded-xl border border-(--app-border) bg-(--app-surface-muted) flex items-center justify-center">
										<Loader2 className="h-6 w-6 animate-spin text-(--app-fg-muted)" />
									</div>
								)}
							</div>
						</div>
						</div>
					</div>
				)}

				{!joinExpanded && (
					<>
						{/* Logo + Start on same row, logo centered */}
						<div className="mt-8 sm:mt-10 flex flex-col gap-4 items-center md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-4">
							<div className="hidden md:block" />
							<AppLogo className="text-4xl md:text-5xl font-extrabold tracking-tight select-none md:justify-self-center" />
							<div className="justify-self-center md:justify-self-end flex items-center gap-3">
								<ThemeToggle compact />
								<button
									onClick={onStart}
									disabled={!isPinReady || players.length === 0}
									className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-transform active:scale-95 shadow-md ${
										!isPinReady || players.length === 0
											? "bg-(--app-surface-muted) text-(--app-fg-muted) cursor-not-allowed border border-(--app-border)"
											: "bg-indigo-600 hover:bg-indigo-500 text-white"
									}`}
								>
									<Play size={16} fill="currentColor" />
									Start
								</button>
							</div>
						</div>
					</>
				)}

				{!joinExpanded && (
					/* Player List & Action */
					<div className="w-full flex justify-center">
						<div className="w-full rounded-3xl border border-(--app-border) bg-(--app-elevated) p-6 md:p-8 flex flex-col items-center gap-6 shadow-sm">
							<div className="inline-flex items-center gap-2 rounded-full border border-(--app-border) bg-(--app-surface-muted)/70 px-3 py-1.5 text-indigo-600 dark:text-indigo-300 font-semibold">
								<Users size={20} />
								<span>{players.length} joined</span>
							</div>

							<div className="w-full min-h-[200px] flex flex-wrap justify-center content-start gap-4">
								{players.length === 0 ? (
									<div className="flex flex-col items-center justify-center w-full h-32 gap-2">
										<div className="rounded-xl bg-indigo-600 px-4 py-2 text-white font-black">
											Waiting for players…
										</div>
									</div>
								) : (
									players.map((player) => (
										<PlayerChip key={player.nickname} nickname={player.nickname} />
									))
								)}
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Expanded join view (animates into center, hides rest) */}
			{joinExpanded && (
				<div className="fixed inset-0 z-50">
					<button
						type="button"
						className="absolute inset-0 bg-black/70"
						onClick={() => setJoinExpanded(false)}
						aria-label="Close expanded view"
					/>
					<div className="relative z-10 min-h-dvh flex items-center justify-center p-4">
						<div className="flex flex-col items-center gap-6">
							<div className="text-center animate-in fade-in slide-in-from-top-6 duration-300">
								<p className="text-xs font-black uppercase tracking-widest text-white/80">
									Game PIN
								</p>
								<p className="mt-2 text-5xl sm:text-6xl md:text-7xl font-mono font-black tracking-widest text-white">
									{pin}
								</p>
							</div>

							<div className="relative animate-in fade-in slide-in-from-bottom-6 duration-300">
								<button
									type="button"
									onClick={() => setJoinExpanded(false)}
									className="absolute -top-4 -right-4 z-20 inline-flex items-center justify-center h-12 w-12 rounded-full border border-black/30 bg-white text-gray-900 shadow-xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
									aria-label="Close"
								>
									<X className="h-6 w-6" aria-hidden />
								</button>
								<div className="relative z-10">
									<QrJoinCard
										pin={pin}
										showDetails={false}
										frameless
										size="responsive"
										className="border-0 bg-transparent p-0"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
