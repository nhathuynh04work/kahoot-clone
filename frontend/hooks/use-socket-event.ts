"use client";

import { socket } from "@/lib/socket";
import { useEffect, useRef } from "react";

export function useSocketEvent(
	event: string,
	handler: (...args: any[]) => void
) {
	// useRef to prevent handler rerendering when component rerenders
	const handlerRef = useRef(handler);

	useEffect(() => {
		handlerRef.current = handler;
	}, [handler]);

	useEffect(() => {
		const eventListener = (...args: any[]) => {
			handlerRef.current(...args);
		};

		socket.on(event, eventListener);

		return () => {
			socket.off(event, eventListener);
		};
	}, [event]);
}
