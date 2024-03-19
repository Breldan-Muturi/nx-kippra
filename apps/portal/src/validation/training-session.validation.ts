import { z } from "zod";
import { characterCount, validateDateRange } from "./reusable.validation";
import { Delivery, Venue } from "@prisma/client";

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
  "startDate",
  "endDate",
);

export type FilterTrainingSessionSchemaType = z.infer<
  typeof filterTrainingSessionsSchema
>;

export const trainingSessionSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  venue: z.nativeEnum(Venue).optional(), // null for virtual sessions
  usingDifferentFees: z.boolean(),
  mode: z.nativeEnum(Delivery),
  citizenFee: z.number().optional(),
  eastAfricaFee: z.number().optional(),
  globalParticipantFee: z.number().optional(),
  citizenOnlineFee: z.number().optional(), // null for onPremises sessions
  eastAfricaOnlineFee: z.number().optional(),
  globalParticipantOnlineFee: z.number().optional(),
  onPremiseSlots: z.number().optional(),
  onlineSlots: z.number().optional(), // null for onpremise sessions
});

const trainingSessionSchemasRefinement = (schema: z.ZodObject<any>) => {
  return schema.refine(
    ({
      startDate,
      endDate,
      usingDifferentFees,
      mode,
      venue,
      citizenFee,
      citizenOnlineFee,
      eastAfricaOnlineFee,
      globalParticipantOnlineFee,
      onlineSlots,
      onPremiseSlots,
      eastAfricaFee,
      globalParticipantFee,
    }) => {
      switch (mode) {
        case Delivery.ONLINE:
          if (usingDifferentFees) {
            return [eastAfricaOnlineFee, globalParticipantOnlineFee].every(
              Boolean,
            );
          }
          return [onlineSlots, citizenOnlineFee].every(Boolean);
          break;
        case Delivery.ON_PREMISE:
          {
            if (usingDifferentFees) {
              return [eastAfricaFee, globalParticipantFee].every(Boolean);
            }
            return [citizenFee, onPremiseSlots, venue].every(Boolean);
          }
          break;
        case Delivery.BOTH_MODES: {
          if (usingDifferentFees) {
            return [
              eastAfricaFee,
              eastAfricaOnlineFee,
              globalParticipantFee,
              globalParticipantOnlineFee,
            ].every(Boolean);
          }
          return [
            citizenFee,
            citizenOnlineFee,
            onlineSlots,
            onPremiseSlots,
            venue,
          ].every(Boolean);
          break;
        }
      }
      return startDate < endDate;
    },
    ({
      startDate,
      endDate,
      usingDifferentFees,
      mode,
      venue,
      citizenFee,
      citizenOnlineFee,
      eastAfricaOnlineFee,
      globalParticipantOnlineFee,
      onlineSlots,
      onPremiseSlots,
      eastAfricaFee,
      globalParticipantFee,
    }) => {
      let message: string | undefined, path: (string | number)[] | undefined;
      switch (mode) {
        case Delivery.ONLINE:
          if (usingDifferentFees) {
            if (!eastAfricaOnlineFee) {
              message = "East african online fees required";
              path = ["eastAfricaOnlineFee"];
            }
            if (!globalParticipantOnlineFee) {
              message = "Global participant online fees required";
              path = ["globalParticipantOnlineFee"];
            }
          }
          if (!citizenOnlineFee) {
            message = "Citizen online fee required";
            path = ["citizenOnlineFee"];
          }
          if (!onlineSlots) {
            message = "Online slots required";
            path = ["onlineSlots"];
          }
        case Delivery.ON_PREMISE: {
          if (usingDifferentFees) {
            if (!eastAfricaFee) {
              message = "East african on premises fees required";
              path = ["eastAfricaFee"];
            }
            if (!globalParticipantFee) {
              message = "Global participant on premises fees required";
              path = ["globalParticipantFee"];
            }
          }
          if (!citizenFee) {
            message = "Citizen on premises fee required";
            path = ["citizenFee"];
          }
          if (!onPremiseSlots) {
            message = "On premises slots required";
            path = ["onPremiseSlots"];
          }
          if (!venue) {
            message = "A venue is required for on premise training sessions";
            path = ["venue"];
          }
        }
        case Delivery.BOTH_MODES: {
          if (usingDifferentFees) {
            if (!eastAfricaFee) {
              message = "East african on premises fees required";
              path = ["eastAfricaFee"];
            }
            if (!globalParticipantFee) {
              message = "Global participant on premises fees required";
              path = ["globalParticipantFee"];
            }
            if (!eastAfricaOnlineFee) {
              message = "East african online fees required";
              path = ["eastAfricaOnlineFee"];
            }
            if (!globalParticipantOnlineFee) {
              message = "Global participant online fees required";
              path = ["globalParticipantOnlineFee"];
            }
          }
          if (!citizenFee) {
            message = "Citizen on premises fee required";
            path = ["citizenFee"];
          }
          if (!onPremiseSlots) {
            message = "On premises slots required";
            path = ["onPremiseSlots"];
          }
          if (!citizenOnlineFee) {
            message = "Citizen online fee required";
            path = ["citizenOnlineFee"];
          }
          if (!onlineSlots) {
            message = "Online slots required";
            path = ["onlineSlots"];
          }
          if (!venue) {
            message = "A venue is required for on premise training sessions";
            path = ["venue"];
          }
        }
      }
      if (startDate >= endDate) {
        message = "End date cannot come before start date";
        path = ["endDate"];
      }
      return {
        message,
        path,
      };
    },
  );
};

const newTrainingSession = trainingSessionSchema.extend({
  programId: z.string(),
});
export const newTrainingSessionSchema =
  trainingSessionSchemasRefinement(newTrainingSession);
export type NewTrainingSessionForm = z.infer<typeof newTrainingSession>;

const updateTrainingSession = trainingSessionSchema.extend({
  id: z.string(),
});
export const updateTrainingSessionSchema = trainingSessionSchemasRefinement(
  updateTrainingSession,
);
export type UpdateTrainingSessionForm = z.infer<typeof updateTrainingSession>;
