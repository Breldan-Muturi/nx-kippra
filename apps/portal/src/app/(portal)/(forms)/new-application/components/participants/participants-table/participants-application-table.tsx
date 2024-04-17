'use client';
import ParticipantButton from '@/app/(portal)/(hero)/[programId]/training-sessions/[trainingsessionid]/components/participant-button';
import ReusableTable from '@/components/table/reusable-table';
import { ParticipantSubmitOption } from '@/validation/applications/participants.application.validation';
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ClipboardX } from 'lucide-react';

type ParticipantApplicationsTableProps = {
  participants: ParticipantSubmitOption[];
  columns: ColumnDef<ParticipantSubmitOption>[];
  removeManyParticipants: (emails: string[]) => void;
};

const ParticipantApplicationsTable = ({
  participants: data,
  columns,
  removeManyParticipants,
}: ParticipantApplicationsTableProps) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  const selectedParticipantsEmails = table
    .getSelectedRowModel()
    .rows.map((row) => row.original.email);
  return (
    <>
      <div className="flex space-x-2 items-center">
        {!!selectedParticipantsEmails.length && (
          <ParticipantButton
            icon={<ClipboardX className="size-4" />}
            tooltipLabel="Remove selected participants"
            className="bg-red-600/80 hover:bg-red-600 size-6"
            onClick={() => removeManyParticipants(selectedParticipantsEmails)}
          />
        )}
        <p className="text-black text-sm font-medium">
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
