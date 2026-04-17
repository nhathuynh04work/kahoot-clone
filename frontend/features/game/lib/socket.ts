"use client";

import { io } from "socket.io-client";

const SOCKET_URL =
	process.env.NEXT_PUBLIC_SOCKET_URL ||
	process.env.NEXT_PUBLIC_API_URL ||
	"http://localhost:3001";

export const socket = io(SOCKET_URL, {
	withCredentials: true,
	transports: ["websocket", "polling"],
});

export function reconnectSocket() {
	// The backend websocket auth guard reads cookies from the initial handshake.
	// When auth cookies change (login/logout/switch account), we must reconnect so
	// the new handshake includes the updated cookie header.
	try {
		socket.disconnect();
	} catch {}
	socket.connect();
}
