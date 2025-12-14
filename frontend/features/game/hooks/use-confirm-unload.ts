import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { socket } from "../lib/socket";

export function useConfirmUnload() {
	const router = useRouter();

	return useEffect(() => {
		// Hard Reloads / Tab Closes
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			e.preventDefault();
		};

		window.addEventListener("beforeunload", handleBeforeUnload);

		// Back Button / Link Clicks
		const handlePopState = (e: PopStateEvent) => {
			const isConfirmed = window.confirm(
				"Are you sure? This will end the game for everyone."
			);

			if (isConfirmed) {
				router.push("/dashboard");
				return;
			}

			window.history.pushState(null, "", window.location.href);
		};

		window.history.pushState(null, "", window.location.href);
		window.addEventListener("popstate", handlePopState);

		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
			window.removeEventListener("popstate", handlePopState);

			if (socket.connected) {
				socket.disconnect();
			}
		};
	}, [router]);
}
