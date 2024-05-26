import { FormFieldType } from '@/types/form-field.types';
import { PayeeForm } from './payment.validation';

export const payApplicationFields: FormFieldType<PayeeForm>[] = [
  {
    name: 'clientName',
    type: 'text',
    label: 'Payee full name',
    placeholder: 'eg. Ms. Anne Wanjiku',
    className: 'col-span-2 md:col-span-1',
  },
  {
    name: 'clientIDNumber',
    type: 'text',
    label: 'Payee ID/Passport Number',
    placeholder: 'eg. 331331331',
    className: 'col-span-2 md:col-span-1',
  },
  {
    name: 'clientMSISDN',
    type: 'number',
    label: 'Payee Phone Number',
    placeholder: 'eg. 254711223344',
    minValue: 1,
    className: 'col-span-2 md:col-span-1',
  },
  {
    name: 'clientEmail',
    type: 'email',
    label: 'Payee email',
    placeholder: 'eg. payee@email.com',
    className: 'col-span-2 md:col-span-1',
  },
];
