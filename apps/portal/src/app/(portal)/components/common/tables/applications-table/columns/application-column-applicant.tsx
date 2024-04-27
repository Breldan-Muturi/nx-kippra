import { SingleTableApplication } from '@/actions/applications/filter.applications.actions';
import { ColumnDef } from '@tanstack/react-table';
import TableUserCell from '../../../../../../../components/table/table-user-cell';

const applicantColumn: ColumnDef<SingleTableApplication> = {
  id: 'applicant',
  header: 'Applicant',
  cell: ({ row }) => {
    let userTableOrganization: string | null = null;
    const {
      owner: { name, image },
      organization,
    } = row.original;
    if (organization) {
      userTableOrganization = organization.name;
    }
    return (
      <TableUserCell
        userName={name ?? 'Unnamed applicant'}
        userImage={image ?? undefined}
        userTableOrganization={userTableOrganization}
      />
    );
  },
  enableHiding: false,
};

export default applicantColumn;
