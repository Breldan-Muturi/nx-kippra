'use client';

import { SingleCompletedProgramArgs } from '@/actions/completed-programs/common.completed.actions';
import {
  SingleCompletedProgram,
  TableCompleted,
  filterCompleted,
} from '@/actions/completed-programs/fetch.completed.actions';
import {
  getCompletedEvidence,
  getProgramOptions,
  getUserOptions,
} from '@/actions/completed-programs/options.completed.actions';
import {
  ViewCompletedProgram,
  singleCompletedProgram,
} from '@/actions/completed-programs/single.completed.actions';
import TooltipActionButton, {
  TooltipActionButtonProps,
} from '@/components/buttons/tooltip-action-button';
import ReusableTable from '@/components/table/reusable-table';
import TablesPagination from '@/components/table/table-pagination';
import tableSelectColumn from '@/components/table/table-select-column';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  FilterCompletedSchema,
  filterCompletedSchema,
  pathCompletedSchema,
} from '@/validation/completed-program/completed-program.validation';
import { UserRole } from '@prisma/client';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { BadgeCheck, Check, FileX2, Loader2, Trash2 } from 'lucide-react';
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
import CompletedModalDelete from './modals/completed-modal-delete';
import CompletedModalForm, {
  CompletedModalFormType,
} from './modals/completed-modal-form';
import CompletedModalReject from './modals/completed-modal-reject';
import CompletedSheet from './sheets/completed-sheet-view';

type ModalType = { type: string; ids?: string[]; id?: string };

type CompletedTableProps = React.ComponentPropsWithoutRef<'div'> &
  TableCompleted;

const CompletedTable = ({
  fetchParams,
  existingUser,
  completedPrograms: data,
  count,
  className,
  ...props
}: CompletedTableProps) => {
  const path = usePathname();
  const [isPending, startTransition] = useTransition();
  const [modal, setModal] = useState<
    ViewCompletedProgram | ModalType | CompletedModalFormType | undefined
  >();
  const filterParams = filterCompletedSchema.parse(fetchParams);
  const pathParams = pathCompletedSchema.parse({ ...fetchParams, path });
  const { page, pageSize } = pathParams;

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

  const handleNew = () =>
    startTransition(() => {
      Promise.all([getUserOptions(), getProgramOptions()]).then((results) => {
        const [userOptions, programsOptions] = results;
        if ('error' in userOptions) {
          toast.error(userOptions.error);
        } else if ('error' in programsOptions) {
          toast.error(programsOptions.error);
        } else {
          setModal({
            userOptions,
            programsOptions,
          });
        }
      });
    });

  const handleUpdate = (id: string) =>
    startTransition(() => {
      const completedProgram = data.find(({ id: compId }) => compId === id);
      if (completedProgram)
        Promise.all([
          getProgramOptions(
            completedProgram.participant.id,
            completedProgram.program.id,
          ),
          getCompletedEvidence(id),
        ]).then((results) => {
          const [programsOptions, completed] = results;
          if ('error' in programsOptions) {
            toast.error(programsOptions.error);
          } else if ('error' in completed) {
            toast.error(completed.error);
          } else {
            setModal({
              programsOptions,
              currentCompleted: {
                id: completed.id,
                completionDate: completed.completionDate,
                participantId: completed.participantId,
                programId: completed.programId,
                completionEvidence: completed.previews,
              },
            });
          }
        });
    });
  const isForm = !!modal && 'programsOptions' in modal;

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
      ? Object.keys(table.getState().rowSelection)
          .map((i) => data[parseInt(i)].id)
          .filter((id): id is string => !!id)
      : [];

  const someSelected = selectedIds.length > 0;

  const completedActions: TooltipActionButtonProps[] | undefined = someSelected
    ? [
        {
          title: `Approve completed programs`,
          icon: <BadgeCheck color="green" className="size-5" />,
          disabled: isPending,
          tooltipContentClassName: 'text-green-600',
          isVisible: someSelected,
          onClick: () => handleApprove(selectedIds),
        },
        {
          title: `Reject completed programs`,
          icon: <FileX2 color="red" className="size-5" />,
          disabled: isPending,
          tooltipContentClassName: 'text-red-600',
          isVisible: someSelected,
          onClick: () => handleReject(selectedIds),
        },
        {
          title: `Delete completed programs`,
          icon: <Trash2 color="red" className="size-5" />,
          disabled: isPending,
          tooltipContentClassName: 'text-red-600',
          isVisible: someSelected,
          onClick: () => handleDelete(selectedIds),
        },
      ]
    : [];

  const handleDismiss = () => {
    if (someSelected) {
      table.resetRowSelection();
    }
    setModal((prev) => undefined);
  };

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
          <div className="flex flex-col-reverse items-start justify-between w-full md:space-y-0 md:items-center md:flex-row">
            {!!completedActions && (
              <div className="flex justify-start mt-3 space-x-2 md:mt-0">
                {completedActions.map((action) => (
                  <TooltipActionButton key={action.title} {...action} />
                ))}
              </div>
            )}
            <Button
              variant="outline"
              className="w-full text-green-600 border-green-600 lg:w-auto gap-x-2"
              disabled={isPending}
              onClick={handleNew}
            >
              {isPending ? (
                <Loader2 color="green" size={20} className="animate-spin" />
              ) : (
                <Check color="green" size={20} />
              )}
              New completed program
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
      {isForm && (
        <CompletedModalForm handleDismiss={handleDismiss} {...modal} />
      )}
      {isReject && (
        <CompletedModalReject
          handleDismiss={handleDismiss}
          ids={modal.ids as string[]}
        />
      )}
      {isDelete && (
        <CompletedModalDelete
          handleDismiss={handleDismiss}
          ids={modal.ids as string[]}
        />
      )}
    </>
  );
};

export default CompletedTable;
