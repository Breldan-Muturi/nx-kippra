'use client';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PaginationType } from '@/validation/pagination.validation';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import React from 'react';

interface TablesPaginationProps extends React.ComponentPropsWithoutRef<'div'> {
  isPending: boolean;
  pagination: PaginationType;
  count: number;
  changePage: (page: number) => void;
  changePageSize: (newPageSize: string) => void;
}

const TablesPagination = ({
  isPending,
  pagination: { page, pageSize },
  count,
  changePage,
  changePageSize,
}: TablesPaginationProps) => {
  const pageInt = parseInt(page);
  const pageSizeInt = parseInt(pageSize);
  // Calculates the paginated table startIndex and endIndex
  const startIndex = (pageInt - 1) * pageSizeInt + 1;
  const endIndex = Math.min(startIndex + pageSizeInt - 1, count);

  const disableStart = isPending || startIndex === 1;
  const disableEnd = isPending || endIndex === count;

  const totalPages = Math.ceil(count / pageSizeInt);

  // Dynamically generate pageSize options based on count
  let pageSizeOptions = Array.from(
    { length: Math.min(Math.ceil(count / 10), 10) },
    (_, i) => `${(i + 1) * 10}`,
  );
  if (!pageSizeOptions.includes('100') && count > 50)
    pageSizeOptions.push('100');

  // Make sure the current page size is included in the options
  if (!pageSizeOptions.includes(pageSize)) {
    pageSizeOptions = [...pageSizeOptions, pageSize].sort(
      (a, b) => parseInt(a) - parseInt(b),
    );
  }

  return (
    <div className="flex items-center">
      <div className="flex flex-grow space-x-2">
        <p>Total count:</p> <p className="font-semibold">{count}</p>
      </div>
      <div className="flex items-center justify-end px-4 space-x-2">
        <Select
          disabled={isPending}
          onValueChange={changePageSize}
          value={pageSize}
        >
          <SelectTrigger className="w-full mr-4">
            <SelectValue placeholder="Select page options" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>No. of records</SelectLabel>
              {pageSizeOptions.map((size, i) => {
                const label = `${size} Records per page`;
                return (
                  <SelectItem key={`${i}${size}${label}`} value={size}>
                    {label}
                  </SelectItem>
                );
              })}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => changePage(1)}
          disabled={disableStart}
          title="first page"
        >
          <ChevronsLeft />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => changePage(pageInt - 1)}
          disabled={disableStart}
          title="previous page"
        >
          <ChevronLeft />
        </Button>
        <p>
          <span className="font-semibold">{startIndex}</span>
          <span className="mx-4">to</span>
          <span className="font-semibold">{endIndex}</span>
        </p>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => changePage(pageInt + 1)}
          disabled={disableEnd}
          title="next page"
        >
          <ChevronRight />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => changePage(totalPages)}
          disabled={disableEnd}
          title="last page"
        >
          <ChevronsRight />
        </Button>
      </div>
    </div>
  );
};

export default TablesPagination;
