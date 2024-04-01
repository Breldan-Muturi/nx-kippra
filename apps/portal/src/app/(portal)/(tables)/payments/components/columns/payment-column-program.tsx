import { SinglePaymentDetail } from '@/actions/payments/filter.payment.actions';
import { ColumnDef } from '@tanstack/react-table';

const paymentProgramColumn: ColumnDef<SinglePaymentDetail> = {
  id: 'Program',
  header: 'Program',
  cell: ({ row }) => {
    const trainingSession = row.original.application.trainingSession;
    if (!trainingSession) return null;
    const { title, code } = trainingSession.program;
    return (
      <div className="flex min-w-40 flex-grow flex-col">
        <p>{title}</p>
        <p className="font-semibold text-green-600">{code}</p>
      </div>
    );
  },
};

export default paymentProgramColumn;
