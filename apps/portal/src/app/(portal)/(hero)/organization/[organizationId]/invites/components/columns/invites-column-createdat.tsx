import { SingleInviteDetail } from '@/actions/invites/fetch.invites.actions';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

const invitesColumnCreatedAt: ColumnDef<SingleInviteDetail> = {
  id: 'Created At',
  header: 'Created At',
  cell: ({ row }) => {
    const createdDate = format(row.original.createdAt, 'PPP');
    return <p className="font-medium text-foreground">{createdDate}</p>;
  },
};

export default invitesColumnCreatedAt;
