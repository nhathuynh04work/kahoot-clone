"use client";

import {
	useCallback,
	useEffect,
	useRef,
	useState,
	type CSSProperties,
} from "react";

export function useDrawerVisibility({
	onClose,
	transitionMs = 250,
}: {
	onClose: () => void;
	transitionMs?: number;
}) {
	const [isVisible, setIsVisible] = useState(false);
	const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		const t = requestAnimationFrame(() => setIsVisible(true));
		return () => cancelAnimationFrame(t);
	}, []);

	useEffect(() => {
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = prev;
		};
	}, []);

	useEffect(() => {
		return () => {
			if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
		};
	}, []);

	const close = useCallback(() => {
		setIsVisible(false);
		if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
		closeTimeoutRef.current = setTimeout(() => {
			closeTimeoutRef.current = null;
			onClose();
		}, transitionMs);
	}, [onClose, transitionMs]);

	const backdropStyle: CSSProperties = {
		transitionDuration: `${transitionMs}ms`,
		opacity: isVisible ? 1 : 0,
	};

	const panelStyle: CSSProperties = {
		height: "calc(100dvh - var(--app-header-height, 0px))",
		maxHeight: "calc(100dvh - var(--app-header-height, 0px))",
		transform: isVisible ? "translateY(0)" : "translateY(100%)",
		transitionDuration: `${transitionMs}ms`,
	};

	return {
		transitionMs,
		close,
		backdropStyle,
		panelStyle,
		onBackdropClick: close,
	};
}
