import { SingleParticipantDetail } from '@/actions/participants/fetch.participants.actions';
import { ColumnDef } from '@tanstack/react-table';

const participantColumnPhone: ColumnDef<SingleParticipantDetail> = {
  id: 'Email',
  header: 'Email',
  cell: ({ row }) => {
    const phoneNumber = row.original.phoneNumber ? (
      <p className="font-semibold text-green-600">{row.original.phoneNumber}</p>
    ) : (
      <p className="text-red-600">Not available</p>
    );
    return phoneNumber;
  },
};

export default participantColumnPhone;
