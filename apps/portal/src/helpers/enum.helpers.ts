import { SelectOptions } from '@/types/form-field.types';
import {
  ApplicationStatus,
  Citizenship,
  Delivery,
  Identification,
  SponsorType,
  UserRole,
  Venue,
} from '@prisma/client';

export const formatDeliveryMode = (mode: Delivery) => {
  switch (mode) {
    case Delivery.ONLINE:
      return 'Online';
    case Delivery.ON_PREMISE:
      return 'On premise';
    case Delivery.BOTH_MODES:
      return 'Both modes available';
    default:
      return mode;
  }
};
// Delivery modes coming from enums described in prisma
export const deliveryModeOptions: SelectOptions[] = Object.values(Delivery).map(
  (value) => ({ value, optionLabel: formatDeliveryMode(value) }),
);

export const formatSponsorType = (sponsorType: SponsorType) => {
  switch (sponsorType) {
    case SponsorType.ORGANIZATION:
      return 'Organization sponsored';
    case SponsorType.SELF_SPONSORED:
      return 'Self sponsored';
    default:
      return sponsorType;
  }
};
// Sponsor types coming from enums described in prisma
export const sponsorTypeOptions: SelectOptions[] = Object.values(
  SponsorType,
).map((value) => ({ value, optionLabel: formatSponsorType(value) }));

export const formatCitizenship = (citizenship: Citizenship) => {
  switch (citizenship) {
    case Citizenship.KENYAN:
      return 'Kenyan Citizen';
    case Citizenship.EAST_AFRICAN:
      return 'East African Citizen';
    case Citizenship.GLOBAL:
      return 'Global Citizen';
    default:
      return citizenship;
  }
};
export const citizenshipOptions: SelectOptions[] = Object.values(
  Citizenship,
).map((value) => ({ value, optionLabel: formatCitizenship(value) }));

export const formatIdentification = (identification: Identification) => {
  switch (identification) {
    case Identification.NATIONAL_ID:
      return 'National ID';
    case Identification.PASSPORT:
      return 'Passport';
    default:
      return identification;
  }
};
export const identificationOptions: SelectOptions[] = Object.values(
  Identification,
).map((value) => ({ value, optionLabel: formatIdentification(value) }));

export const formatVenues = (venue: Venue) => {
  switch (venue) {
    case Venue.KISUMU:
      return 'Kisumu';
    case Venue.MACHAKOS:
      return 'Machakos';
    case Venue.MOMBASA:
      return 'Mombasa';
    case Venue.NAIROBI:
      return 'Nairobi';
    case Venue.NAIVASHA:
      return 'Naivasha';
    case Venue.NAKURU:
      return 'Nakuru';
    default:
      return venue;
  }
};
export const venueOptions: SelectOptions[] = Object.values(Venue).map(
  (value) => ({ value, optionLabel: formatVenues(value) }),
);

export const formatStatus = (status: ApplicationStatus) => {
  switch (status) {
    case ApplicationStatus.APPROVED:
      return 'Approved';
    case ApplicationStatus.COMPLETED:
      return 'Completed';
    case ApplicationStatus.PENDING:
      return 'Pending';
    default:
      return status;
  }
};
export const applicationStatusOptions: SelectOptions[] = Object.values(
  ApplicationStatus,
).map((value) => ({ value, optionLabel: formatStatus(value) }));

export const formatRoles = (role: UserRole) => {
  switch (role) {
    case UserRole.ADMIN:
      return 'Admin';
    case UserRole.USER:
      return 'User';
    default:
      return role;
  }
};
export const roleOptions: SelectOptions[] = Object.values(UserRole).map(
  (value) => ({ value, optionLabel: formatRoles(value) }),
);
