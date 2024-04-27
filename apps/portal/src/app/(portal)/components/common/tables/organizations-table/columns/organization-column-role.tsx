import { SingleOrganizationDetail } from '@/actions/organization/filter.organization.actions';
import { Badge } from '@/components/ui/badge';
import { formatOrganizationRoles } from '@/helpers/enum.helpers';
import { ColumnDef } from '@tanstack/react-table';

type OrganizationColumnRoleProps = {
  userId: string;
  email: string;
};

const organizationColumnRole = ({
  userId,
  email,
}: OrganizationColumnRoleProps): ColumnDef<SingleOrganizationDetail> => ({
  id: 'Role',
  header: 'Role',
  cell: ({ row }) => {
    const organizationRole = row.original.users.find(
      ({ user: { id } }) => id === userId,
    )?.role;
    const isOrgEmail = row.original.email === email;
    const isInvite = row.original.invites.includes(email);
    const isContactEmail = row.original.contactPersonEmail === email;
    const noRole = [
      !isOrgEmail,
      !isInvite,
      !isContactEmail,
      !organizationRole,
    ].every(Boolean);
    return (
      <div className="flex space-x-2">
        {!!organizationRole && (
          <Badge className="bg-green-600">
            {formatOrganizationRoles(organizationRole)}
          </Badge>
        )}
        {isOrgEmail && <Badge>Organization email</Badge>}
        {isInvite && (
          <Badge variant="outline" className="border-green-600 text-green-600">
            Invite
          </Badge>
        )}
        {isContactEmail && (
          <Badge variant="outline" className="border-green-600 text-green-600">
            Contact person
          </Badge>
        )}
        {noRole && (
          <Badge
            variant="outline"
            className="border-muted-foreground text-muted-foreground"
          >
            Not involved
          </Badge>
        )}
      </div>
    );
  },
});

export default organizationColumnRole;
