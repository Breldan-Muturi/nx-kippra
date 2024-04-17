'use server';

import { Hero } from '@/components/layouts/hero';
import { db } from '@/lib/db';
import SectionWrapper from '../../../components/layouts/section-wrapper';
import ResponsiveGrid from '@/components/layouts/responsive-grid';
import ProgramCard from './components/program-card';
import { DatePresets, FormFieldType } from '@/types/form-field.types';
import { FilterTrainingSessionSchemaType } from '@/validation/training-session/training-session.validation';
import TrainingCalendarFilter from './components/training-calendar-filter';
import { Delivery, Prisma, Venue } from '@prisma/client';
import TrainingSessionCard from './components/training-session';
import { formatDeliveryMode, formatVenues } from '@/helpers/enum.helpers';
import { processSearchString } from '@/helpers/filter.helpers';

interface PageProps {
  searchParams: {
    name?: string;
    mode?: Delivery;
    venue?: Venue;
    sd: string;
    ed: string;
  };
}

const Homepage = async ({
  searchParams: { name, venue, mode, sd, ed },
}: PageProps) => {
  const filterValues: FilterTrainingSessionSchemaType = {
    name,
    venue,
    mode,
    startDate: new Date(sd),
    endDate: new Date(ed),
  };

  const searchTrainingSessionString = name
    ? processSearchString(name)
    : undefined;

  const searchTrainingSessionFilter: Prisma.TrainingSessionWhereInput =
    searchTrainingSessionString
      ? {
          OR: [{ program: { title: { search: searchTrainingSessionString } } }],
        }
      : {};

  const where: Prisma.TrainingSessionWhereInput = {
    AND: [
      searchTrainingSessionFilter,
      ...(venue ? [{ venue }] : []),
      mode ? { mode } : {},
      sd ? { startDate: { gt: new Date(sd) } } : {},
      ed ? { endDate: { lt: new Date(ed) } } : {},
    ],
  };

  const trainingSessionsPromise = db.trainingSession.findMany({
    where,
    include: {
      program: {
        select: { title: true, id: true },
      },
    },
    orderBy: { startDate: 'asc' },
  });

  const trainingSessionFiltersPromise = db.trainingSession.findMany({
    select: {
      mode: true,
      venue: true,
    },
  });

  const minMaxDatesPromise = db.trainingSession.aggregate({
    _min: {
      startDate: true,
    },
    _max: {
      endDate: true,
    },
  });

  const programsPromise = db.program.findMany({
    include: {
      _count: {
        select: { trainingSessions: true },
      },
    },
  });

  const [trainingSessions, trainingSessionFilters, minMaxDates, programs] =
    await Promise.all([
      trainingSessionsPromise,
      trainingSessionFiltersPromise,
      minMaxDatesPromise,
      programsPromise,
    ]);

  const trainingVenues = trainingSessionFilters
    .map(({ venue }) => venue)
    .filter(
      (value, index, self): value is Venue =>
        value !== null && self.indexOf(value) === index,
    )
    .map((value) => ({
      value,
      optionLabel: formatVenues(value),
    }));

  const trainingModes = trainingSessionFilters
    .map(({ mode }) => mode)
    .filter((value, index, self) => self.indexOf(value) === index)
    .map((uniqueMode) => ({
      value: uniqueMode,
      optionLabel: formatDeliveryMode(uniqueMode),
    }));

  const minDate = minMaxDates._min.startDate ?? undefined;
  const maxDate = minMaxDates._max.endDate ?? undefined;

  const datePresets: DatePresets[] = [
    {
      dateLabel: 'Today',
      value: 0,
    },
    {
      dateLabel: 'Tomorrow',
      value: 1,
    },
    {
      dateLabel: 'In 3 days',
      value: 3,
    },
    {
      dateLabel: 'In a week',
      value: 7,
    },
  ];

  const trainingFilterFields: FormFieldType<FilterTrainingSessionSchemaType>[] =
    [
      {
        name: 'name',
        type: 'search',
        label: 'Course',
        placeholder: 'Search by course name',
      },
      {
        name: 'venue',
        type: 'select',
        label: 'Venue',
        selectLabel: 'Select Venue',
        placeholder: 'Select Venue',
        options: trainingVenues,
      },
      {
        name: 'mode',
        type: 'select',
        label: 'Delivery Mode',
        selectLabel: 'Select mode',
        placeholder: 'Delivery mode',
        options: trainingModes,
      },
      {
        name: 'startDate',
        label: 'Start Date',
        placeholder: 'Select start date',
        selectLabel: 'Select one',
        type: 'date',
        minDate,
        maxDate,
        datePresets,
      },
      {
        name: 'endDate',
        label: 'End Date',
        placeholder: 'Select end date',
        selectLabel: 'Select one',
        type: 'date',
        minDate,
        maxDate,
        datePresets,
      },
    ];

  return (
    <div className="w-full">
      <Hero image="/static/images/hero_image.jpeg" alt="KIPPRA hero image" />
      <SectionWrapper sectionLabel="Our Programmes">
        <ResponsiveGrid>
          {programs
            .sort(
              (a, b) => b._count.trainingSessions - a._count.trainingSessions,
            )
            .map(({ _count: { trainingSessions }, ...programData }, i) => (
              <ProgramCard
                key={`${i}-${programData.id}`}
                sessions={trainingSessions}
                {...programData}
              />
            ))}
        </ResponsiveGrid>
      </SectionWrapper>
      <SectionWrapper sectionLabel="Training Calendar 2023 - 2024">
        <TrainingCalendarFilter
          filterFields={trainingFilterFields}
          filterValues={filterValues}
        />
        <ResponsiveGrid>
          {trainingSessions.map(
            ({ program: { title }, ...trainingSession }, i) => (
              <TrainingSessionCard
                key={`${i}-${trainingSession.id}`}
                title={title}
                trainingSession={trainingSession}
              />
            ),
          )}
        </ResponsiveGrid>
      </SectionWrapper>
    </div>
  );
};
export default Homepage;
