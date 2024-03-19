import { ApplicationFilterType } from "@/actions/applications/filter.applications.actions";
import { FormFieldType } from "@/types/form-field.types";
import { FilterApplicationType } from "@/validation/application.validation";

export const filterApplicationsForm = ({
  filterStatus,
  filterSponsorType,
  filterProgram,
  filterOrganization,
  filterApplicant,
  disabled,
}: ApplicationFilterType): FormFieldType<FilterApplicationType>[] => {
  let applicationsFilter: FormFieldType<FilterApplicationType>[] = [
    {
      name: "status",
      type: "select",
      label: "Application status",
      placeholder: "Select a status",
      selectLabel: "Application statuses",
      options: filterStatus,
      disabled,
    },
    {
      name: "type",
      type: "select",
      label: "Sponsor type",
      placeholder: "Select sponsor type",
      selectLabel: "Available sponsor types",
      options: filterSponsorType,
      disabled,
    },
    {
      name: "programId",
      type: "combobox",
      label: "Program",
      disabled,
      comboboxOptions: filterProgram.map(({ value, optionLabel }) => ({
        value,
        optionLabel,
      })),
      comboboxTrigger: (value) => {
        if (value) {
          const programOption = filterProgram.find(
            ({ value: programValue }) => programValue === value,
          );
          const programLabel = programOption?.optionLabel || "Unnamed program";
          if (programOption && programLabel?.length > 20) {
            return `${programLabel.slice(0, 20)}...`;
          } else {
            return programLabel;
          }
        } else {
          return "Select a program";
        }
      },
    },
    {
      name: "organizationId",
      type: "combobox",
      label: "Organization",
      disabled,
      comboboxOptions: filterOrganization.map(({ value, optionLabel }) => ({
        value,
        optionLabel,
      })),
      comboboxTrigger: (value) => {
        if (value) {
          const option = filterOrganization.find(
            ({ value: organizationValue }) => organizationValue === value,
          );
          const optionLabel = option?.optionLabel || "Unnamed organization";
          if (option && optionLabel?.length > 20) {
            return `${optionLabel?.slice(0, 20)}...`;
          } else {
            return optionLabel;
          }
        } else {
          return "Select an organization";
        }
      },
    },
  ];
  if (filterApplicant) {
    applicationsFilter.push({
      name: "applicantId",
      type: "combobox",
      label: "Applicants",
      disabled,
      comboboxOptions: filterApplicant.map(({ value, optionLabel }) => ({
        value,
        optionLabel,
      })),
      comboboxTrigger: (value) => {
        if (value) {
          const applicantOption = filterApplicant?.find(
            ({ value: applicantValue }) => applicantValue === value,
          );
          const applicantLabel =
            applicantOption?.optionLabel || "Unnamed applicant";
          if (applicantOption && applicantLabel.length > 25) {
            return `${applicantLabel.slice(0, 25)}...`;
          } else {
            return applicantLabel;
          }
        } else {
          return "Select an applicant";
        }
      },
    });
  }
  return applicationsFilter;
};
