'use client';

import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import React, { useMemo, useTransition } from 'react';
import { FilterPaginateAppliationType } from '@/validation/application.validation';
import { usePathname } from 'next/navigation';
import {
  FilterApplicationTableType,
  SingleTableApplication,
  filterAdminApplications,
  filterUserApplications,
} from '@/actions/applications/filter.applications.actions';
import { SubmitHandler } from 'react-hook-form';
import TablesPagination from '../../components/table/table-pagination';
import ApplicationsFilter from './filters/applications-filter-form';
import { filterApplicationsForm } from './filters/application-filter-fields';
import applicationActionsColumn from './columns/application-column-action';
import applicationProgramColumn from './columns/application-column-program';
import applicationTrainingSessionColumn from './columns/application-column-training-session';
import applicationStatusColumn from './columns/application-column-status';
import tableSelectColumn from '../../components/table/table-select-column';
import applicantColumn from './columns/application-column-applicant';
import applicationTypeColumn from './columns/application-column-type';
import applicationFeeColumn from './columns/application-column-fee';
import handleTableColumns from '../../components/table/handle-table-columns';
import { TableActionProps } from '../../components/table/table-action';
import { FileCheck2, Send, ShieldX } from 'lucide-react';
import TableViews from '../../components/table/table-views';
import ReusableTable from '../../components/table/reusable-table';

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
        page: '1', // Reset to page 1 to avoid out of bounds error
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
    () => (hiddenColumns ? hiddenColumns.split(',') : []),
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
  const applicationActions: TableActionProps[] | undefined = someSelected
    ? [
        {
          content: 'Approve applications',
          icon: <FileCheck2 color="green" className="h-5 w-5" />,
          isPending,
          tooltipContentClassName: 'text-green-600',
          className: 'mr-2',
        },
        {
          content: 'Reject applications',
          icon: <ShieldX color="red" className="h-5 w-5" />,
          isPending,
          tooltipContentClassName: 'text-red-600',
          className: 'mr-2',
        },

        {
          content: 'Send mass emails',
          icon: <Send className="h-5 w-5" />,
          isPending,
        },
      ]
    : undefined;

  return (
    <div className="flex flex-col space-y-4 w-max">
      <ApplicationsFilter
        isPending={isPending}
        customSubmit={onSubmit}
        filterForm={filterApplicationsForm({ disabled: isPending, ...filters })}
        filterValues={{ path, hiddenColumns, pageSize, page, ...filterParams }}
        startTransition={startTransition}
      />
      <div className="space-y-2 pb-4">
        <TableViews
          columnIds={allColumnIds}
          hiddenColumnArray={hiddenColumnsArray}
          isPending={isPending}
          updateViews={updateViews}
          actions={applicationActions}
        />
        <ReusableTable table={table} />
      </div>
      <TablesPagination
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
