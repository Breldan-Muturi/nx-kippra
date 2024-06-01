'use client';
import {
  FetchTrainingSessionsReturn,
  filterTrainingSessions,
} from '@/actions/training-session/fetch.training-sessions.actions';
import useTrainingSessionModals from '@/app/(portal)/hooks/use-training-session-modals';
import ResponsiveGrid from '@/components/layouts/responsive-grid';
import TablesPagination from '@/components/table/table-pagination';
import { cn } from '@/lib/utils';
import { FilterSessionsSchema } from '@/validation/training-session/fetch.sessions.validations';
import { useEffect } from 'react';
import { SubmitHandler } from 'react-hook-form';
import TrainingSessionCard from './cards/training-session-card';
import trainingFilterFields from './filters/training-session-fields';
import TrainingSessionFilters from './filters/training-session-filters';
import DeleteSession from './modals/delete-session';
import SessionModal from './modals/session-modal';
import ViewSession from './sheets/view-session';

type TrainingSessionsProps = React.ComponentPropsWithoutRef<'section'> &
  FetchTrainingSessionsReturn & {
    programId?: string;
    trainingSessionId?: string;
  };

const TrainingSessions = ({
  trainingSessions,
  count,
  firstEndDate,
  lastEndDate,
  firstStartDate,
  lastStartDate,
  modeOptions,
  venueOptions,
  showProgram,
  programId,
  trainingSessionId,
  params,
  className,
  ...props
}: TrainingSessionsProps) => {
  const {
    isPending,
    startTransition,
    dismissModal,
    sessionUpdate,
    updateSession,
    updateData,
    viewSession,
    viewData,
    deleteSession,
    deleteId,
    newSession,
    newProgramId,
    path,
    user,
  } = useTrainingSessionModals({
    trainingSessionIds: trainingSessions.map(({ id }) => id),
    programId,
    selectedSessionId: trainingSessionId,
  });

  const { pageSize, page, showPast } = params;
  const changePage = (pageInt: number) => {
    startTransition(() => {
      filterTrainingSessions({
        ...params,
        page: pageInt.toString(),
        path,
      });
    });
  };

  const changePageSize = (newPageSize: string) => {
    startTransition(() => {
      filterTrainingSessions({
        ...params,
        page: '1', // Reset to page 1 to avoid out of bounds error
        pageSize: newPageSize,
        path,
      });
    });
  };

  const clearFilters = () =>
    startTransition(() => {
      filterTrainingSessions({
        path,
        page: '1',
        pageSize,
      });
    });

  const onSubmit: SubmitHandler<FilterSessionsSchema> = (values) =>
    startTransition(() => {
      filterTrainingSessions({
        ...params,
        ...values,
        path,
      });
    });

  const updateViews = (isShowPast: 'true' | 'false') =>
    startTransition(() => {
      filterTrainingSessions({
        ...params,
        page: '1',
        showPast: isShowPast,
        path,
      });
    });

  useEffect(() => {
    if (trainingSessionId) viewSession(trainingSessionId);
  }, [trainingSessionId]);

  return (
    <>
      <section
        className={cn(
          'flex flex-col w-full px-2 lg:px-6 py-4 space-y-4',
          className,
        )}
        {...props}
      >
        <TrainingSessionFilters
          values={params}
          isPending={isPending}
          filterForm={trainingFilterFields({
            firstEndDate,
            lastEndDate,
            firstStartDate,
            lastStartDate,
            modeOptions,
            venueOptions,
            showProgram,
          })}
          clearFilters={clearFilters}
          customSubmit={onSubmit}
          updateViews={updateViews}
          newSession={newSession}
          programId={programId}
        />
        <ResponsiveGrid>
          {trainingSessions.map((data) => (
            <TrainingSessionCard
              key={data.id}
              {...{
                data,
                isPending,
                user,
                sessionUpdate,
                deleteSession,
                viewSession,
                showProgram,
                showPast,
              }}
            />
          ))}
        </ResponsiveGrid>
        <TablesPagination
          changePage={changePage}
          changePageSize={changePageSize}
          isPending={isPending}
          pagination={{ page, pageSize }}
          count={count}
          pageSizeSteps={12}
        />
      </section>
      {updateData && (
        <SessionModal {...{ trainingSession: updateData, dismissModal }} />
      )}
      {newProgramId && (
        <SessionModal {...{ programId: newProgramId, dismissModal }} />
      )}
      {deleteId && <DeleteSession {...{ id: deleteId, dismissModal }} />}
      {viewData && (
        <ViewSession
          {...{
            ...viewData,
            dismissModal,
            viewSession,
            updateSession,
            isPending,
            user,
          }}
        />
      )}
    </>
  );
};

export default TrainingSessions;
