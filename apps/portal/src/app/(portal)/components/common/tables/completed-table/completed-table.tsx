'use client';

import { SingleCompletedProgramArgs } from '@/actions/completed-programs/common.completed.actions';
import {
  SingleCompletedProgram,
  TableCompleted,
  filterCompleted,
} from '@/actions/completed-programs/fetch.completed.actions';
import {
  ViewCompletedProgram,
  singleCompletedProgram,
} from '@/actions/completed-programs/single.completed.actions';
import ReusableTable from '@/components/table/reusable-table';
import TableAction, { TableActionProps } from '@/components/table/table-action';
import TablesPagination from '@/components/table/table-pagination';
import tableSelectColumn from '@/components/table/table-select-column';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  FilterCompletedSchema,
  pathCompletedSchema,
} from '@/validation/completed-program/completed-program.validation';
import { UserRole } from '@prisma/client';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import {
  BadgeCheck,
  CheckCircle2,
  FileX2,
  Loader2,
  Trash2,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState, useTransition } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import completedColumnActions from './columns/completed-column-actions';
import completedColumnCompletionDate from './columns/completed-column-completion-date';
import completedColumnModifiedDate from './columns/completed-column-modified-date';
import completedColumnParticipant from './columns/completed-column-participant';
import completedColumnProgram from './columns/completed-column-program';
import completedColumnStatus from './columns/completed-column-status';
import completedFilterFields from './filters/completed-filter-fields';
import CompletedFilter from './filters/completed-filter-form';
import CompletedModalApprove from './modals/completed-modal-approve';
import CompletedModalReject from './modals/completed-modal-reject';
import CompletedSheet from './sheets/completed-sheet-view';

type ModalType = { type: string; ids?: string[]; id?: string };

type CompletedTableProps = React.ComponentPropsWithoutRef<'div'> &
  TableCompleted;

