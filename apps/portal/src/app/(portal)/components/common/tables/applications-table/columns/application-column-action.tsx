import {
  AppTableUser,
  SingleTableApplication,
} from '@/actions/applications/filter.applications.actions';
import { ColumnDef } from '@tanstack/react-table';
import TableAction, {
  TableActionProps,
} from '../../../../../../../components/table/table-action';
import { ApplicationStatus, UserRole } from '@prisma/client';
import {
  Banknote,
  ClipboardX,
  FileCheck2,
  MousePointerSquare,
  Send,
  ShieldX,
  Trash2,
} from 'lucide-react';
import { ActionTriggerType } from '@/types/actions.types';

interface ApplicationActionColumnProps {
  existingUser: AppTableUser;
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
  existingUser: { id: userId, name: userName, email: userEmail, role },
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

      const applicationActions: TableActionProps[] = [
        {
          content: `View ${isAdmin ? `${name}'s` : ''} application`,
          icon: <MousePointerSquare className="size-5" />,
          isPending,
          onClick: () => viewApplication(id),
        },
        {
          content: `Approve ${name} application`,
          isVisible:
            status !== ApplicationStatus.APPROVED &&
            status !== ApplicationStatus.COMPLETED &&
            isAdmin,
          icon: <FileCheck2 color="green" className="size-5" />,
          isPending,
          tooltipContentClassName: 'text-green-600',
          onClick: () => approveApplication(id),
        },
        {
          content: `Reject ${name}'s application`,
          isVisible: status !== ApplicationStatus.COMPLETED && isAdmin,
          icon: <ShieldX color="red" className="size-5" />,
          isPending,
          tooltipContentClassName: 'text-red-600',
          onClick: () => rejectApplication(id),
        },
        {
          content: 'Initiate payment for this application',
          isVisible: isOwner && status === ApplicationStatus.APPROVED,
          icon: <Banknote color="green" className="size-5" />,
          isPending,
          tooltipContentClassName: 'text-green-600',
          onClick: () => payApplication(id),
        },
        {
          content: 'Delete this application',
          isVisible: isOwner,
          icon: <Trash2 color="red" className="size-5" />,
          isPending,
          tooltipContentClassName: 'text-red-600',
          onClick: () => deleteApplication(id),
        },
        {
          content: 'Remove me from this application',
          isVisible: !!isParticipant,
          icon: <ClipboardX color="red" className="size-5" />,
          isPending,
          tooltipContentClassName: 'text-red-600',
          onClick: () => removeApplication(id),
        },
        {
          content: `Send an email to ${isAdmin ? name : 'the portal admin'}`,
          icon: <Send className="w-5 h-5" />,
          isPending,
          onClick: () => sendEmail(id),
        },
      ];
      return (
        <div className="flex items-center space-x-2">
          {applicationActions.map((action) => (
            <TableAction key={action.content} {...action} />
          ))}
        </div>
      );
    },
    enableHiding: false,
  };
};

export default applicationActionsColumn;
