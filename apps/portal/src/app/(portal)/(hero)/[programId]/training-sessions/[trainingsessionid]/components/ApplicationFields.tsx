import { FormFieldType, SelectOptions } from "@/types/form-field.types";
import {
  ApplicationTypeForm,
  NewApplicationForm,
  OrganizationDetailsForm,
} from "@/validation/application.validation";
import {
  deliveryModeOptions,
  sponsorTypeOptions,
} from "@/helpers/enum.helpers";
import { Delivery } from "@prisma/client";

export const applicationForm = (
  sessionHasBothModes: boolean,
): FormFieldType<ApplicationTypeForm>[] => {
  const selectDelivery = deliveryModeOptions.filter(
    ({ value }) => value !== Delivery.BOTH_MODES,
  );
  const sponsorTypeField: FormFieldType<ApplicationTypeForm> = {
    name: "sponsorType",
    label: "Select application sponsor type",
    placeholder: "Choose a sponsor type",
    selectLabel: "Sponsor types",
    type: "select",
    options: sponsorTypeOptions,
  };
  const deliveryTypeField: FormFieldType<ApplicationTypeForm> = {
    name: "delivery",
    label: "Select the mode of delivery",
    placeholder: "Select delivery mode",
    selectLabel: "Delivery modes",
    type: "select",
    options: selectDelivery,
  };
  return sessionHasBothModes
    ? [sponsorTypeField, deliveryTypeField]
    : [sponsorTypeField];
};

export const organizationForm = (
  isExistingOrganizationSelected: boolean,
  organizationOptions: SelectOptions[],
): FormFieldType<OrganizationDetailsForm>[] => {
  // Toggle between existing and new organization
  const commonField: FormFieldType<OrganizationDetailsForm> = {
    name: "isExistingOrganization",
    type: "checkbox",
    className: "items-start col-span-2 py-2",
    description: isExistingOrganizationSelected
      ? "Uncheck to add a new organization"
      : "Check to select existing organizations",
  };

  // Existing organizations return a select with different organization names
  const existingOrganizationFields: FormFieldType<OrganizationDetailsForm>[] = [
    {
      name: "organizationId",
      label: "Select sponsor organization",
      placeholder: "Select organization",
      selectLabel: "Sponsor organizations",
      type: "select",
      options: organizationOptions,
    },
    commonField,
  ];

  // New organizations return new organization form fields
  const newOrganizationFields: FormFieldType<OrganizationDetailsForm>[] = [
    commonField,
    {
      name: "newOrganization.name",
      type: "text",
      label: "Enter organization name",
      placeholder: "eg. Organization Name",
    },
    {
      name: "newOrganization.county",
      type: "text",
      label: "Enter organization county",
      placeholder: "eg. Nairobi",
    },
    {
      name: "newOrganization.organizationEmail",
      type: "email",
      label: "Enter organization email",
      placeholder: "info@organization.com",
    },
    {
      name: "newOrganization.organizationPhone",
      type: "tel",
      label: "Enter organization phone no",
      placeholder: "eg. 254711223344",
    },
    {
      name: "newOrganization.organizationAddress",
      type: "address",
      label: "Enter organization address",
      placeholder: "eg. Nairobi Moi-Avenue, P.O.Box 10000 - 00100",
      className: "col-span-2",
    },
    {
      name: "newOrganization.contactPersonName",
      type: "text",
      label: "Enter contact person name",
      placeholder: "eg. Anne Wanjiku",
    },
    {
      name: "newOrganization.contactPersonEmail",
      type: "email",
      label: "Enter contact person email",
      placeholder: "anne.wanjiku@organization.com",
    },
  ];

  return isExistingOrganizationSelected
    ? existingOrganizationFields
    : newOrganizationFields;
};

export const slotsFields = ({
  kenyanParticipantCount,
  eastAfricanCount,
  globalCount,
}: {
  kenyanParticipantCount?: number;
  eastAfricanCount?: number;
  globalCount?: number;
}): FormFieldType<NewApplicationForm>[] => {
  return [
    {
      name: "slotsCitizen",
      type: "number",
      label: "Slots Kenyan",
      placeholder: "0",
      minValue: kenyanParticipantCount ?? 0,
    },
    {
      name: "slotsEastAfrican",
      type: "number",
      label: "East African",
      placeholder: "0",
      minValue: eastAfricanCount ?? 0,
    },
    {
      name: "slotsGlobal",
      type: "number",
      label: "Global",
      placeholder: "0",
      minValue: globalCount ?? 0,
    },
  ];
};
