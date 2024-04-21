import { ApplicationFilterType } from '@/actions/applications/filter.applications.actions';
import { FormFieldType } from '@/types/form-field.types';
import { FilterApplicationType } from '@/validation/applications/user.application.validation';

export const filterApplicationsForm = ({
  filterStatus,
  filterSponsorType,
  disabled,
}: ApplicationFilterType): FormFieldType<FilterApplicationType>[] => {
  const applicationsFilter: FormFieldType<FilterApplicationType>[] = [
    {
      name: 'status',
      type: 'select',
      label: 'Application status',
      placeholder: 'Select a status',
      selectLabel: 'Application statuses',
      options: filterStatus,
      disabled,
    },
    {
      name: 'type',
      type: 'select',
      label: 'Sponsor type',
      placeholder: 'Select sponsor type',
      selectLabel: 'Available sponsor types',
      options: filterSponsorType,
      disabled,
    },
    {
      name: 'programTitle',
      type: 'search',
      label: 'Program Title',
      placeholder: 'Search program',
      disabled,
    },
    {
      name: 'organizationName',
      type: 'search',
      label: 'Organization Name',
      placeholder: 'Search organization',
      disabled,
    },
    {
      name: 'applicantName',
      type: 'search',
      label: 'Applicant Name',
      placeholder: 'Search applicant',
      disabled,
    },
  ];
  return applicationsFilter;
};
