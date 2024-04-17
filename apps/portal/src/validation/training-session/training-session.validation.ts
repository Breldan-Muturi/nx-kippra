import { z } from 'zod';
import { characterCount, validateDateRange } from '../reusable.validation';
import { Delivery, Venue } from '@prisma/client';

const optionalString = z.string().nullable().optional();
const optionalDate = z.date().nullable().optional();

export const filterTrainingSessionsSchema = validateDateRange(
  z.object({
    name: optionalString,
    venue: z.nativeEnum(Venue).optional(),
    mode: z.nativeEnum(Delivery).optional(),
    startDate: optionalDate,
    endDate: optionalDate,
  }),
  'startDate',
  'endDate',
);
export type FilterTrainingSessionSchemaType = z.infer<
  typeof filterTrainingSessionsSchema
>;

export const trainingSessionFeesSchema = z.object({
  usingUsd: z.boolean().default(false),
  citizenFee: z.number().optional(),
  eastAfricaFee: z.number().optional(),
  globalParticipantFee: z.number().optional(),
  citizenOnlineFee: z.number().optional(), // null for onPremises sessions
  eastAfricaOnlineFee: z.number().optional(),
  globalParticipantOnlineFee: z.number().optional(),
  usdCitizenFee: z.number().optional(),
  usdEastAfricaFee: z.number().optional(),
  usdGlobalParticipantFee: z.number().optional(),
  usdCitizenOnlineFee: z.number().optional(), // null for onPremises sessions
  usdEastAfricaOnlineFee: z.number().optional(),
  usdGlobalParticipantOnlineFee: z.number().optional(),
});
export type TrainingSessionFeesForm = z.infer<typeof trainingSessionFeesSchema>;

