"use client";

import { NicknameForm } from "@/features/game/components/common/nickname-form";
import { PinForm } from "@/features/game/components/common/pin-form";
import { RejoinDialog } from "@/features/game/components/common/rejoin-dialog";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function JoinScreen() {
	const router = useRouter();

	const [state, setState] = useState<"pin" | "nickname" | "rejoin">("pin");

	const [pin, setPin] = useState("");
	const [nickname, setNickname] = useState("");

	const handlePinValid = (pin: string) => {
		setPin(pin);
		const session: string | null = localStorage.getItem("recovery");

		if (!session) {
			setState("nickname");
			return;
		}

		const parsed = JSON.parse(session) as { nickname: string; pin: string };

		if (parsed.pin !== pin) {
			setState("nickname");
			return;
		}

		setNickname(parsed.nickname);
		setState("rejoin");
	};

	const handleJoinSuccess = (nickname: string) => {
		localStorage.setItem(
			"recovery",
			JSON.stringify({
				pin: pin,
				nickname: nickname,
			})
		);

		router.push("/game");
	};

	const handleStartFresh = () => {
		const session: string | null = localStorage.getItem("recovery");
		const parsed = JSON.parse(session!) as {
			nickname: string;
			pin: string;
		};

		localStorage.removeItem("recovery");
		setPin(parsed.pin);
		setState("nickname");
	};

	const handleContinue = () => {
		router.push("/game");
	};

	return (
		<div className="bg-gray-900">
			<div className="flex flex-col items-center justify-center min-h-screen text-white">
				<h1 className="text-5xl font-bold mb-4">Kahoot!</h1>

				<p className="text-xl text-gray-300 mb-10">
					Your new favorite quiz platform.
				</p>

				{/* --- Pin form / Nickname form / Rejoin --- */}
				{state === "pin" && <PinForm onSuccess={handlePinValid} />}

				{state === "nickname" && (
					<NicknameForm pin={pin} onSuccess={handleJoinSuccess} />
				)}

				{state === "rejoin" && (
					<RejoinDialog
						onContinue={handleContinue}
						onStartFresh={handleStartFresh}
					/>
				)}

				{state === "pin" && (
					<div className="mt-4">
						Wanting to host instead?{" "}
						<Link
							href={"/auth/login"}
							className="text-indigo-500 underline">
							Login
						</Link>
					</div>
				)}
			</div>
		</div>
	);
}
