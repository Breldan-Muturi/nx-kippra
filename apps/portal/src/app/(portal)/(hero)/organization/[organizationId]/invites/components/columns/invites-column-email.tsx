import { SingleInviteDetail } from '@/actions/invites/fetch.invites.actions';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

const invitesColumnEmail: ColumnDef<SingleInviteDetail> = {
  id: 'Email',
  header: 'Email',
  cell: ({ row }) => (
    <p className="font-medium text-foreground">{row.original.email}</p>
  ),
};

export default invitesColumnEmail;
