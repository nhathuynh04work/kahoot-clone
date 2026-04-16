"use client";

import {
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
	type ColumnDef,
	type SortingState,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";

type ColumnMeta = {
	thClassName?: string;
	tdClassName?: string;
	widthClassName?: string;
	/** Align header label (sort chevron only when sortable). */
	headerAlign?: "left" | "right";
};

export function AdminDataTable<TData>({
	data,
	columns,
	emptyText = "No rows.",
	onRowClick,
}: {
	data: TData[];
	columns: Array<ColumnDef<TData, any>>;
	emptyText?: string;
	onRowClick?: (row: TData) => void;
}) {
	const [sorting, setSorting] = useState<SortingState>([]);

	const table = useReactTable({
		data,
		columns,
		state: { sorting },
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	const rows = table.getRowModel().rows;
	const headerGroups = table.getHeaderGroups();

	const clickable = useMemo(() => Boolean(onRowClick), [onRowClick]);

	return (
		<div className="rounded-xl border border-(--app-border) bg-(--app-surface-muted)/50 overflow-x-auto">
			<table className="w-full text-left text-sm table-fixed">
				<thead className="text-xs text-(--app-fg-muted) border-b border-(--app-border) bg-(--app-surface-muted)">
					{headerGroups.map((hg) => (
						<tr key={hg.id} className="h-11">
							{hg.headers.map((header) => {
								const canSort = header.column.getCanSort();
								const sorted = header.column.getIsSorted();
								const meta = (header.column.columnDef.meta as ColumnMeta | undefined) ?? {};
								const headerAlign = meta.headerAlign ?? "left";
								const labelAlignClass =
									headerAlign === "right" ? "text-right" : "text-left";
								const rowLayoutClass = canSort
									? headerAlign === "right"
										? "flex-row-reverse justify-between"
										: "justify-between"
									: headerAlign === "right"
										? "justify-end"
										: "justify-start";

								return (
									<th
										key={header.id}
										className={[
											"px-3 font-semibold select-none align-middle whitespace-nowrap",
											meta.widthClassName ?? "",
											meta.thClassName ?? "",
										].join(" ")}
									>
										<button
											type="button"
											disabled={!canSort}
											onClick={header.column.getToggleSortingHandler()}
											className={[
												"w-full inline-flex items-center gap-2",
												rowLayoutClass,
												canSort
													? "hover:text-(--app-fg) transition-colors"
													: "cursor-default",
											].join(" ")}
										>
											<span className={["min-w-0 truncate", labelAlignClass].join(" ")}>
												{header.isPlaceholder
													? null
													: flexRender(
															header.column.columnDef.header,
															header.getContext(),
														)}
											</span>
											{canSort ? (
												<span
													aria-hidden
													className={[
														"w-4 shrink-0 inline-flex items-center justify-center text-(--app-fg-muted)",
														sorted ? "opacity-100" : "opacity-0",
													].join(" ")}
												>
													{sorted === "asc" ? "▲" : sorted === "desc" ? "▼" : "▲"}
												</span>
											) : null}
										</button>
									</th>
								);
							})}
						</tr>
					))}
				</thead>

				<tbody className="divide-y divide-(--app-border)">
					{rows.map((row) => {
						const original = row.original as TData;

						return (
							<tr
								key={row.id}
								onClick={() => {
									if (!clickable) return;
									onRowClick?.(original);
								}}
								className={[
									"text-(--app-fg) h-12",
									clickable
										? "cursor-pointer hover:bg-(--app-surface-muted)/80"
										: "",
								].join(" ")}
							>
								{row.getVisibleCells().map((cell) => (
									<td
										key={cell.id}
										className={[
											"px-3 align-middle whitespace-nowrap overflow-hidden text-ellipsis",
											((cell.column.columnDef.meta as ColumnMeta | undefined)
												?.widthClassName as string) ?? "",
											((cell.column.columnDef.meta as ColumnMeta | undefined)
												?.tdClassName as string) ?? "",
										].join(" ")}
									>
										{flexRender(
											cell.column.columnDef.cell,
											cell.getContext(),
										)}
									</td>
								))}
							</tr>
						);
					})}

					{rows.length === 0 ? (
						<tr>
							<td
								className="py-10 px-2 text-center text-(--app-fg-muted)"
								colSpan={table.getAllLeafColumns().length || 1}
							>
								{emptyText}
							</td>
						</tr>
					) : null}
				</tbody>
			</table>
		</div>
	);
}

