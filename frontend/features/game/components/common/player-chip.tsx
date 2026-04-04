"use client";

import { useMemo } from "react";

function hashString(input: string) {
	let h = 0;
	for (let i = 0; i < input.length; i++) {
		h = (h * 31 + input.charCodeAt(i)) >>> 0;
	}
	return h;
}

export function PlayerChip({
	nickname,
	subtle = false,
}: {
	nickname: string;
	subtle?: boolean;
}) {
	const colors = useMemo(() => {
		const h = hashString(nickname);
		const hue = h % 360;
		const bg = `hsla(${hue} 85% 55% / ${subtle ? 0.28 : 0.95})`;
		const border = `hsla(${hue} 85% 40% / ${subtle ? 0.0 : 0.0})`;
		return { bg, border };
	}, [nickname, subtle]);

	return (
		<div
			className="px-7 py-3.5 rounded-full text-lg font-black text-white shadow-md animate-in fade-in zoom-in duration-300"
			style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
			title={nickname}
		>
			{nickname}
		</div>
	);
}

