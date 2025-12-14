import { useEffect } from "react";

export function useConfirmLeave() {
	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			e.preventDefault();
		};

		const handlePopState = () => {
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
}
