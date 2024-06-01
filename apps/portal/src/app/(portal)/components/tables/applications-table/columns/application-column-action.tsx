import { SingleTableApplication } from '@/actions/applications/filter.applications.actions';
import { ActionTriggerType } from '@/types/actions.types';
import { ExtendedUser } from '@/types/next-auth';
import { ApplicationStatus, UserRole } from '@prisma/client';
import { ColumnDef } from '@tanstack/react-table';
import {
  Banknote,
  ClipboardX,
  FileCheck2,
  MousePointerSquare,
  Send,
  ShieldX,
  Trash2,
} from 'lucide-react';
import TooltipActionButton, {
  TooltipActionButtonProps,
} from '../../../../../../components/buttons/tooltip-action-button';

interface ApplicationActionColumnProps {
  user: ExtendedUser;
  isPending: boolean;
  viewApplication: ActionTriggerType;
  approveApplication: ActionTriggerType;
  rejectApplication: ActionTriggerType;
  sendEmail: ActionTriggerType;
  payApplication: ActionTriggerType;
  removeApplication: ActionTriggerType;
  deleteApplication: ActionTriggerType;
}

const applicationActionsColumn = ({
  user: { id: userId, name: userName, email: userEmail, role },
  isPending,
  viewApplication,
  approveApplication,
  rejectApplication,
  sendEmail,
  payApplication,
  removeApplication,
  deleteApplication,
}: ApplicationActionColumnProps): ColumnDef<SingleTableApplication> => {
  return {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const {
        owner: { name, id: ownerId },
        id,
        status,
        participants,
      } = row.original;

      const isAdmin = role === UserRole.ADMIN;
      const isOwner = userId === ownerId;
      const isParticipant = participants.find(
        ({ email, name }) => email === userEmail || name === userName,
      );

      const applicationActions: TooltipActionButtonProps[] = [
        {
          title: `View ${isAdmin ? `${name}'s` : ''} application`,
          icon: <MousePointerSquare className="size-5" />,
          disabled: isPending,
          onClick: () => viewApplication(id),
        },
        {
          title: `Approve ${name} application`,
          isVisible: status === ApplicationStatus.PENDING && isAdmin,
          icon: <FileCheck2 color="green" className="size-5" />,
          disabled: isPending,
          tooltipContentClassName: 'text-green-600',
          onClick: () => approveApplication(id),
        },
        {
          title: `Reject ${name}'s application`,
          isVisible: status !== ApplicationStatus.COMPLETED && isAdmin,
          icon: <ShieldX color="red" className="size-5" />,
          disabled: isPending,
          tooltipContentClassName: 'text-red-600',
          onClick: () => rejectApplication(id),
        },
        {
          title: 'Initiate payment for this application',
          isVisible: isOwner && status === ApplicationStatus.APPROVED,
          icon: <Banknote color="green" className="size-5" />,
          disabled: isPending,
          tooltipContentClassName: 'text-green-600',
          onClick: () => payApplication(id),
        },
        {
          title: 'Delete this application',
          isVisible: isOwner || isAdmin,
          icon: <Trash2 color="red" className="size-5" />,
          disabled: isPending,
          tooltipContentClassName: 'text-red-600',
          onClick: () => deleteApplication(id),
        },
        {
          title: 'Remove me from this application',
          isVisible: !!isParticipant,
          icon: <ClipboardX color="red" className="size-5" />,
          disabled: isPending,
          tooltipContentClassName: 'text-red-600',
          onClick: () => removeApplication(id),
        },
        {
          title: `Send an email to ${isAdmin ? name : 'the portal admin'}`,
          icon: <Send className="size-5" />,
          disabled: isPending,
          onClick: () => sendEmail(id),
        },
      ];
      return (
        <div className="flex items-center space-x-2">
          {applicationActions.map((action) => (
            <TooltipActionButton key={action.title} {...action} />
          ))}
        </div>
      );
    },
    enableHiding: false,
  };
};

export default applicationActionsColumn;
