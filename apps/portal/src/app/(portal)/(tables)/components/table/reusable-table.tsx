'use client';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Table } from '@tanstack/react-table';
import React from 'react';

export type ReusableTableProps<T> = {
  table: Table<T>;
};

const ReusableTable = <T,>({ table }: ReusableTableProps<T>) => {
  return (
    <ScrollArea className="whitespace-nowrap rounded-md border md:w-[1150px] lg:w-[1150px]">
      <UITable>
        <TableHeader>
          {table.getHeaderGroups().map(({ id, headers }, i) => (
            <TableRow key={`${i}-${id}`} className="bg-background">
              {headers.map(({ id, isPlaceholder, column, getContext }, i) => {
                const isFirstorLast = (i = 1 || i == headers.length - 1);
                return (
                  <TableHead
                    key={`${i}-${id}`}
                    className={isFirstorLast ? 'rounded-t-md' : undefined}
                  >
                    {isPlaceholder
                      ? null
                      : flexRender(column.columnDef.header, getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table
              .getRowModel()
              .rows.map(({ id, getIsSelected, getVisibleCells }, i) => (
                <TableRow
                  key={`${i}-${id}`}
                  data-state={getIsSelected() && 'selected'}
                >
                  {getVisibleCells().map(({ id, column, getContext }, i) => (
                    <TableCell key={`${i}-${id}`}>
                      {flexRender(column.columnDef.cell, getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
          ) : (
            <TableRow>
              <TableCell
                key="No application"
                colSpan={table.getAllColumns().length}
                className="h-24 text-center"
              >
                No applications found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </UITable>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export default ReusableTable;
