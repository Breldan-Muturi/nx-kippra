'use client';

import {
  FilterApplicationTableType,
  SingleTableApplication,
  filterApplications,
} from '@/actions/applications/filter.applications.actions';
import { ViewApplicationSheet } from '@/actions/applications/single.application.action';
import { cn } from '@/lib/utils';
import {
  FilterApplicationType,
  fetchApplicationsSchema,
} from '@/validation/applications/table.application.validation';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { FileCheck2, Send, ShieldX } from 'lucide-react';
import React, { useEffect, useMemo } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { TooltipActionButtonProps } from '../../../../../components/buttons/tooltip-action-button';
import handleTableColumns from '../../../../../components/table/handle-table-columns';
import ReusableTable from '../../../../../components/table/reusable-table';
import TablesPagination from '../../../../../components/table/table-pagination';
import tableSelectColumn from '../../../../../components/table/table-select-column';
import TableViews from '../../../../../components/table/table-views';
import useApplicationModals from '../../../hooks/use-application-modals';
import applicationActionsColumn from './columns/application-column-action';
import applicantColumn from './columns/application-column-applicant';
import applicationColumnCurrency from './columns/application-column-currency';
import applicationFeeColumn from './columns/application-column-fee';
import applicationProgramColumn from './columns/application-column-program';
import applicationStatusColumn from './columns/application-column-status';
import applicationTrainingSessionColumn from './columns/application-column-training-session';
import applicationTypeColumn from './columns/application-column-type';
import { filterApplicationsForm } from './filters/application-filter-fields';
import ApplicationsFilter from './filters/applications-filter-form';
import ApproveApplication from './modals/application-modal-approve';
import DeleteApplication from './modals/application-modal-delete';
import SendEmail from './modals/application-modal-email';
import PayApplication from './modals/application-modal-pay';
import RejectApplication from './modals/application-modal-reject';
import RemoveApplication from './modals/application-modal-remove';
import ApplicationSheet from './sheets/application-sheet-view';

export type ApplicationModalType = {
  id: string;
  handleDismiss: () => void;
};

type ApplicationTableProps = React.ComponentPropsWithoutRef<'div'> &
  FilterApplicationTableType & { applicationId?: string };

export type ApplicationViewSheet = {
  data: ViewApplicationSheet;
  nextId?: string;
  prevId?: string;
};

const ApplicationsTable = ({
  applications,
  fetchParams: rawFetchParams,
  count,
  filterSponsorType,
  filterStatus,
  applicationId,
  className,
  ...props
}: ApplicationTableProps) => {
  const {
    isPending,
    startTransition,
    path,
    user,
    viewApplication,
    viewData,
    approveApplication,
    approveData,
    rejectApplication,
    rejectId,
    sendEmail,
    emailId,
    payApplication,
    payData,
    removeApplication,
    removeId,
    deleteApplication,
    deleteId,
    dismissModal,
  } = useApplicationModals({
    applicationIds: applications.map(({ id }) => id),
    selectedApplicationId: applicationId,
  });
  const fetchParams = fetchApplicationsSchema.parse(rawFetchParams);
  const { hiddenColumns, pageSize, page, ...filterParams } = fetchParams;

  const changePage = (pageInt: number) => {
    startTransition(() => {
      filterApplications({
        ...fetchParams,
        page: pageInt.toString(),
        path,
      });
    });
  };

  const changePageSize = (newPageSize: string) => {
    startTransition(() => {
      filterApplications({
        ...fetchParams,
        page: '1',
        pageSize: newPageSize,
        path,
      });
    });
  };

  const onSubmit: SubmitHandler<FilterApplicationType> = (values) => {
    startTransition(() => {
      filterApplications({
        ...fetchParams,
        ...values,
        page: '1',
        path,
      });
    });
  };

  const updateViews = (hideColumns?: string) => {
    startTransition(() => {
      filterApplications({ ...fetchParams, hiddenColumns: hideColumns, path });
    });
  };

  const clearFilters = () =>
    startTransition(() => {
      filterApplications({
        path,
        page: '1',
        pageSize,
      });
    });

  useEffect(() => {
    if (applicationId) {
      viewApplication(applicationId);
    }
  }, [applicationId]);

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
          user,
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
        applicationColumnCurrency,
        applicationFeeColumn,
      ],
    });

  const table = useReactTable({
    data: applications,
    columns: visibleColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const someSelected = Object.keys(table.getState().rowSelection).length > 0;
  const applicationActions: TooltipActionButtonProps[] | undefined =
    someSelected
      ? [
          {
            title: 'Approve applications',
            icon: <FileCheck2 color="green" className="w-5 h-5" />,
            disabled: isPending,
            tooltipContentClassName: 'text-green-600',
            className: 'mr-2',
          },
          {
            title: 'Reject applications',
            icon: <ShieldX color="red" className="w-5 h-5" />,
            disabled: isPending,
            tooltipContentClassName: 'text-red-600',
            className: 'mr-2',
          },

          {
            title: 'Send mass emails',
            icon: <Send className="w-5 h-5" />,
            disabled: isPending,
          },
        ]
      : undefined;

  const handleDismiss = () => {
    if (!isPending) {
      if (someSelected) {
        table.resetRowSelection();
      }
      dismissModal();
    }
  };

  return (
    <>
      <div className={cn('flex flex-col space-y-4', className)} {...props}>
        <ApplicationsFilter
          isPending={isPending}
          customSubmit={onSubmit}
          filterForm={filterApplicationsForm({
            disabled: isPending,
            filterStatus,
            filterSponsorType,
          })}
          filterValues={filterParams}
          clearFilters={clearFilters}
        />
        <div className="pb-4 space-y-2">
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
      {viewData && (
        <ApplicationSheet
          {...{
            handleDismiss,
            application: viewData,
            viewApplication,
            payApplication,
            isPending,
            user,
          }}
        />
      )}
      {approveData && (
        <ApproveApplication handleDismiss={handleDismiss} data={approveData} />
      )}
      {rejectId && (
        <RejectApplication handleDismiss={handleDismiss} id={rejectId} />
      )}
      {emailId && <SendEmail handleDismiss={handleDismiss} id={emailId} />}
      {payData && (
        <PayApplication handleDismiss={handleDismiss} paymentInfo={payData} />
      )}
      {removeId && (
        <RemoveApplication handleDismiss={handleDismiss} id={removeId} />
      )}
      {deleteId && (
        <DeleteApplication handleDismiss={handleDismiss} id={deleteId} />
      )}
    </>
  );
};

export default ApplicationsTable;
