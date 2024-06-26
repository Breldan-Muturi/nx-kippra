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

type TablesPaginationProps = React.ComponentPropsWithoutRef<'div'> & {
  isPending: boolean;
  pagination: PaginationType;
  count: number;
  changePage: (page: number) => void;
  changePageSize: (newPageSize: string) => void;
  pageSizeSteps?: number;
};

const TablesPagination = ({
  isPending,
  pagination: { page, pageSize },
  count,
  changePage,
  changePageSize,
  pageSizeSteps = 10,
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
    { length: Math.min(Math.ceil(count / pageSizeSteps), pageSizeSteps) },
    (_, i) => `${(i + 1) * pageSizeSteps}`,
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
    <div className="flex flex-col items-start w-full px-2 space-y-2 lg:space-y-0 lg:px-0 lg:items-center lg:flex-row">
      <div className="flex flex-grow space-x-2">
        <p>Total count:</p> <p className="font-semibold">{count}</p>
      </div>
      <div className="flex flex-col items-center justify-end w-full space-y-2 lg:w-auto lg:px-4 lg:space-x-2 lg:space-y-0 lg:flex-row">
        <Select
          disabled={isPending || count <= 10}
          onValueChange={changePageSize}
          value={pageSize}
        >
          <SelectTrigger className="w-full bg-background">
            <SelectValue placeholder="Select page options" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>No. of records</SelectLabel>
              {pageSizeOptions.map((size, i) => {
                const label = `${size} Records per page`;
                return (
                  <SelectItem key={`${i}${size}`} value={size}>
                    {label}
                  </SelectItem>
                );
              })}
            </SelectGroup>
          </SelectContent>
        </Select>
        <div className="flex items-center w-full space-x-2">
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
    </div>
  );
};

export default TablesPagination;
