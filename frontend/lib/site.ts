import type { Metadata } from "next";

export const SITE_NAME = "Quiztopia";

export const SITE_DESCRIPTION =
	"Create live quizzes, host games with a PIN, and review session reports. Free to start; VIP unlocks larger quizzes and advanced question types.";

export function getMetadataBase(): URL {
	const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
	if (raw) {
		try {
			const normalized = raw.endsWith("/") ? raw.slice(0, -1) : raw;
			return new URL(normalized);
		} catch {
			/* ignore */
		}
	}
	return new URL("http://localhost:3000");
}

export function rootMetadata(): Metadata {
	const metadataBase = getMetadataBase();
	return {
		metadataBase,
		title: {
			default: SITE_NAME,
			template: `%s | ${SITE_NAME}`,
		},
		description: SITE_DESCRIPTION,
		applicationName: SITE_NAME,
		openGraph: {
			type: "website",
			siteName: SITE_NAME,
			title: SITE_NAME,
			description: SITE_DESCRIPTION,
			url: metadataBase,
		},
		twitter: {
			card: "summary_large_image",
			title: SITE_NAME,
			description: SITE_DESCRIPTION,
		},
		robots: {
			index: true,
			follow: true,
		},
	};
}
