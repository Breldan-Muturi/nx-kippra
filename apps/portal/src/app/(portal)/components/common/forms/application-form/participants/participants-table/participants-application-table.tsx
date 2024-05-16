'use client';
import TooltipIconButton from '@/components/buttons/tooltip-icon-button';
import ReusableTable from '@/components/table/reusable-table';
import tableSelectColumn from '@/components/table/table-select-column';
import { ActionTriggerType } from '@/types/actions.types';
import { ParticipantSubmitOption } from '@/validation/applications/participants.application.validation';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { ClipboardX } from 'lucide-react';
import participantApplicationActions from './participant-application-actions';
import participantApplicationCitizenship from './participant-application-citizenship';
import participantApplicationEmail from './participant-application-email';
import participantApplicationNationalId from './participant-application-nationalid';
import participantApplicationOwnerColumn from './participant-application-ower';
import participantApplicationRegistration from './participant-application-registration';
import participantApplicationColumnUser from './participant-application-user';

type ParticipantApplicationsTableProps = {
  isPending: boolean;
  isAdmin: boolean;
  toggleOwner: ActionTriggerType;
  viewParticipant: ActionTriggerType;
  participants: ParticipantSubmitOption[];
  removeManyParticipants: (emails: string[]) => void;
};

const ParticipantApplicationsTable = ({
  isPending,
  isAdmin,
  toggleOwner,
  viewParticipant,
  participants: data,
  removeManyParticipants,
}: ParticipantApplicationsTableProps) => {
  const table = useReactTable({
    data,
    columns: [
      tableSelectColumn<ParticipantSubmitOption>(isPending),
      participantApplicationColumnUser,
      participantApplicationRegistration,
      participantApplicationActions({
        isPending,
        viewParticipant: (id: string) => {
          viewParticipant(id);
          table.resetRowSelection();
        },
        removeParticipant: (email: string) => {
          removeManyParticipants([email]);
          table.resetRowSelection();
        },
      }),
      participantApplicationEmail,
      ...(isAdmin
        ? [
            participantApplicationOwnerColumn({
              isPending,
              toggleOwner: (id: string) => {
                toggleOwner(id);
                table.resetRowSelection();
              },
            }),
          ]
        : []),
      participantApplicationCitizenship,
      participantApplicationNationalId,
    ],
    getCoreRowModel: getCoreRowModel(),
  });

  const selectedParticipantsEmails = table
    .getSelectedRowModel()
    .rows.map((row) => row.original.email);

  const handleRemove = () => {
    removeManyParticipants(selectedParticipantsEmails);
    table.resetRowSelection();
  };

  return (
    <>
      <div className="flex items-center space-x-2">
        {!!selectedParticipantsEmails.length && (
          <TooltipIconButton
            icon={<ClipboardX className="size-4" />}
            type="button"
            tooltipLabel="Remove selected participants"
            className="bg-red-600/80 hover:bg-red-600 size-6"
            onClick={handleRemove}
          />
        )}
        <p className="text-sm font-medium text-black">
          Selected participants table
        </p>
      </div>
      <div className="flex col-span-2 mb-8">
        <ReusableTable
          table={table}
          className="flex col-span-2"
          emptyText="No matching participants"
        />
      </div>
    </>
  );
};

export default ParticipantApplicationsTable;
