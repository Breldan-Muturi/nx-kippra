import { SingleParticipantDetail } from '@/actions/participants/fetch.participants.actions';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { formatRoles } from '@/helpers/enum.helpers';
import { UserRole } from '@prisma/client';
import { ColumnDef } from '@tanstack/react-table';

const participantColumnRole = ({
  isAdmin,
  updateRole,
}: {
  isAdmin: boolean;
  updateRole: ({
    id,
    updateToAdmin,
  }: {
    id: string;
    updateToAdmin: boolean;
  }) => void;
}): ColumnDef<SingleParticipantDetail> => ({
  id: 'Role',
  header: 'Admin',
  cell: ({ row }) => {
    const userIsAdmin = row.original.role === UserRole.ADMIN;
    const id = row.original.id;
    if (!isAdmin) return 'Not Authorized';
    return (
      <div className="flex items-center space-x-2">
        <Switch
          id="updateRole"
          checked={userIsAdmin}
          onCheckedChange={() =>
            updateRole({ id, updateToAdmin: !userIsAdmin })
          }
        />
        <Label htmlFor="updateRole">{formatRoles(row.original.role)}</Label>
      </div>
    );
  },
});

export default participantColumnRole;
