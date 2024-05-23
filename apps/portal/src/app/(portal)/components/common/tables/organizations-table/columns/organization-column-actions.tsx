import {
  OrganizationTableUser,
  SingleOrganizationDetail,
} from '@/actions/organization/filter.organization.actions';
import TableAction, { TableActionProps } from '@/components/table/table-action';
import { ActionTriggerType } from '@/types/actions.types';
import { OrganizationRole, UserRole } from '@prisma/client';
import { ColumnDef } from '@tanstack/react-table';
import {
  ClipboardX,
  MailCheck,
  MousePointerSquare,
  Trash2,
} from 'lucide-react';

type OrganizationActionsProps = {
  existingUser: OrganizationTableUser;
  isPending: boolean;
  handleDelete: ActionTriggerType;
  handleRemove: ActionTriggerType;
  handleView: ActionTriggerType;
  handleInvite: ActionTriggerType;
};

const organizationColumnActions = ({
  existingUser,
  isPending,
  handleDelete,
  handleRemove,
  handleView,
  handleInvite,
}: OrganizationActionsProps): ColumnDef<SingleOrganizationDetail> => ({
  id: 'Actions',
  header: 'Actions',
  cell: ({ row }) => {
    const { id, name, users, invites } = row.original;
    const isAuthorized =
      existingUser.role === UserRole.ADMIN ||
      !!users.find(
        ({ user: { id }, role }) =>
          id === existingUser.id && role === OrganizationRole.OWNER,
      );

    const isInvited = invites[0]?.email === existingUser.email;

    const isInOrg = [
      users.map(({ user: { id } }) => id).includes(existingUser.id),
      invites.map(({ email }) => email).includes(existingUser.email),
    ].some(Boolean);
    const organizationActions: TableActionProps[] = [
      {
        content: `Go to ${name}'s page`,
        icon: <MousePointerSquare className="size-5" />,
        isVisible: isAuthorized,
        isPending,
        onClick: () => handleView(id),
      },
      {
        content: `Delete ${name}`,
        isVisible: isAuthorized,
        icon: <Trash2 color="red" className="size-5" />,
        isPending,
        tooltipContentClassName: 'text-red-600',
        onClick: () => handleDelete(id),
      },
      {
        content: `Remove me from ${name}`,
        isVisible: isInOrg,
        icon: <ClipboardX color="red" className="size-5" />,
        isPending,
        tooltipContentClassName: 'text-red-600',
        onClick: () => handleRemove(id),
      },
      {
        content: `See invite from ${name}`,
        isVisible: isInvited,
        icon: <MailCheck color="green" className="size-5" />,
        isPending,
        tooltipContentClassName: 'text-green-600',
        onClick: () => handleInvite(invites[0].token),
      },
    ];
    return (
      <div className="flex items-center space-x-2">
        {organizationActions.map((action) => (
          <TableAction key={action.content} {...action} />
        ))}
      </div>
    );
  },
  enableHiding: false,
});

export default organizationColumnActions;
