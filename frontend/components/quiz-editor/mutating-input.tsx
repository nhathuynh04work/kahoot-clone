"use client";

import { FocusEvent, InputHTMLAttributes, useState } from "react";

interface MutatingInputProps extends InputHTMLAttributes<HTMLInputElement> {
	onMutate: (value: string) => void;
}

/**
 * A reusable input component that triggers a mutation function onBlur
 * only if the value has actually changed.
 */
export default function MutatingInput({
	onMutate,
	defaultValue,
	...props
}: MutatingInputProps) {
	// We use a state to track the "original" value on focus.
	// This is more reliable than just comparing against defaultValue.
	const [originalValue, setOriginalValue] = useState(
		(defaultValue as string) || ""
	);

	function handleFocus(e: FocusEvent<HTMLInputElement>) {
		// When the user focuses, store the current value
		setOriginalValue(e.target.value);
	}

	function handleBlur(e: FocusEvent<HTMLInputElement>) {
		const newValue = e.target.value;

		if (newValue !== originalValue) {
			onMutate(newValue);
			setOriginalValue(newValue);
		}
	}

	return (
		<input
			defaultValue={defaultValue}
			onFocus={handleFocus}
			onBlur={handleBlur}
			{...props}
		/>
	);
}
