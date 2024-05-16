import { OrgOption } from '@/actions/applications/form.applications.actions';
import DropDownImage from '@/components/drop-down-options/drop-down-w-image';
import { FormFieldType } from '@/types/form-field.types';
import { AdminApplicationOrganization } from '@/validation/applications/admin.application.validation';

type ApplicationOrganizationFieldsProps = {
  existingOrganization: boolean;
  orgOptions: OrgOption[];
};

const applicationOrganizationFields = ({
  existingOrganization,
  orgOptions,
}: ApplicationOrganizationFieldsProps): FormFieldType<AdminApplicationOrganization>[] => [
  ...(orgOptions.length > 0
    ? ([
        {
          name: 'isExistingOrganization',
          type: 'switch',
          label: 'Select existing organization',
          description: 'Make this application with an existing organization',
          className: 'col-span-2 bg-background',
        },
      ] as FormFieldType<AdminApplicationOrganization>[])
    : []),
  ...(existingOrganization && orgOptions.length > 0
    ? ([
        {
          name: 'organizationId',
          type: 'combobox',
          label: 'Select sponsor organization',
          noResults: 'No matching organization',
          className: 'col-span-2',
          comboboxTrigger: (value) => {
            if (value) {
              return orgOptions.find(({ id }) => id === value)?.name;
            }
            return 'Select organization';
          },
          comboboxOptions: orgOptions.map(({ name, county, image, id }, i) => ({
            value: id,
            optionLabel: name,
            render: (value) => {
              const isSelected = value === id;
              return (
                <DropDownImage
                  key={`${i}${id}`}
                  image={image ?? undefined}
                  info={county}
                  name={name}
                  isSelected={isSelected}
                />
              );
            },
          })),
          handleSelect: (selectedValue, value) =>
            selectedValue === value ? value : selectedValue,
        },
      ] as FormFieldType<AdminApplicationOrganization>[])
    : []),
  ...(!existingOrganization || !orgOptions.length
    ? ([
        {
          name: 'name',
          type: 'text',
          label: 'Enter organization name',
          placeholder: 'eg. Organization name',
        },
        {
          name: 'county',
          type: 'text',
          label: 'Enter organization county',
          placeholder: 'eg. Nairobi',
        },
        {
          name: 'organizationEmail',
          type: 'email',
          label: 'Enter organization email',
          placeholder: 'eg. info@organization.com',
        },
        {
          name: 'organizationPhone',
          type: 'tel',
          label: 'Enter organization phone no',
          placeholder: 'eg. 254711223344',
        },
        {
          name: 'organizationAddress',
          type: 'address',
          label: 'Enter organization address',
          placeholder: 'eg. Nairobi Moi-Avenue, P.O.Box 10000 - 00100',
          className: 'col-span-2',
        },
        {
          name: 'contactPersonName',
          type: 'text',
          label: 'Enter contact person name',
          placeholder: 'eg. Anne Wanjiku',
        },
        {
          name: 'contactPersonEmail',
          type: 'email',
          label: 'Enter contact person email',
          placeholder: 'anne.wanjiku@organization.com',
        },
      ] as FormFieldType<AdminApplicationOrganization>[])
    : []),
];

export default applicationOrganizationFields;
