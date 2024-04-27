import { SingleOrganizationDetail } from '@/actions/organization/filter.organization.actions';
import TableUserCell from '@/components/table/table-user-cell';
import { ColumnDef } from '@tanstack/react-table';

const organizationColumnInfo: ColumnDef<SingleOrganizationDetail> = {
  id: 'Info',
  header: 'Organization',
  cell: ({ row }) => {
    const { name, image, email } = row.original;
    return (
      <TableUserCell
        userName={name}
        userImage={image || undefined}
        userTableOrganization={email}
      />
    );
  },
  enableHiding: false,
};

export default organizationColumnInfo;
