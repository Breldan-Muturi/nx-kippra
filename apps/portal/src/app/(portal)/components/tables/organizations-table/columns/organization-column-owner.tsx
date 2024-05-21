import { SingleOrganizationDetail } from '@/actions/organization/filter.organization.actions';
import TableUserCell from '@/components/table/table-user-cell';
import { OrganizationRole } from '@prisma/client';
import { ColumnDef } from '@tanstack/react-table';

const organizationColumnOwner: ColumnDef<SingleOrganizationDetail> = {
  id: 'Owner',
  header: 'Owner',
  cell: ({ row }) => {
    const owner = row.original.users.find(
      ({ role }) => role === OrganizationRole.OWNER,
    );
    if (owner && owner.user)
      return (
        <TableUserCell
          userName={owner.user.name}
          userImage={owner.user.image?.fileUrl}
          userTableInfo={owner.user.email}
        />
      );
    return <p className="text-red-600">Owner not found</p>;
  },
};

export default organizationColumnOwner;
