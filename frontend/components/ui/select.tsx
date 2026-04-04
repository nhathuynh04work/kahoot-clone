"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type SelectOption = {
	value: string;
	label: string;
	disabled?: boolean;
};

export function Select({
	value,
	onValueChange,
	options,
	placeholder = "Select…",
	ariaLabel,
	className,
	buttonClassName,
	menuClassName,
}: {
	value?: string;
	onValueChange: (value: string) => void;
	options: readonly SelectOption[];
	placeholder?: string;
	ariaLabel: string;
	className?: string;
	buttonClassName?: string;
	menuClassName?: string;
}) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [open, setOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState<number>(-1);

	const selected = useMemo(
		() => options.find((o) => o.value === value),
		[options, value],
	);

	const enabledOptions = useMemo(
		() => options.filter((o) => !o.disabled),
		[options],
	);

	useEffect(() => {
		function onDocMouseDown(e: MouseEvent) {
			if (!open) return;
			const el = containerRef.current;
			if (!el) return;
			if (!el.contains(e.target as Node)) setOpen(false);
		}
		document.addEventListener("mousedown", onDocMouseDown);
		return () => document.removeEventListener("mousedown", onDocMouseDown);
	}, [open]);

	const move = (dir: 1 | -1) => {
		if (enabledOptions.length === 0) return;
		const currentValue = options[activeIndex]?.value;
		const currentEnabledIndex = Math.max(
			0,
			enabledOptions.findIndex((o) => o.value === currentValue),
		);
		const nextEnabled =
			enabledOptions[
				(currentEnabledIndex + dir + enabledOptions.length) %
					enabledOptions.length
			];
		const nextIndex = options.findIndex((o) => o.value === nextEnabled.value);
		setActiveIndex(nextIndex);
	};

	const commit = (opt: SelectOption) => {
		if (opt.disabled) return;
		onValueChange(opt.value);
		setOpen(false);
	};

	return (
		<div ref={containerRef} className={cn("relative", className)}>
			<button
				type="button"
				aria-label={ariaLabel}
				aria-haspopup="listbox"
				aria-expanded={open}
				onClick={() => {
					setOpen((o) => {
						const next = !o;
						if (next) {
							const idx = options.findIndex(
								(opt) => opt.value === value && !opt.disabled,
							);
							setActiveIndex(
								idx >= 0 ? idx : options.findIndex((opt) => !opt.disabled),
							);
						}
						return next;
					});
				}}
				onKeyDown={(e) => {
					if (e.key === "ArrowDown" || e.key === "ArrowUp") {
						e.preventDefault();
						setOpen(true);
						const idx = options.findIndex(
							(opt) => opt.value === value && !opt.disabled,
						);
						setActiveIndex(
							idx >= 0 ? idx : options.findIndex((opt) => !opt.disabled),
						);
						return;
					}
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						setOpen((o) => !o);
						return;
					}
				}}
				className={cn(
					"w-full flex items-center justify-between gap-3 rounded-xl border border-gray-700 bg-gray-800/50 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/70",
					buttonClassName,
				)}
			>
				<span className={cn("truncate", !selected && "text-gray-400")}>
					{selected?.label ?? placeholder}
				</span>
				<ChevronDown
					className={cn(
						"h-4 w-4 shrink-0 text-gray-400 transition-transform",
						open && "rotate-180",
					)}
					aria-hidden
				/>
			</button>

			{open && (
				<div
					role="listbox"
					tabIndex={-1}
					aria-label={ariaLabel}
					onKeyDown={(e) => {
						if (e.key === "Escape") {
							e.preventDefault();
							setOpen(false);
							return;
						}
						if (e.key === "ArrowDown") {
							e.preventDefault();
							move(1);
							return;
						}
						if (e.key === "ArrowUp") {
							e.preventDefault();
							move(-1);
							return;
						}
						if (e.key === "Enter") {
							e.preventDefault();
							const opt = options[activeIndex];
							if (opt) commit(opt);
						}
					}}
					className={cn(
						"absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-gray-700 bg-gray-900 shadow-xl",
						menuClassName,
					)}
				>
					<ul className="max-h-64 overflow-auto py-1">
						{options.map((opt, idx) => {
							const isSelected = opt.value === value;
							const isActive = idx === activeIndex;
							return (
								<li key={opt.value}>
									<button
										type="button"
										role="option"
										aria-selected={isSelected}
										disabled={opt.disabled}
										onMouseEnter={() => setActiveIndex(idx)}
										onClick={() => commit(opt)}
										className={cn(
											"w-full px-3 py-2 text-left text-sm transition-colors",
											opt.disabled
												? "text-gray-600 cursor-not-allowed"
												: "text-gray-200 hover:bg-gray-800",
											isSelected && "text-white",
											isActive &&
												!opt.disabled &&
												"bg-gray-800",
										)}
									>
										{opt.label}
									</button>
								</li>
							);
						})}
					</ul>
				</div>
			)}
		</div>
	);
}

