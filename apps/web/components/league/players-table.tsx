"use client";

import { RowActions } from "@/components/kickoff/row-actions";
import { deletePlayerRegistration } from "@/lib/actions-crud";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";

export type PlayerTableRow = {
  registrationId: string;
  shirtNumber: number | null;
  name: string;
  clubShort: string;
  docsCount: number;
  hasFiles: boolean;
  eligibility: "ELIGIBLE" | "PENDING" | "SUSPENDED";
};

const STATUS_LABELS = {
  ELIGIBLE: "Допущен",
  PENDING: "На проверке",
  SUSPENDED: "Отстранён",
} as const;

const STATUS_CLASS = {
  ELIGIBLE: "text-accent",
  PENDING: "text-warning",
  SUSPENDED: "text-danger",
} as const;

const columnHelper = createColumnHelper<PlayerTableRow>();

export function PlayersTable({ rows }: { rows: PlayerTableRow[] }) {
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo(
    () => [
      columnHelper.accessor("shirtNumber", {
        header: "№",
        cell: (c) => (
          <span className="font-mono">{c.getValue() ?? "—"}</span>
        ),
      }),
      columnHelper.accessor("name", {
        header: "Игрок",
        cell: (c) => <span className="font-medium">{c.getValue()}</span>,
      }),
      columnHelper.accessor("clubShort", {
        header: "Клуб",
        cell: (c) => <span className="text-muted">{c.getValue()}</span>,
      }),
      columnHelper.accessor("docsCount", {
        header: "Док.",
        cell: (c) => {
          const row = c.row.original;
          return (
            <span className="text-xs text-muted">
              {c.getValue()}
              {row.hasFiles && " 📎"}
            </span>
          );
        },
      }),
      columnHelper.accessor("eligibility", {
        header: "Допуск",
        cell: (c) => {
          const v = c.getValue();
          return (
            <span className={`font-medium ${STATUS_CLASS[v]}`}>
              {STATUS_LABELS[v]}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <RowActions
            viewHref={`/league/players/${row.original.registrationId}`}
            deleteAction={deletePlayerRegistration}
            deleteHidden={{ registrationId: row.original.registrationId }}
            deleteMessage={`Удалить ${row.original.name} из сезона?`}
          />
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div>
      <input
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        placeholder="Быстрый поиск в таблице…"
        className="mb-4 w-full max-w-sm rounded-lg border border-border bg-base px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <div className="kickoff-table-wrap overflow-x-auto">
        <table className="kickoff-table w-full">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className={h.column.getCanSort() ? "cursor-pointer select-none" : ""}
                    onClick={h.column.getToggleSortingHandler()}
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {{
                      asc: " ↑",
                      desc: " ↓",
                    }[h.column.getIsSorted() as string] ?? null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted">
                  Ничего не найдено
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-muted">
        @tanstack/react-table · сортировка по клику на заголовок
      </p>
    </div>
  );
}
