import { ParticipantSubmitOption } from '@/validation/applications/participants.application.validation';
import { ColumnDef } from '@tanstack/react-table';

const participantApplicationEmail: ColumnDef<ParticipantSubmitOption> = {
  id: 'email',
  header: 'Email',
  cell: ({ row }) => row.original.email,
};

export default participantApplicationEmail;