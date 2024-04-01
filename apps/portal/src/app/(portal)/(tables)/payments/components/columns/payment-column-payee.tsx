import { SinglePaymentDetail } from '@/actions/payments/filter.payment.actions';
import { ColumnDef } from '@tanstack/react-table';
import ApplicantCell from '../../../components/table/applicant-cell';

const payeeColumn: ColumnDef<SinglePaymentDetail> = {
  id: 'payee',
  header: 'Payee',
  cell: ({ row }) => {
    let applicationOrganization: string | null = null;
    const {
      owner: { image, name },
      organization,
    } = row.original.application;
    if (organization) {
      applicationOrganization = organization.name;
    }
    return (
      <ApplicantCell
        applicantName={name}
        applicantImage={image || undefined}
        applicationOrganization={applicationOrganization}
      />
    );
  },
  enableHiding: false,
};

export default payeeColumn;
