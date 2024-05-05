'use client';

import {
  InvitesTableProps,
  SingleInviteDetail,
  filterInvites,
} from '@/actions/invites/fetch.invites.actions';
import { revokeInvite } from '@/actions/invites/revoke.invites.actions';
import { sendInvite } from '@/actions/invites/send.invites.actions';
import handleTableColumns from '@/components/table/handle-table-columns';
import ReusableTable from '@/components/table/reusable-table';
import TableAction, { TableActionProps } from '@/components/table/table-action';
import TablesPagination from '@/components/table/table-pagination';
import tableSelectColumn from '@/components/table/table-select-column';
import { getOrganizationInvite } from '@/helpers/invites.helpers';
import { cn } from '@/lib/utils';
import {
  FilterInvitesSchema,
  pathInvitesSchema,
} from '@/validation/organization/organization.invites.validation';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { ClipboardX, RefreshCcw } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import React, { useTransition } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
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
  const router = useRouter();
  const path = usePathname();
  const [isPending, startTransition] = useTransition();
  //   const [modal, setModal] = useState<{action: string; inviteIds: string[]} | boolean | undefined>();
  const pathParams = pathInvitesSchema.parse({
    ...fetchParams,
    path,
  });
  const { page, pageSize } = pathParams;

  const changePage = (pageInt: number) =>
    startTransition(() => {
      filterInvites({
        ...pathParams,
        page: pageInt.toString(),
      });
    });

  const changePageSize = (newPageSize: string) =>
    startTransition(() => {
      filterInvites({
        ...pathParams,
        page: '1',
        pageSize: newPageSize,
      });
    });

  const clearForm = () =>
    startTransition(() => {
      filterInvites({
        path,
        page: '1',
        pageSize,
      });
    });

  const onSubmit: SubmitHandler<FilterInvitesSchema> = (values) => {
    if (!!values.email)
      startTransition(() => {
        getOrganizationInvite({
          email: values.email as string,
          organizationId,
        }).then((data) => {
          if (!data || !data.id) {
            sendInvite({ email: values.email as string, organizationId }).then(
              (data) => {
                if (data.error) {
                  toast.error(data.error);
                } else if (data.success) {
                  toast.success(data.success);
                  router.refresh();
                }
              },
            );
          } else {
            filterInvites({
              ...pathParams,
              email: values.email,
            });
          }
        });
      });
  };

  const resendInvites = (inviteIds: string[]) =>
    startTransition(() => {
      // filterInvites({
      //   path,
      //   page: '1',
      //   pageSize,
      // })
    });
  // const isResend = !!modal && "action" in modal && modal.action === "resend";

  const revokeInvites = (inviteIds: string[]) =>
    startTransition(() => {
      revokeInvite({ ids: inviteIds, organizationId }).then((data) => {
        if (data.error) {
          toast.error(data.error);
        } else if (data.success) {
          toast.success(data.success);
          router.refresh();
        }
      });
    });
  // const isRevoke = !!modal && "action" in modal && modal.action === "revoke";

  // const isAdd = !!modal && typeof modal === "boolean" &&  modal === true;

  const { visibleColumns } = handleTableColumns<SingleInviteDetail>({
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
  });

  const table = useReactTable({
    data: orgInvites,
    columns: visibleColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const selectedIds =
    orgInvites.length > 0
      ? Object.keys(table.getState().rowSelection).map(
          (index) => orgInvites[parseInt(index)].id,
        )
      : [];
  const someSelected = selectedIds.length > 0;

  const inviteActions: TableActionProps[] | undefined = someSelected
    ? [
        {
          content: `Revoke invitation`,
          icon: <ClipboardX color="red" className="size-5" />,
          isPending,
          tooltipContentClassName: 'text-red-600',
          isVisible: someSelected,
          onClick: () => revokeInvites(selectedIds),
        },
        {
          content: 'Resend invites',
          icon: <RefreshCcw color="green" className="size-5" />,
          isPending,
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
              <TableAction key={action.content} {...action} />
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
        pagination={{ page, pageSize }}
        count={count}
      />
    </div>
  );
};

export default InvitesTable;
