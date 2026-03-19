"use client";

import { useCallback, useState } from "react";

export function useExpandableList<T extends string | number>() {
	const [expandedIds, setExpandedIds] = useState<Set<T>>(() => new Set());

	const toggle = useCallback((id: T) => {
		setExpandedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	}, []);

	const expandAll = useCallback((ids: Iterable<T>) => {
		setExpandedIds(new Set(ids));
	}, []);

	const collapseAll = useCallback(() => {
		setExpandedIds(new Set());
	}, []);

	return { expandedIds, toggle, expandAll, collapseAll };
}