export const trainingSessionSchema = z
  .object({
    id: z.string().optional(),
    programId: z.string(),
    startDate: z.date(),
    endDate: z.date(),
    venue: z.nativeEnum(Venue).optional(), // null for virtual sessions
    usingDifferentFees: z.boolean(),
    mode: z.nativeEnum(Delivery),
    onPremiseSlots: z.number().optional(),
    onlineSlots: z.number().optional(), // null for onpremise sessions
  })
  .merge(trainingSessionFeesSchema)
  .refine(
    ({ startDate, endDate }) => {
      return endDate > startDate;
    },
    {
      message: 'End date should be after start date',
      path: ['endDate'],
    },
  )
  .refine(
    ({ mode, citizenFee }) => {
      return mode !== Delivery.ONLINE ? !!citizenFee : !!!citizenFee;
    },
    ({ mode, citizenFee }) => {
      const message =
        (mode === Delivery.ONLINE &&
          !!citizenFee &&
          'Citizen fee should be empty for online courses') ||
        (mode !== Delivery.ONLINE && !!!citizenFee && 'Citizen fee is missing');
      return {
        message: message || undefined,
        path: ['citizenFee'],
      };
    },
  )
  .refine(
    ({ mode, citizenOnlineFee }) => {
      return mode !== Delivery.ON_PREMISE
        ? !!citizenOnlineFee
        : !!!citizenOnlineFee;
    },
    ({ mode, citizenOnlineFee }) => {
      const message =
        (mode === Delivery.ON_PREMISE &&
          !!citizenOnlineFee &&
          'Citizen online fee should be empty for on premise sessions') ||
        (mode !== Delivery.ON_PREMISE &&
          !!!citizenOnlineFee &&
          'Citizen online fee required');
      return {
        message: message || undefined,
        path: ['citizenOnlineFee'],
      };
    },
  )
  .refine(
    ({ mode, usingUsd, usdCitizenFee }) => {
      return mode !== Delivery.ONLINE && usingUsd
        ? !!usdCitizenFee
        : !!!usdCitizenFee;
    },
    ({ mode, usingUsd, usdCitizenFee }) => {
      const message =
        (!usingUsd && 'Usd fees are not enabled') ||
        (mode === Delivery.ONLINE &&
          !!usdCitizenFee &&
          'Usd citizen fees should be empty for online courses') ||
        (mode !== Delivery.ONLINE &&
          !!!usdCitizenFee &&
          'Usd citizen fees required');
      return {
        message: message || undefined,
        path: ['usdCitizenFee'],
      };
    },
  )
  .refine(
    ({ mode, usingUsd, usdCitizenOnlineFee }) => {
      return mode !== Delivery.ON_PREMISE && usingUsd
        ? !!usdCitizenOnlineFee
        : !!!usdCitizenOnlineFee;
    },
    ({ mode, usingUsd, usdCitizenOnlineFee }) => {
      const message =
        (!usingUsd && 'Usd fees are not enabled') ||
        (mode === Delivery.ON_PREMISE &&
          !!usdCitizenOnlineFee &&
          'Online fees should be empty for on premise courses') ||
        (mode !== Delivery.ON_PREMISE &&
          !!!usdCitizenOnlineFee &&
          'Usd citizen online fees required');
      return {
        message: message || undefined,
        path: ['usdCitizenOnlineFee'],
      };
    },
  )
  .refine(
    ({ mode, usingDifferentFees, eastAfricaFee }) => {
      return mode !== Delivery.ONLINE && usingDifferentFees
        ? !!eastAfricaFee
        : !!!eastAfricaFee;
    },
    ({ mode, usingDifferentFees, eastAfricaFee }) => {
      const message =
        (!usingDifferentFees &&
          'Different application fees by citizenship has not been enabled') ||
        (mode === Delivery.ONLINE &&
          !!eastAfricaFee &&
          'On premise fee should be empty for online courses') ||
        (mode !== Delivery.ONLINE &&
          !!!eastAfricaFee &&
          'East African fee required');
      return {
        message: message || undefined,
        path: ['eastAfricaFee'],
      };
    },
  )
  .refine(
    ({ mode, usingDifferentFees, eastAfricaOnlineFee }) => {
      return mode !== Delivery.ON_PREMISE && usingDifferentFees
        ? !!eastAfricaOnlineFee
        : !!!eastAfricaOnlineFee;
    },
    ({ mode, usingDifferentFees, eastAfricaOnlineFee }) => {
      const message =
        (!usingDifferentFees &&
          'Different application fees by citizenship has not been enabled') ||
        (mode === Delivery.ON_PREMISE &&
          !!eastAfricaOnlineFee &&
          'Online fee should be empty for on-premise courses') ||
        (mode !== Delivery.ON_PREMISE &&
          !!!eastAfricaOnlineFee &&
          'East African online fee required');
      return {
        message: message || undefined,
        path: ['eastAfricaOnlineFee'],
      };
    },
  )
  .refine(
    ({ mode, usingDifferentFees, usingUsd, usdEastAfricaFee }) => {
      return mode !== Delivery.ONLINE && usingDifferentFees && usingUsd
        ? !!usdEastAfricaFee
        : !!!usdEastAfricaFee;
    },
    ({ mode, usingUsd, usingDifferentFees, usdEastAfricaFee }) => {
      const message =
        (!usingUsd && 'Usd fees are not enabled') ||
        (!usingDifferentFees &&
          'Different application fees by citizenship has not been enabled') ||
        (mode === Delivery.ONLINE &&
          !!usdEastAfricaFee &&
          'On premise fee should be empty for online courses') ||
        (mode !== Delivery.ONLINE &&
          !!!usdEastAfricaFee &&
          'Usd East African fee required');
      return {
        message: message || undefined,
        path: ['usdEastAfricaFee'],
      };
    },
  )
  .refine(
    ({ mode, usingDifferentFees, usingUsd, usdEastAfricaOnlineFee }) => {
      return mode !== Delivery.ON_PREMISE && usingDifferentFees && usingUsd
        ? !!usdEastAfricaOnlineFee
        : !!!usdEastAfricaOnlineFee;
    },
    ({ mode, usingUsd, usingDifferentFees, usdEastAfricaOnlineFee }) => {
      const message =
        (!usingUsd && 'Usd fees are not enabled') ||
        (!usingDifferentFees &&
          'Different application fees by citizenship has not been enabled') ||
        (mode === Delivery.ON_PREMISE &&
          !!usdEastAfricaOnlineFee &&
          'Online fee should be empty for on-premise courses') ||
        (mode !== Delivery.ON_PREMISE &&
          !!!usdEastAfricaOnlineFee &&
          'Usd East African online fee required');
      return {
        message: message || undefined,
        path: ['usdEastAfricaOnlineFee'],
      };
    },
  )
  .refine(
    ({ mode, usingDifferentFees, globalParticipantFee }) => {
      return mode !== Delivery.ONLINE && usingDifferentFees
        ? !!globalParticipantFee
        : !!!globalParticipantFee;
    },
    ({ mode, usingDifferentFees, globalParticipantFee }) => {
      const message =
        (!usingDifferentFees &&
          'Different application fees by citizenship has not been enabled') ||
        (mode === Delivery.ONLINE &&
          !!globalParticipantFee &&
          'On premise fee should be empty for online courses') ||
        (mode !== Delivery.ONLINE &&
          !!!globalParticipantFee &&
          'Global participant fee required');
      return {
        message: message || undefined,
        path: ['globalParticipantFee'],
      };
    },
  )
  .refine(
    ({ mode, usingDifferentFees, globalParticipantOnlineFee }) => {
      return mode !== Delivery.ON_PREMISE && usingDifferentFees
        ? !!globalParticipantOnlineFee
        : !!!globalParticipantOnlineFee;
    },
    ({ mode, usingDifferentFees, globalParticipantOnlineFee }) => {
      const message =
        (!usingDifferentFees &&
          'Different application fees by citizenship has not been enabled') ||
        (mode === Delivery.ON_PREMISE &&
          !!globalParticipantOnlineFee &&
          'Online fee should be empty for on-premise courses') ||
        (mode !== Delivery.ON_PREMISE &&
          !!!globalParticipantOnlineFee &&
          'Global participant online fee required');
      return {
        message: message || undefined,
        path: ['globalParticipantOnlineFee'],
      };
    },
  )
  .refine(
    ({ mode, usingDifferentFees, usingUsd, usdGlobalParticipantFee }) => {
      return mode !== Delivery.ONLINE && usingDifferentFees && usingUsd
        ? !!usdGlobalParticipantFee
        : !!!usdGlobalParticipantFee;
    },
    ({ mode, usingUsd, usingDifferentFees, usdGlobalParticipantFee }) => {
      const message =
        (!usingUsd && 'Usd fees are not enabled') ||
        (!usingDifferentFees &&
          'Different application fees by citizenship has not been enabled') ||
        (mode === Delivery.ONLINE &&
          !!usdGlobalParticipantFee &&
          'On premise fee should be empty for online courses') ||
        (mode !== Delivery.ONLINE &&
          !!!usdGlobalParticipantFee &&
          'Usd Global participant fee required');
      return {
        message: message || undefined,
        path: ['usdGlobalParticipantFee'],
      };
    },
  )
  .refine(
    ({ mode, usingDifferentFees, usingUsd, usdGlobalParticipantOnlineFee }) => {
      return mode !== Delivery.ON_PREMISE && usingDifferentFees && usingUsd
        ? !!usdGlobalParticipantOnlineFee
        : !!!usdGlobalParticipantOnlineFee;
    },
    ({ mode, usingUsd, usingDifferentFees, usdGlobalParticipantOnlineFee }) => {
      const message =
        (!usingUsd && 'Usd fees are not enabled') ||
        (!usingDifferentFees &&
          'Different application fees by citizenship has not been enabled') ||
        (mode === Delivery.ON_PREMISE &&
          !!usdGlobalParticipantOnlineFee &&
          'Online fee should be empty for on-premise courses') ||
        (mode !== Delivery.ON_PREMISE &&
          !!!usdGlobalParticipantOnlineFee &&
          'Usd Global participant online fee required');
      return {
        message: message || undefined,
        path: ['usdGlobalParticipantOnlineFee'],
      };
    },
  );

export type UpdateTrainingSessionForm = z.infer<typeof trainingSessionSchema>;
export type NewTrainingSessionForm = Omit<UpdateTrainingSessionForm, 'id'>;
