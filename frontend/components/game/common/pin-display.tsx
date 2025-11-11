"use client";

export default function PinDisplay({ pin }: { pin: string }) {
	return (
		<div className="text-center mb-8 bg-indigo-800 p-6 rounded-xl shadow-2xl">
			<p className="text-xl mb-2">
				Players join at your site URL with PIN:
			</p>
			<h2 className="text-7xl font-mono tracking-widest text-yellow-300">
				{pin}
			</h2>
		</div>
	);
}
