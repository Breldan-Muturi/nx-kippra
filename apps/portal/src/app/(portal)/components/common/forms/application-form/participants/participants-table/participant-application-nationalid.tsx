import { ParticipantSubmitOption } from '@/validation/applications/participants.application.validation';
import { ColumnDef } from '@tanstack/react-table';

const participantApplicationNationalId: ColumnDef<ParticipantSubmitOption> = {
  id: 'National Id',
  header: 'Id/Passport',
  cell: ({ row }) => (
    <p className="font-semibold text-green-600">{row.original.nationalId}</p>
  ),
};

export default participantApplicationNationalId;
