import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const COOKIE_CANDIDATES = ["access_token", "jwt", "token"];

export function middleware(req: NextRequest) {
	// Only clear auth when the landing page is requested.
	if (req.nextUrl.pathname !== "/") return NextResponse.next();

	const res = NextResponse.next();
	for (const name of COOKIE_CANDIDATES) {
		res.cookies.set(name, "", {
			path: "/",
			maxAge: 0,
			httpOnly: true,
			sameSite: "lax",
			secure: false,
		});
	}
	return res;
}

export const config = {
	matcher: ["/"],
};

