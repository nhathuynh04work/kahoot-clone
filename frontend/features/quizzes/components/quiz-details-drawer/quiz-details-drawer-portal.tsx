"use client";

import { createPortal } from "react-dom";
import type { ReactNode } from "react";

export default function QuizDetailsDrawerPortal({
	children,
}: {
	children: ReactNode;
}) {
	return createPortal(children, document.body);
}

