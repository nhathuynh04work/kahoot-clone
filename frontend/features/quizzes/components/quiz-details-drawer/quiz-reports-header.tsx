export function QuizReportsHeader({ reportCount }: { reportCount: number }) {
	return (
		<div className="sticky top-0 z-20 left-0 right-0 flex min-h-[56px] items-center -mx-4 px-4 py-3 mb-3 bg-[#1f2937] isolate transform-[translateZ(0)]">
			<h2 className="text-base font-semibold text-white">
				Reports ({reportCount})
			</h2>
		</div>
	);
}

