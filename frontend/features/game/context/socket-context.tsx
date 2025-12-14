"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { socket } from "@/features/game/lib/socket";

interface SocketContextType {
	isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
	const [isConnected, setIsConnected] = useState(socket.connected);

	useEffect(() => {
		if (!socket) return;

		const handleConnect = () => setIsConnected(true);
		const handleDisconnect = () => setIsConnected(false);
		const handleError = (err: Error) => console.error(err.message);

		socket.on("connect", handleConnect);
		socket.on("disconnect", handleDisconnect);
		socket.on("connect_error", handleError);

		return () => {
			socket.off("connect", handleConnect);
			socket.off("disconnect", handleDisconnect);
			socket.off("connect_error", handleError);
		};
	}, []);

	return (
		<SocketContext.Provider value={{ isConnected }}>
			{children}
		</SocketContext.Provider>
	);
}

export function useSocket() {
	const context = useContext(SocketContext);
	if (context === undefined) {
		throw new Error("useSocket must be used within a SocketProvider");
	}
	return context;
}

export const useSocketEvent = (
	event: string,
	handler: (...args: any[]) => void
) => {
	useEffect(() => {
		socket.on(event, handler);

		return () => {
			socket.off(event, handler);
		};
	}, [event, handler]);
};
