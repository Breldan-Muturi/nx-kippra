'use server';

import { formatDeliveryMode, formatVenues } from '@/helpers/enum.helpers';
import { processSearchString } from '@/helpers/filter.helpers';
import { db } from '@/lib/db';
import { SelectOptions } from '@/types/form-field.types';
import { PaginationType } from '@/validation/pagination.validation';
import {
  FetchSessionsSchema,
  PathSessionSchema,
  fetchSessionsSchema,
  pathSessionSchema,
} from '@/validation/training-session/fetch.sessions.validations';
import { Prisma, Venue } from '@prisma/client';
import filterRedirect from '../redirect.actions';

export const filterTrainingSessions = async (values: PathSessionSchema) =>
  await filterRedirect(values, pathSessionSchema, values.path);

type TrainingSessionsParams = {
  where: Prisma.TrainingSessionWhereInput;
  showProgram: boolean;
  pastShow: boolean;
} & PaginationType;

const trainingSessionsPromise = async ({
  where,
  showProgram,
  page,
  pageSize,
  pastShow,
}: TrainingSessionsParams) =>
  await db.trainingSession.findMany({
    where,
    skip: (parseInt(page) - 1) * parseInt(pageSize),
    take: parseInt(pageSize),
    orderBy: { startDate: pastShow ? 'desc' : 'asc' },
    select: {
      id: true,
      venue: true,
      startDate: true,
      endDate: true,
      mode: true,
      onPremiseSlots: true,
      onPremiseSlotsTaken: true,
      onlineSlots: true,
      onlineSlotsTaken: true,
      program: {
        select: {
          id: true,
          ...(showProgram && {
            title: true,
            code: true,
          }),
        },
      },
    },
  });
type TrainingSessionPromise = Awaited<
  ReturnType<typeof trainingSessionsPromise>
>;
export type TrainingCardSession = TrainingSessionPromise[number];

const trainingSessionCount = async (
  where: TrainingSessionsParams['where'],
): Promise<number> => await db.trainingSession.count({ where });

const trainingOptionsPromise = async (where: TrainingSessionsParams['where']) =>
  await db.trainingSession.findMany({
    where,
    select: { mode: true, venue: true, startDate: true, endDate: true },
  });
type TrainingOptions = Awaited<ReturnType<typeof trainingOptionsPromise>>;

type FetchTrainingSessionParams = FetchSessionsSchema & { programId?: string };

export type FilterSessionValues = {
  showProgram: boolean;
  firstStartDate: Date;
  lastStartDate: Date;
  firstEndDate: Date;
  lastEndDate: Date;
  venueOptions: SelectOptions[];
  modeOptions: SelectOptions[];
};
export type FetchTrainingSessionsReturn = {
  trainingSessions: TrainingCardSession[];
  count: number;
  params: FetchSessionsSchema;
} & FilterSessionValues;

export const fetchTrainingSessions = async (
  params: FetchTrainingSessionParams,
): Promise<{ error: string } | FetchTrainingSessionsReturn> => {
  const { programId } = params;
  params.pageSize = params.pageSize ?? '12';

  const validParams = fetchSessionsSchema.parse({
    ...params,
    ...(params.startDate ? { startDate: new Date(params.startDate) } : {}),
    ...(params.endDate ? { endDate: new Date(params.endDate) } : {}),
  });

  const {
    page,
    pageSize,
    endDate,
    mode,
    programTitle,
    startDate,
    venue,
    showPast,
  } = validParams;
  let countWhere: TrainingSessionsParams['where'] = {},
    fetchWhere: TrainingSessionsParams['where'] = {};

  if (programId) {
    countWhere.programId = programId;
    fetchWhere.programId = programId;
  }

  if (venue) fetchWhere.venue = venue;
  if (mode) fetchWhere.mode = mode;

  const searchProgramTitle =
    programTitle && !programId ? processSearchString(programTitle) : undefined;
  if (searchProgramTitle)
    fetchWhere.program = { title: { search: searchProgramTitle } };

  const pastShow = showPast === 'true';

  fetchWhere.AND = [
    startDate ? { startDate: { gte: new Date(startDate) } } : {},
    endDate ? { endDate: { lte: new Date(endDate) } } : {},
    pastShow
      ? { endDate: { lt: new Date() } }
      : { endDate: { gte: new Date() } },
  ];

  countWhere.AND = [
    pastShow
      ? { endDate: { lt: new Date() } }
      : { endDate: { gte: new Date() } },
  ];

  try {
    const [trainingSessions, count, trainingOptions] = await Promise.all([
      trainingSessionsPromise({
        where: fetchWhere,
        page,
        pageSize,
        showProgram: !programId,
        pastShow,
      }),
      trainingSessionCount(countWhere),
      trainingOptionsPromise(countWhere),
    ]);
    const startDates = trainingOptions.map(({ startDate }) => startDate);
    const endDates = trainingOptions.map(({ endDate }) => endDate);
    const firstStartDate = new Date(
      Math.min(...startDates.map((date) => new Date(date).getTime())),
    );
    const lastStartDate = new Date(
      Math.max(...startDates.map((date) => new Date(date).getTime())),
    );
    const firstEndDate = new Date(
      Math.min(...endDates.map((date) => new Date(date).getTime())),
    );
    const lastEndDate = new Date(
      Math.max(...endDates.map((date) => new Date(date).getTime())),
    );
    const venueOptions: SelectOptions[] = trainingOptions
      .map(({ venue }) => venue)
      .filter(
        (value, index, self): value is Venue =>
          value !== null && self.indexOf(value) === index,
      )
      .map((value) => ({ value, optionLabel: formatVenues(value) }));
    const modeOptions: SelectOptions[] = trainingOptions
      .map(({ mode }) => mode)
      .filter((value, index, self) => self.indexOf(value) === index)
      .map((value) => ({ value, optionLabel: formatDeliveryMode(value) }));

    return {
      trainingSessions,
      count,
      firstStartDate,
      lastStartDate,
      firstEndDate,
      lastEndDate,
      venueOptions,
      modeOptions,
      showProgram: !!programId,
      params: validParams,
    };
  } catch (e) {
    console.error(
      'Failed to fetch training sessions due to a server error: ',
      e,
    );
    return {
      error:
        'Failed to fetch training sessions due to a server error. Please try again later',
    };
  }
};
