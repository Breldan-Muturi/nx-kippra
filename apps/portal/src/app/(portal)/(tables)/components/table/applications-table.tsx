"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React, { useMemo, useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FilterPaginateAppliationType } from "@/validation/application.validation";
import ApplicationViews from "./application-views";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { usePathname } from "next/navigation";
import {
  FilterApplicationTableType,
  SingleTableApplication,
  filterAdminApplications,
  filterUserApplications,
} from "@/actions/applications/filter.applications.actions";
import { SubmitHandler } from "react-hook-form";
import ApplicationsPagination from "./application-pagination";
import ApplicationsFilter from "./applications-filter";
import { filterApplicationsForm } from "./application-filter-fields";
import applicationActionsColumn from "../../applications/components/application-action-column";
import applicationProgramColumn from "../../applications/components/application-program-column";
import applicationTrainingSessionColumn from "../../applications/components/application-training-session-column";
import applicationStatusColumn from "../../applications/components/application-status-column";
import tableSelectColumn from "./table-select-column";
import applicantColumn from "../../applications/components/applicant-column";
import applicationTypeColumn from "../../applications/components/application-type-column";
import applicationFeeColumn from "../../applications/components/application-fee-column";
import handleTableColumns from "./handle-table-columns";

const ApplicationsTable = ({
  existingUser,
  applications,
  tableParams,
  count,
  filters,
}: FilterApplicationTableType) => {
  const { hiddenColumns, pageSize, page, ...filterParams } = tableParams;
  const path = usePathname();
  const [isPending, startTransition] = useTransition();

  const changePage = (pageInt: number) => {
    startTransition(() => {
      filterAdminApplications({
        page: pageInt.toString(),
        path,
        pageSize,
        ...filterParams,
      });
    });
  };

  const changePageSize = (newPageSize: string) => {
    startTransition(() => {
      filterAdminApplications({
        page: "1", // Reset to page 1 to avoid out of bounds error
        path,
        pageSize: newPageSize,
        ...filterParams,
      });
    });
  };

  const onSubmit: SubmitHandler<FilterPaginateAppliationType> = (values) => {
    startTransition(() => {
      filterAdminApplications(values);
    });
  };

  const updateViews = (hideColumns?: string) => {
    startTransition(() => {
      filterAdminApplications({
        page,
        path,
        pageSize,
        hiddenColumns: hideColumns,
        ...filterParams,
      });
    });
  };

  const viewApplication = (applicationId: string) => {
    startTransition(() => {
      filterAdminApplications({
        path,
        viewApplication: applicationId,
        ...tableParams,
      });
    });
  };

  const approveApplication = (applicationId: string) => {
    startTransition(() => {
      filterAdminApplications({
        path,
        approveApplication: applicationId,
        ...tableParams,
      });
    });
  };

  const rejectApplication = (applicationId: string) => {
    startTransition(() => {
      filterAdminApplications({
        path,
        rejectApplication: applicationId,
        ...tableParams,
      });
    });
  };

  const sendEmail = (applicationId: string) => {
    startTransition(() => {
      filterAdminApplications({
        path,
        sendEmail: applicationId,
        ...tableParams,
      });
    });
  };

  const payApplication = (applicationId: string) => {
    startTransition(() => {
      filterUserApplications({
        path,
        payApplication: applicationId,
        ...tableParams,
      });
    });
  };

  const removeApplication = (applicationId: string) => {
    startTransition(() => {
      filterUserApplications({
        path,
        removeApplication: applicationId,
        ...tableParams,
      });
    });
  };

  const deleteApplication = (applicationId: string) => {
    startTransition(() => {
      filterUserApplications({
        path,
        deleteApplication: applicationId,
        ...tableParams,
      });
    });
  };

  // Parse hiddenColumns from a comma-separated string to an array
  const hiddenColumnsArray = useMemo(
    () => (hiddenColumns ? hiddenColumns.split(",") : []),
    [hiddenColumns],
  );

  const { visibleColumns, allColumnIds } =
    handleTableColumns<SingleTableApplication>({
      hiddenColumnsArray,
      columns: [
        tableSelectColumn<SingleTableApplication>(isPending),
        applicantColumn,
        applicationStatusColumn,
        applicationActionsColumn({
          existingUser,
          isPending,
          viewApplication,
          approveApplication,
          rejectApplication,
          sendEmail,
          payApplication,
          removeApplication,
          deleteApplication,
        }),
        applicationProgramColumn,
        applicationTrainingSessionColumn,
        applicationTypeColumn,
        applicationFeeColumn,
      ],
    });

  const table = useReactTable({
    data: applications,
    columns: visibleColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const someSelected = Object.keys(table.getState().rowSelection).length > 0;

  return (
    <div className="flex flex-col space-y-4">
      <ApplicationsFilter
        isPending={isPending}
        customSubmit={onSubmit}
        filterForm={filterApplicationsForm({ disabled: isPending, ...filters })}
        filterValues={{ path, hiddenColumns, pageSize, page, ...filterParams }}
        startTransition={startTransition}
      />
      <div className="space-y-2 pb-4">
        <ApplicationViews
          columnIds={allColumnIds}
          hiddenColumnArray={hiddenColumnsArray}
          isPending={isPending}
          isSomeSelected={someSelected}
          updateViews={updateViews}
        />
        <ScrollArea className="whitespace-nowrap rounded-md border md:w-[1150px] lg:w-[1150px]">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(({ id, headers }, i) => (
                <TableRow key={`${i}-${id}`} className="bg-background">
                  {headers.map(
                    ({ id, isPlaceholder, column, getContext }, i) => {
                      const isFirstorLast = (i = 1 || i == headers.length - 1);
                      return (
                        <TableHead
                          key={`${i}-${id}`}
                          className={isFirstorLast ? "rounded-t-md" : undefined}
                        >
                          {isPlaceholder
                            ? null
                            : flexRender(column.columnDef.header, getContext())}
                        </TableHead>
                      );
                    },
                  )}
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
                      data-state={getIsSelected() && "selected"}
                    >
                      {getVisibleCells().map(
                        ({ id, column, getContext }, i) => (
                          <TableCell key={`${i}-${id}`}>
                            {flexRender(column.columnDef.cell, getContext())}
                          </TableCell>
                        ),
                      )}
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell
                    key="No application"
                    colSpan={visibleColumns.length}
                    className="h-24 text-center"
                  >
                    No applications found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
      <ApplicationsPagination
        changePage={changePage}
        changePageSize={changePageSize}
        isPending={isPending}
        pagination={{ page, pageSize }}
        count={count}
      />
    </div>
  );
};

export default ApplicationsTable;
