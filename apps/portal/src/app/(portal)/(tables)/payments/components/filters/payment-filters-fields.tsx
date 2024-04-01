import { FilterPaymentFieldsType } from '@/actions/payments/filter.payment.actions';
import { FormFieldType } from '@/types/form-field.types';
import { FilterPaymentFormType } from '@/validation/payment.validation';

export const filterPaymentsForm = ({
  channelFilter,
  statusFilter,
  disabled,
}: FilterPaymentFieldsType) => {
  let paymentsFilter: FormFieldType<FilterPaymentFormType>[] = [
    {
      name: 'method',
      type: 'select',
      label: 'Payment method',
      placeholder: 'Filter by method',
      selectLabel: 'Payment methods',
      options: channelFilter,
      disabled,
    },
    {
      name: 'status',
      type: 'select',
      label: 'Payment status',
      placeholder: 'Filter by status',
      selectLabel: 'Payment statuses',
      options: statusFilter,
      disabled,
    },
    {
      name: 'invoiceNumber',
      type: 'search',
      label: 'Invoice Number',
      placeholder: 'Search invoice number',
      disabled,
    },
    {
      name: 'programTitle',
      type: 'search',
      label: 'Program Title',
      placeholder: 'Search program title',
      disabled,
    },
    {
      name: 'payeeName',
      type: 'search',
      label: 'Payee Name',
      placeholder: 'Search payee name',
      disabled,
    },
  ];
  return paymentsFilter;
};
