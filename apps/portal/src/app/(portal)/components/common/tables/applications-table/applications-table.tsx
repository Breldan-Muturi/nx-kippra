'use client';

import {
  ApplicationApproval,
  fetchApprovalApplication,
} from '@/actions/applications/admin/fetch-approval.applications.actions';
import {
  FilterApplicationTableType,
  SingleTableApplication,
  filterApplications,
} from '@/actions/applications/filter.applications.actions';
import {
  PayeeApplicationModal,
  getPaymentApplicationPromise,
} from '@/actions/applications/user/pay.application.actions';
import {
  ViewApplicationSheet,
  getApplicationByIdPromise,
} from '@/actions/applications/user/single.application.action';
import { cn } from '@/lib/utils';
import { FilterApplicationType } from '@/validation/applications/table.application.validation';
import { UserRole } from '@prisma/client';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { FileCheck2, Send, ShieldX } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState, useTransition } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import handleTableColumns from '../../../../../../components/table/handle-table-columns';
import ReusableTable from '../../../../../../components/table/reusable-table';
import { TableActionProps } from '../../../../../../components/table/table-action';
import TablesPagination from '../../../../../../components/table/table-pagination';
import tableSelectColumn from '../../../../../../components/table/table-select-column';
import TableViews from '../../../../../../components/table/table-views';
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

const ApplicationsTable = ({
  existingUser,
  applications,
  fetchParams,
  count,
  filterSponsorType,
  filterStatus,
  applicationId,
  className,
  ...props
}: ApplicationTableProps) => {
  const router = useRouter();
  const path = usePathname();
  const { hiddenColumns, pageSize, page, ...filterParams } = fetchParams;
  const [isPending, startTransition] = useTransition();
  const [modal, setModal] = useState<
    | undefined
    | { type: 'view'; data: ViewApplicationSheet }
    | { type: 'pay'; data: PayeeApplicationModal }
    | { type: 'approve'; data: ApplicationApproval }
    | { type: 'email'; id: string }
    | { type: 'reject'; id: string }
    | { type: 'remove'; id: string }
    | { type: 'delete'; id: string }
  >();

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
        page: '1', // Reset to page 1 to avoid out of bounds error
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

  const viewApplication = (applicationId: string) =>
    startTransition(() => {
      getApplicationByIdPromise(applicationId).then((data) => {
        if ('error' in data) {
          toast.error(data.error);
        } else {
          setModal((prev) => ({ type: 'view', data }));
        }
      });
    });
  const isView =
    !!modal && modal.type === 'view' && 'isApplicationAdmin' in modal.data;

  useEffect(() => {
    if (applicationId) {
      viewApplication(applicationId);
    }
  }, [applicationId]);

  const approveApplication = (applicationId: string) => {
    if (existingUser.role === UserRole.USER) {
      toast.error('Only admin users can approve applications');
    } else {
      startTransition(() => {
        fetchApprovalApplication(applicationId).then((data) => {
          if ('error' in data) {
            toast.error(data.error);
          } else {
            setModal((prev) => ({ type: 'approve', data }));
          }
        });
      });
    }
  };
  const isApprove = !!modal && modal.type === 'approve' && 'id' in modal.data;

  const rejectApplication = (applicationId: string) => {
    if (existingUser.role === UserRole.USER) {
      toast.error('Only admin users can reject applications');
    } else {
      setModal((prev) => ({ type: 'reject', id: applicationId }));
    }
  };
  const isReject = !!modal && modal.type === 'reject' && 'id' in modal;

  const sendEmail = (applicationId: string) =>
    setModal((prev) => ({ type: 'email', id: applicationId }));
  const isEmail = !!modal && modal.type === 'email' && 'id' in modal;

  const payApplication = (applicationId: string) =>
    startTransition(() => {
      getPaymentApplicationPromise(applicationId).then((data) => {
        if ('error' in data) {
          toast.error(data.error);
        } else {
          setModal((prev) => ({ type: 'pay', data }));
        }
      });
    });
  const isPay =
    !!modal && modal.type === 'pay' && 'paymentDetails' in modal.data;

  const removeApplication = (applicationId: string) =>
    setModal((prev) => ({ type: 'remove', id: applicationId }));
  const isRemove = !!modal && modal.type === 'remove' && 'id' in modal;

  const deleteApplication = (applicationId: string) =>
    setModal((prev) => ({ type: 'delete', id: applicationId }));
  const isDelete = !!modal && modal.type === 'delete' && 'id' in modal;

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
  const applicationActions: TableActionProps[] | undefined = someSelected
    ? [
        {
          content: 'Approve applications',
          icon: <FileCheck2 color="green" className="w-5 h-5" />,
          isPending,
          tooltipContentClassName: 'text-green-600',
          className: 'mr-2',
        },
        {
          content: 'Reject applications',
          icon: <ShieldX color="red" className="w-5 h-5" />,
          isPending,
          tooltipContentClassName: 'text-red-600',
          className: 'mr-2',
        },

        {
          content: 'Send mass emails',
          icon: <Send className="w-5 h-5" />,
          isPending,
        },
      ]
    : undefined;

  const handleDismiss = () => {
    if (someSelected) {
      table.resetRowSelection();
    }
    setModal((prev) => undefined);
    router.refresh();
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
      {isView && (
        <ApplicationSheet
          handleDismiss={handleDismiss}
          application={modal.data}
        />
      )}
      {isApprove && (
        <ApproveApplication handleDismiss={handleDismiss} data={modal.data} />
      )}
      {isReject && (
        <RejectApplication handleDismiss={handleDismiss} id={modal.id} />
      )}
      {isEmail && <SendEmail handleDismiss={handleDismiss} id={modal.id} />}
      {isPay && (
        <PayApplication
          handleDismiss={handleDismiss}
          paymentInfo={modal.data}
        />
      )}
      {isRemove && (
        <RemoveApplication handleDismiss={handleDismiss} id={modal.id} />
      )}
      {isDelete && (
        <DeleteApplication handleDismiss={handleDismiss} id={modal.id} />
      )}
    </>
  );
};

export default ApplicationsTable;
