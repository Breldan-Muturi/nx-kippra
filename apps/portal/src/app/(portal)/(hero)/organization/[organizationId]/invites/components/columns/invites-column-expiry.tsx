import { SingleInviteDetail } from '@/actions/invites/fetch.invites.actions';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

const invitesColumnExpiry: ColumnDef<SingleInviteDetail> = {
  id: 'Expiry',
  header: 'Expiry',
  cell: ({ row }) => {
    const expiryDate = format(row.original.expires, 'PPP');
    return <p className="font-medium text-red-600">{expiryDate}</p>;
  },
};

export default invitesColumnExpiry;
