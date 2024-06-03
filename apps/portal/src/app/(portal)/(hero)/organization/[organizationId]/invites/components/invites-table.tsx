'use client';

import {
  InvitesTableProps,
  SingleInviteDetail,
} from '@/actions/invites/fetch.invites.actions';
import TooltipActionButton, {
  TooltipActionButtonProps,
} from '@/components/buttons/tooltip-action-button';
import ReusableTable from '@/components/table/reusable-table';
import TablesPagination from '@/components/table/table-pagination';
import tableSelectColumn from '@/components/table/table-select-column';
import { cn } from '@/lib/utils';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { ClipboardX, RefreshCcw } from 'lucide-react';
import React from 'react';
import useInviteTable from '../hooks/use-invite-table';
import inviteColumnActions from './columns/invites-column-actions';
import invitesColumnCreatedAt from './columns/invites-column-createdat';
import invitesColumnEmail from './columns/invites-column-email';
import invitesColumnExpiry from './columns/invites-column-expiry';
import invitesColumnStatus from './columns/invites-column-status';
import InvitesSearchAdd from './invites-search-add';

type TableInvitesProps = React.ComponentPropsWithoutRef<'div'> &
  InvitesTableProps;
const InvitesTable = ({
  organizationId,
  fetchParams,
  orgInvites,
  count,
  className,
  ...props
}: TableInvitesProps) => {
  const {
    isPending,
    pathParams,
    changePage,
    changePageSize,
    clearForm,
    onSubmit,
    resendInvites,
    revokeInvites,
  } = useInviteTable({ organizationId, fetchParams });

  const table = useReactTable({
    data: orgInvites,
    columns: [
      tableSelectColumn<SingleInviteDetail>(isPending),
      invitesColumnEmail,
      invitesColumnStatus,
      inviteColumnActions({
        isPending,
        resendInvites,
        revokeInvites,
      }),
      invitesColumnCreatedAt,
      invitesColumnExpiry,
    ],
    getCoreRowModel: getCoreRowModel(),
  });

  const selectedIds =
    orgInvites.length > 0
      ? Object.keys(table.getState().rowSelection).map(
          (index) => orgInvites[parseInt(index)].id,
        )
      : [];
  const someSelected = selectedIds.length > 0;

  const inviteActions: TooltipActionButtonProps[] | undefined = someSelected
    ? [
        {
          title: `Revoke invitation`,
          icon: <ClipboardX color="red" className="size-5" />,
          disabled: isPending,
          tooltipContentClassName: 'text-red-600',
          isVisible: someSelected,
          onClick: () => revokeInvites(selectedIds),
        },
        {
          title: 'Resend invites',
          icon: <RefreshCcw color="green" className="size-5" />,
          disabled: isPending,
          tooltipContentClassName: 'text-green-600',
          isVisible: someSelected,
          onClick: () => resendInvites(selectedIds),
        },
      ]
    : undefined;

  return (
    <div className={cn('flex flex-col space-y-4', className)} {...props}>
      <InvitesSearchAdd
        isPending={isPending}
        clearForm={clearForm}
        onSubmit={onSubmit}
        defaultValues={fetchParams}
      />
      <div className="pb-4 space-y-2">
        {!!inviteActions && (
          <div className="flex justify-start w-full space-x-2">
            {inviteActions.map((action) => (
              <TooltipActionButton key={action.title} {...action} />
            ))}
          </div>
        )}
        <ReusableTable
          table={table}
          emptyText="No matching organization invites"
        />
      </div>
      <TablesPagination
        changePage={changePage}
        changePageSize={changePageSize}
        isPending={isPending}
        pagination={{ page: pathParams.page, pageSize: pathParams.pageSize }}
        count={count}
      />
    </div>
  );
};

export default InvitesTable;
