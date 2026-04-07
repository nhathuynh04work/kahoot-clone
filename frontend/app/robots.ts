import type { MetadataRoute } from "next";
import { getMetadataBase } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
	const base = getMetadataBase().origin;
	return {
		rules: [
			{
				userAgent: "*",
				allow: "/",
				disallow: ["/admin/", "/quiz/", "/game/", "/reports/", "/library/", "/settings/", "/api/"],
			},
		],
		sitemap: `${base}/sitemap.xml`,
	};
}
