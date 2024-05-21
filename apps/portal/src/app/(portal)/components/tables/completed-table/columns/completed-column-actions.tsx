import { SingleCompletedProgramArgs } from '@/actions/completed-programs/common.completed.actions';
import {
  CompletedProgramsUser,
  SingleCompletedProgram,
} from '@/actions/completed-programs/fetch.completed.actions';
import TableAction, { TableActionProps } from '@/components/table/table-action';
import { ActionTriggerType } from '@/types/actions.types';
import { CompletionStatus, UserRole } from '@prisma/client';
import { ColumnDef } from '@tanstack/react-table';
import {
  BadgeCheck,
  FileX2,
  MousePointerSquare,
  Pencil,
  Trash2,
} from 'lucide-react';

type CompletedColumnActions = {
  existingUser: CompletedProgramsUser;
  isPending: boolean;
  handleView: ({ id, organizationIds }: SingleCompletedProgramArgs) => void;
  handleApprove: (ids: string[]) => void;
  handleUpdate: ActionTriggerType;
  handleReject: (ids: string[]) => void;
  handleDelete: (ids: string[]) => void;
};

const completedColumnActions = ({
  existingUser,
  isPending,
  handleView,
  handleApprove,
  handleUpdate,
  handleReject,
  handleDelete,
}: CompletedColumnActions): ColumnDef<SingleCompletedProgram> => ({
  id: 'actions',
  header: 'Actions',
  cell: ({ row }) => {
    const id = row.original.id;
    const userIsParticipant = existingUser.id === row.original.participant.id;
    const name = userIsParticipant
      ? `${row.original.participant.name}'s`
      : 'your';
    const status = row.original.status;

    const organizationIds = row.original.participant.organizations.map(
      ({ organizationId }) => organizationId,
    );

    const userOwnedOrgs = existingUser.organizations.map(
      ({ organizationId }) => organizationId,
    );

    const allowedUser =
      userOwnedOrgs.some((orgId) => organizationIds.includes(orgId)) ||
      userIsParticipant;

    const adminOnly = existingUser.role == UserRole.ADMIN;

    const allowedUserOrAdmin = allowedUser || adminOnly;

    const rowActions: TableActionProps[] = [
      {
        content: `View ${name} completed program`,
        icon: <MousePointerSquare className="size-5" />,
        isPending,
        isVisible: allowedUserOrAdmin,
        onClick: () => handleView({ id, organizationIds }),
      },
      {
        content: `Approve ${name} completed program`,
        icon: <BadgeCheck color="green" className="size-5" />,
        isPending,
        tooltipContentClassName: 'text-green-600',
        isVisible: adminOnly && status !== CompletionStatus.APPROVED,
        onClick: () => handleApprove([id]),
      },
      {
        content: `Update ${name} completed program`,
        icon: <Pencil className="size-5" />,
        isPending,
        isVisible: allowedUserOrAdmin,
        onClick: () => handleUpdate(id),
      },
      {
        content: `Reject ${name} completed program`,
        icon: <FileX2 color="red" className="size-5" />,
        isPending,
        tooltipContentClassName: 'text-red-600',
        isVisible: adminOnly && status !== CompletionStatus.REJECTED,
        onClick: () => handleReject([id]),
      },
      {
        content: `Delete ${name} completed program`,
        icon: <Trash2 color="red" className="size-5" />,
        isPending,
        tooltipContentClassName: 'text-red-600',
        isVisible: allowedUserOrAdmin,
        onClick: () => handleDelete([id]),
      },
    ];
    return (
      <div className="flex items-center space-x-2">
        {rowActions.map((action) => (
          <TableAction key={action.content} {...action} />
        ))}
      </div>
    );
  },
  enableHiding: false,
});

export default completedColumnActions;