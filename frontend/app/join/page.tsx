import { getValidLobby } from "@/actions/game";
import { NicknameEntryForm } from "@/components/game/entry/nickname-entry-form";
import Link from "next/link";
import { redirect } from "next/navigation";

interface JoinLobbyProps {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function JoinLobby({ searchParams }: JoinLobbyProps) {
	const pin = (await searchParams).pin as string;

	if (!pin) redirect("/");

	let lobbyData;
	let error: string | null = null;

	try {
		lobbyData = await getValidLobby(pin);
	} catch (err: any) {
		console.error("Failed to validate lobby:", err.message);
		error = err.message || `Game PIN "${pin}" is not valid.`;
	}

	if (error || !lobbyData) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen text-white text-center p-4">
				<h1 className="text-3xl font-bold text-red-400 mb-4">
					Lobby Error
				</h1>
				<p className="text-xl text-gray-300">
					{error || "An unknown error occurred."}
				</p>
				<Link
					href="/"
					className="mt-6 px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700">
					Back to Home
				</Link>
			</div>
		);
	}

	return (
		<NicknameEntryForm
			pin={pin}
			quizTitle={lobbyData.quiz.title || "Untitled Quiz"}
		/>
	);
}
