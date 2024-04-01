import { SingleTableApplication } from '@/actions/applications/filter.applications.actions';
import { ColumnDef } from '@tanstack/react-table';
import ApplicantCell from '../../../components/table/applicant-cell';

const applicantColumn: ColumnDef<SingleTableApplication> = {
  id: 'applicant',
  header: 'Applicant',
  cell: ({ row }) => {
    let applicationOrganization: string | null = null;
    const {
      owner: { name, image },
      organization,
    } = row.original;
    if (organization) {
      applicationOrganization = organization.name;
    }
    return (
      <ApplicantCell
        applicantName={name ?? 'Unnamed applicant'}
        applicantImage={image ?? undefined}
        applicationOrganization={applicationOrganization}
      />
    );
  },
  enableHiding: false,
};

export default applicantColumn;
