"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Link from "next/link";
import { useMemo } from "react";

export type LeaderboardRow = {
  rank: number;
  registrationId: string;
  name: string;
  club: string;
  goals: number;
  yellow: number;
  red: number;
  appearances: number;
};

const columnHelper = createColumnHelper<LeaderboardRow>();

export function LeaderboardTable({ rows }: { rows: LeaderboardRow[] }) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("rank", { header: "#", size: 40 }),
      columnHelper.accessor("name", {
        header: "Игрок",
        cell: (c) => (
          <Link
            href={`/league/players/${c.row.original.registrationId}`}
            className="font-medium hover:text-accent"
          >
            {c.getValue()}
          </Link>
        ),
      }),
      columnHelper.accessor("club", { header: "Клуб" }),
      columnHelper.accessor("goals", {
        header: "Г",
        cell: (c) => (
          <span className="font-mono font-bold text-accent">{c.getValue()}</span>
        ),
      }),
      columnHelper.accessor("yellow", {
        header: "Ж",
        cell: (c) => (
          <span className="font-mono text-warning">{c.getValue()}</span>
        ),
      }),
      columnHelper.accessor("red", {
        header: "К",
        cell: (c) => (
          <span className="font-mono text-danger">{c.getValue()}</span>
        ),
      }),
      columnHelper.accessor("appearances", {
        header: "Матчи",
        cell: (c) => <span className="font-mono">{c.getValue()}</span>,
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="kickoff-table-wrap overflow-x-auto">
      <table className="kickoff-table w-full">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((h) => (
                <th
                  key={h.id}
                  className={
                    h.column.getCanSort()
                      ? "cursor-pointer select-none text-center first:text-left"
                      : "text-center first:text-left"
                  }
                  onClick={h.column.getToggleSortingHandler()}
                >
                  {flexRender(h.column.columnDef.header, h.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={
                    cell.column.id === "rank" || cell.column.id === "club"
                      ? ""
                      : "text-center"
                  }
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