const CompletedTable = ({
  existingUser,
  organizationId,
  fetchParams,
  completedPrograms: data,
  count,
  className,
  ...props
}: CompletedTableProps) => {
  const path = usePathname();
  const [isPending, startTransition] = useTransition();
  const [modal, setModal] = useState<
    ViewCompletedProgram | ModalType | undefined
  >();
  const { page, pageSize, ...filterParams } = fetchParams;
  const pathParams = pathCompletedSchema.parse({ ...fetchParams, path });

  const changePage = (pageInt: number) =>
    startTransition(() =>
      filterCompleted({
        ...pathParams,
        page: String(pageInt),
      }),
    );

  const changePageSize = (newPageSize: string) =>
    startTransition(() =>
      filterCompleted({
        ...pathParams,
        page: '1',
        pageSize: newPageSize,
      }),
    );

  const clearFilters = () =>
    startTransition(() =>
      filterCompleted({
        path,
        page: '1',
        pageSize,
      }),
    );

  const onSubmit: SubmitHandler<FilterCompletedSchema> = (values) =>
    startTransition(() => filterCompleted({ ...pathParams, ...values }));

  const handleNew = () => setModal((prev) => ({ type: 'new' }));
  const isNew = !!modal && 'type' in modal && modal.type === 'new';

  const handleView = ({ id, organizationIds }: SingleCompletedProgramArgs) =>
    startTransition(() =>
      singleCompletedProgram({ id, organizationIds }).then((data) => {
        if ('error' in data) {
          toast.error(data.error);
        } else {
          setModal((prev) => data);
        }
      }),
    );
  const isView = !!modal && 'program' in modal;

  const handleApprove = (ids: string[]) =>
    setModal((prev) => ({ type: 'approve', ids }));
  const isApprove =
    !!modal &&
    'type' in modal &&
    modal.type === 'approve' &&
    existingUser.role === UserRole.ADMIN;

  const handleUpdate = (id: string) =>
    setModal((prev) => ({ type: 'update', id }));
  const isUpdate = !!modal && 'type' in modal && modal.type === 'update';

  const handleReject = (ids: string[]) =>
    setModal((prev) => ({ type: 'reject', ids }));
  const isReject =
    !!modal &&
    'type' in modal &&
    modal.type === 'reject' &&
    !!modal.ids &&
    modal.ids.length > 0 &&
    existingUser.role === UserRole.ADMIN;

  const handleDelete = (ids: string[]) =>
    setModal((prev) => ({ type: 'delete', ids }));
  const isDelete = !!modal && 'type' in modal && modal.type === 'delete';

  const handleDismiss = () => setModal((prev) => undefined);

  const table = useReactTable({
    data,
    columns: [
      tableSelectColumn<SingleCompletedProgram>(isPending),
      completedColumnParticipant,
      completedColumnActions({
        existingUser,
        isPending,
        handleView,
        handleApprove,
        handleUpdate,
        handleReject,
        handleDelete,
      }),
      completedColumnProgram,
      completedColumnStatus,
      completedColumnCompletionDate,
      completedColumnModifiedDate,
    ],
    getCoreRowModel: getCoreRowModel(),
  });

  const selectedIds =
    data.length > 0
      ? Object.keys(table.getState().rowSelection).map(
          (i) => data[parseInt(i)].id,
        )
      : [];

  const someSelected = selectedIds.length > 0;

  const completedActions: TableActionProps[] | undefined = someSelected
    ? [
        {
          content: `Approve completed programs`,
          icon: <BadgeCheck color="green" className="size-5" />,
          isPending,
          tooltipContentClassName: 'text-green-600',
          isVisible: someSelected,
          onClick: () => handleApprove(selectedIds),
        },
        {
          content: `Reject completed programs`,
          icon: <FileX2 color="red" className="size-5" />,
          isPending,
          tooltipContentClassName: 'text-red-600',
          isVisible: someSelected,
          onClick: () => handleReject(selectedIds),
        },
        {
          content: `Delete completed programs`,
          icon: <Trash2 color="red" className="size-5" />,
          isPending,
          tooltipContentClassName: 'text-red-600',
          isVisible: someSelected,
          onClick: () => handleDelete(selectedIds),
        },
      ]
    : [];

  return (
    <>
      <div className={cn('flex flex-col space-y-4', className)} {...props}>
        <CompletedFilter
          isPending={isPending}
          customSubmit={onSubmit}
          filterForm={completedFilterFields(isPending)}
          filterValues={filterParams}
          clearFilters={clearFilters}
        />
        <div className="pb-4 space-y-2">
          <div className="flex items-center justify-between w-full">
            {!!completedActions && (
              <div className="flex justify-start space-x-2">
                {completedActions.map((action) => (
                  <TableAction key={action.content} {...action} />
                ))}
              </div>
            )}
            <Button
              variant="outline"
              className="text-green-600 border-green-600"
              disabled={isPending}
              onClick={handleNew}
            >
              {isPending ? (
                <Loader2 color="white" className="mr-2 size-4 animate-spin" />
              ) : (
                <CheckCircle2 color="green" />
              )}
              New application
            </Button>
          </div>
          <ReusableTable
            table={table}
            emptyText="No matching completed courses"
          />
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
        <CompletedSheet handleDismiss={handleDismiss} completed={modal} />
      )}
      {isApprove && (
        <CompletedModalApprove
          handleDismiss={handleDismiss}
          ids={modal.ids as string[]}
        />
      )}
      {/* 
        {isUpdate && (
          <CompletedModalUpdate handleDismiss={handleDismiss} completed={modal} />
        )}
      */}
      {isReject && (
        <CompletedModalReject
          handleDismiss={handleDismiss}
          ids={modal.ids as string[]}
        />
      )}
      {/* 
        {isDelete && (
          <CompletedModalUpdate handleDismiss={handleDismiss} completed={modal} />
        )}
      */}
    </>
  );
};

export default CompletedTable;
