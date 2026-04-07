import type { MetadataRoute } from "next";
import { getMetadataBase } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
	const base = getMetadataBase().origin;
	const now = new Date();
	return [
		{ url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
		{ url: `${base}/game/join`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
		{ url: `${base}/auth/login`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
		{ url: `${base}/auth/register`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
	];
}
