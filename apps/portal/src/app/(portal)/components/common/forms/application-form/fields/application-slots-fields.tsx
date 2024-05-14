import { FormFieldType } from '@/types/form-field.types';
import { AdminApplicationParticipants } from '@/validation/applications/admin.application.validation';

const slotsFields: FormFieldType<AdminApplicationParticipants>[] = [
  {
    name: 'slotsCitizen',
    type: 'number',
    label: 'Kenyan citizens',
    placeholder: '0',
    minValue: 0,
    className: 'flex-grow',
  },
  {
    name: 'slotsEastAfrican',
    type: 'number',
    label: 'East African citizens',
    placeholder: '0',
    minValue: 0,
    className: 'flex-grow',
  },
  {
    name: 'slotsGlobal',
    type: 'number',
    label: 'Global citizens',
    placeholder: '0',
    minValue: 0,
    className: 'flex-grow',
  },
];

export default slotsFields;
