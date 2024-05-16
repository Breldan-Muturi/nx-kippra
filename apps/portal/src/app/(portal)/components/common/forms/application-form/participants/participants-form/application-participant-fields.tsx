import { DynamicParticipantOption } from '@/actions/participants/application.participants.actions';
import { citizenshipOptions } from '@/helpers/enum.helpers';
import { FormFieldType } from '@/types/form-field.types';
import { FormApplicationParticipant } from '@/validation/applications/participants.application.validation';

const participantFields = (
  participant?: DynamicParticipantOption,
): FormFieldType<FormApplicationParticipant>[] => [
  {
    name: 'name',
    type: 'text',
    label: 'Enter participant name',
    placeholder: 'eg. Anne Wanjiku',
    disabled: !!participant?.name,
  },
  {
    name: 'email',
    type: 'email',
    label: 'Enter participant email',
    placeholder: 'eg. anne.wanjiku@email.com',
    disabled: !!participant?.email,
  },
  {
    name: 'citizenship',
    type: 'select',
    label: 'Select participant citizenship',
    selectLabel: 'Citizenship options',
    placeholder: 'eg. Kenyan',
    disabled: !!participant?.citizenship,
    options: citizenshipOptions,
  },
  {
    name: 'nationalId',
    type: 'text',
    label: 'Enter National Id / Passport No',
    placeholder: 'eg. 333333333',
    disabled: !!participant?.nationalId,
  },
];

export default participantFields;
