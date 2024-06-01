import { SingleCompletedProgramArgs } from '@/actions/completed-programs/common.completed.actions';
import {
  CompletedProgramsUser,
  SingleCompletedProgram,
} from '@/actions/completed-programs/fetch.completed.actions';
import TooltipActionButton, {
  TooltipActionButtonProps,
} from '@/components/buttons/tooltip-action-button';
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

    const rowActions: TooltipActionButtonProps[] = [
      {
        title: `View ${name} completed program`,
        icon: <MousePointerSquare className="size-5" />,
        disabled: isPending,
        isVisible: allowedUserOrAdmin,
        onClick: () => handleView({ id, organizationIds }),
      },
      {
        title: `Approve ${name} completed program`,
        icon: <BadgeCheck color="green" className="size-5" />,
        disabled: isPending,
        tooltipContentClassName: 'text-green-600',
        isVisible: adminOnly && status !== CompletionStatus.APPROVED,
        onClick: () => handleApprove([id]),
      },
      {
        title: `Update ${name} completed program`,
        icon: <Pencil className="size-5" />,
        disabled: isPending,
        isVisible: allowedUserOrAdmin,
        onClick: () => handleUpdate(id),
      },
      {
        title: `Reject ${name} completed program`,
        icon: <FileX2 color="red" className="size-5" />,
        disabled: isPending,
        tooltipContentClassName: 'text-red-600',
        isVisible: adminOnly && status !== CompletionStatus.REJECTED,
        onClick: () => handleReject([id]),
      },
      {
        title: `Delete ${name} completed program`,
        icon: <Trash2 color="red" className="size-5" />,
        disabled: isPending,
        tooltipContentClassName: 'text-red-600',
        isVisible: allowedUserOrAdmin,
        onClick: () => handleDelete([id]),
      },
    ];
    return (
      <div className="flex items-center space-x-2">
        {rowActions.map((action) => (
          <TooltipActionButton key={action.title} {...action} />
        ))}
      </div>
    );
  },
  enableHiding: false,
});

export default completedColumnActions;
