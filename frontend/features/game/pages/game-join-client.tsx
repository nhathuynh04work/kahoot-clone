"use client";

import { NicknameForm } from "@/features/game/components/common/nickname-form";
import { PinForm } from "@/features/game/components/common/pin-form";
import { RejoinDialog } from "@/features/game/components/common/rejoin-dialog";
import { AppLogo } from "@/components/layout/app-logo";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

interface SessionData {
	nickname: string;
	pin: string;
	rejoin: boolean;
}

export function GameJoinClient() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const initialPin = useMemo(() => searchParams.get("pin") ?? "", [searchParams]);

	const [state, setState] = useState<"pin" | "nickname" | "rejoin">("pin");
	const [pin, setPin] = useState("");

	const handlePinValid = useCallback((pin: string) => {
		setPin(pin);
		const session: string | null = localStorage.getItem("recovery");

		if (!session) {
			setState("nickname");
			return;
		}

		const parsed = JSON.parse(session) as SessionData;

		if (parsed.pin !== pin) {
			setState("nickname");
			return;
		}

		setState("rejoin");
	}, []);

	const urlFlow = useMemo(() => {
		if (!initialPin) return null;

		let nextState: "nickname" | "rejoin" = "nickname";
		try {
			const session: string | null = localStorage.getItem("recovery");
			if (session) {
				const parsed = JSON.parse(session) as SessionData;
				if (parsed.pin === initialPin) nextState = "rejoin";
			}
		} catch {
			// If storage is unavailable or session is corrupted, just start fresh.
		}

		return { pin: initialPin, state: nextState };
	}, [initialPin]);

	const handleJoinSuccess = (nickname: string) => {
		const effectivePin = state === "pin" && urlFlow ? urlFlow.pin : pin;

		localStorage.setItem(
			"recovery",
			JSON.stringify({
				pin: effectivePin,
				nickname: nickname,
				rejoin: false,
			}),
		);

		router.push("/game/play");
	};

	const handleStartFresh = () => {
		const session: string | null = localStorage.getItem("recovery");
		const parsed = JSON.parse(session!) as SessionData;

		localStorage.removeItem("recovery");
		setPin(parsed.pin);
		setState("nickname");
	};

	const handleResume = () => {
		const session: string | null = localStorage.getItem("recovery");
		const parsed = JSON.parse(session!) as SessionData;

		const newSession: SessionData = {
			nickname: parsed.nickname,
			pin: parsed.pin,
			rejoin: true,
		};

		localStorage.setItem("recovery", JSON.stringify(newSession));
		router.push("/game/play");
	};

	return (
		<div className="px-4">
			<div className="flex flex-col items-center justify-center min-h-dvh text-(--app-fg)">
				<div className="mb-10 select-none">
					<AppLogo className="text-5xl font-extrabold tracking-tight" />
				</div>

				{state === "pin" && !urlFlow && <PinForm onSuccess={handlePinValid} />}

				{(state === "nickname" || (state === "pin" && urlFlow?.state === "nickname")) && (
					<NicknameForm
						pin={state === "pin" ? urlFlow!.pin : pin}
						onSuccess={handleJoinSuccess}
					/>
				)}

				{(state === "rejoin" || (state === "pin" && urlFlow?.state === "rejoin")) && (
					<RejoinDialog
						onContinue={handleResume}
						onStartFresh={handleStartFresh}
					/>
				)}

				{state === "pin" && !urlFlow && (
					<div className="mt-4">
						Wanting to host instead?{" "}
						<Link href={"/auth/login"} className="text-indigo-500 underline">
							Login
						</Link>
					</div>
				)}
			</div>
		</div>
	);
}

