"use client";

import { FocusEvent, InputHTMLAttributes } from "react";

interface MutatingInputProps extends InputHTMLAttributes<HTMLInputElement> {
	onMutate: (value: string) => void;
}

export default function MutatingInput({
	onMutate,
	defaultValue,
	...props
}: MutatingInputProps) {
	function handleBlur(e: FocusEvent<HTMLInputElement>) {
		const newValue = e.target.value;
		onMutate(newValue);
	}

	return <input defaultValue={defaultValue} onBlur={handleBlur} {...props} />;
}
