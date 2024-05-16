import { FormFieldType, SelectOptions } from '@/types/form-field.types';
import { FilterPaymentsType } from '@/validation/payment/payment.validation';

export const filterPaymentsForm = ({
  filterStatuses,
  filterChannels,
  disabled,
}: {
  filterStatuses: SelectOptions[];
  filterChannels: SelectOptions[];
  disabled: boolean;
}) => {
  let paymentsFilter: FormFieldType<FilterPaymentsType>[] = [
    {
      name: 'method',
      type: 'select',
      label: 'Payment method',
      placeholder: 'Filter by method',
      selectLabel: 'Payment methods',
      options: filterChannels,
      disabled,
    },
    {
      name: 'status',
      type: 'select',
      label: 'Payment status',
      placeholder: 'Filter by status',
      selectLabel: 'Payment statuses',
      options: filterStatuses,
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
