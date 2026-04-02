"use client";

import { Player } from "../../types";
import { Users, Play, X } from "lucide-react";
import { useEffect, useState } from "react";
import { QrJoinCard } from "../common/qr-join-card";
import { PlayerChip } from "../common/player-chip";
import { AppLogo } from "@/components/layout/app-logo";

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
	const [lastJoined, setLastJoined] = useState<string | null>(null);
	const [joinExpanded, setJoinExpanded] = useState(false);

	const copyPin = () => {
		navigator.clipboard.writeText(pin);
	};

	useEffect(() => {
		if (players.length < 1) return;
		const newest = players[players.length - 1]?.nickname;
		if (!newest) return;
		const showId = window.setTimeout(() => setLastJoined(newest), 0);
		const hideId = window.setTimeout(() => setLastJoined(null), 2000);
		return () => {
			window.clearTimeout(showId);
			window.clearTimeout(hideId);
		};
	}, [players]);

	return (
		<div className="min-h-screen bg-gray-900 p-4 md:p-8 relative overflow-hidden">
			<div className="pointer-events-none absolute inset-0 bg-linear-to-br from-indigo-600/15 via-gray-950/0 to-indigo-500/10" />

			<div className="w-full max-w-6xl mx-auto flex flex-col gap-6 relative z-10">
				{!joinExpanded && (
					/* Top strip: PIN + QR (no links/copy) */
					<div className="flex justify-center">
						<div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 md:px-5 md:py-5">
							<div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4">
							<div className="text-center md:text-left">
								<p className="text-xs font-black uppercase tracking-widest text-gray-300">
									Game PIN
								</p>
								<button
									type="button"
									onClick={copyPin}
									className="mt-2 inline-flex items-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg px-1"
									aria-label="Copy game PIN"
								>
									<span className="text-5xl md:text-6xl font-mono font-black tracking-widest text-white select-none">
										{pin}
									</span>
								</button>
							</div>

							<div className="shrink-0 flex justify-center">
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
							</div>
						</div>
						</div>
					</div>
				)}

				{!joinExpanded && (
					<>
						{/* Logo + Start on same row, logo centered */}
						<div className="mt-10 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
							<div />
							<AppLogo className="text-4xl md:text-5xl font-extrabold tracking-tight select-none justify-self-center" />
							<div className="justify-self-center md:justify-self-end">
								<button
									onClick={onStart}
									disabled={players.length === 0}
									className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-transform active:scale-95 shadow-md ${
										players.length === 0
											? "bg-gray-700 text-gray-300 cursor-not-allowed"
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
						<div className="w-full rounded-3xl border border-white/10 bg-black/20 p-6 md:p-8 flex flex-col items-center gap-6">
							<div className="flex items-center gap-2 text-indigo-200 font-semibold">
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

			{lastJoined && (
				<div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10">
					<div className="rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm text-white/90 animate-in fade-in slide-in-from-bottom-2 duration-300">
						<span className="font-semibold">{lastJoined}</span> joined
					</div>
				</div>
			)}

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
								<p className="text-xs font-black uppercase tracking-widest text-white/70">
									Game PIN
								</p>
								<p className="mt-2 text-6xl md:text-7xl font-mono font-black tracking-widest text-white">
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
										size={420}
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
