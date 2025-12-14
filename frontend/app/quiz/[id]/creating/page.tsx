import { createLobby } from "@/features/game/api/server-actions";
import { redirect } from "next/navigation";

export default async function CreatingLobbyScreen({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id: quizId } = await params;

	try {
		const lobby = await createLobby(parseInt(quizId));
		redirect(`/host/${lobby.id}/lobby`);
	} catch (error: any) {}

	return;
}
