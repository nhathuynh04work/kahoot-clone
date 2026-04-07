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
		<div className="rounded-xl border border-gray-800 bg-gray-900/30 overflow-x-auto">
			<table className="w-full text-left text-sm table-fixed">
				<thead className="text-xs text-gray-300 border-b border-gray-800 bg-gray-950/40">
					{headerGroups.map((hg) => (
						<tr key={hg.id} className="h-11">
							{hg.headers.map((header) => {
								const canSort = header.column.getCanSort();
								const sorted = header.column.getIsSorted();
								const meta = (header.column.columnDef.meta as ColumnMeta | undefined) ?? {};

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
												"w-full inline-flex items-center justify-between gap-2",
												canSort
													? "hover:text-white transition-colors"
													: "cursor-default",
											].join(" ")}
										>
											<span className="min-w-0 truncate text-left">
												{header.isPlaceholder
													? null
													: flexRender(
															header.column.columnDef.header,
															header.getContext(),
														)}
											</span>
											<span
												aria-hidden
												className={[
													"w-4 inline-flex items-center justify-center text-gray-500",
													sorted ? "opacity-100" : "opacity-0",
												].join(" ")}
											>
												{sorted === "asc" ? "▲" : sorted === "desc" ? "▼" : "▲"}
											</span>
										</button>
									</th>
								);
							})}
						</tr>
					))}
				</thead>

				<tbody className="divide-y divide-gray-800">
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
									"text-gray-300 h-12",
									clickable
										? "cursor-pointer hover:bg-gray-800/40"
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
								className="py-10 px-2 text-center text-gray-400"
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

