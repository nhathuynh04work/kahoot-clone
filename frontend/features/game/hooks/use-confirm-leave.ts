import { useEffect, useRef, useCallback } from "react";

export function useConfirmLeave() {
	const protectionActive = useRef(true);

	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (!protectionActive.current) {
				return;
			}

			e.preventDefault();
		};

		const handlePopState = () => {
			if (!protectionActive.current) {
				return;
			}

			const isConfirmed = window.confirm(
				"Are you sure? This will end the game for everyone."
			);

			if (!isConfirmed) {
				window.history.pushState(null, "", window.location.href);
				return;
			}

			window.removeEventListener("beforeunload", handleBeforeUnload);
			window.location.href = "/dashboard";
		};

		window.history.pushState(null, "", window.location.href);

		window.addEventListener("beforeunload", handleBeforeUnload);
		window.addEventListener("popstate", handlePopState);

		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
			window.removeEventListener("popstate", handlePopState);
		};
	}, []);

	// allow force exit
	const disableGuard = useCallback(() => {
		protectionActive.current = false;
	}, []);

	return { disableGuard };
}
