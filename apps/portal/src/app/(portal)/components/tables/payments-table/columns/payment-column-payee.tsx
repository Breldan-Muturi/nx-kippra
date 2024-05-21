import { SinglePaymentDetail } from '@/actions/payments/filter.payment.actions';
import { ColumnDef } from '@tanstack/react-table';
import TableUserCell from '../../../../../../components/table/table-user-cell';

const payeeColumn: ColumnDef<SinglePaymentDetail> = {
  id: 'payee',
  header: 'Payee',
  cell: ({ row }) => {
    let userTableOrganization: string | null = null;
    const {
      owner: { image, name },
      organization,
    } = row.original.application;
    if (organization) {
      userTableOrganization = organization.name;
    }
    return (
      <TableUserCell
        userName={name}
        userImage={image?.fileUrl}
        userTableInfo={userTableOrganization}
      />
    );
  },
  enableHiding: false,
};

export default payeeColumn;
