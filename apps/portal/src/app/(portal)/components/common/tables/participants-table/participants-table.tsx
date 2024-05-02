'use client';

import {
  ParticipantsTableProps,
  SingleParticipantDetail,
  filterParticipants,
} from '@/actions/participants/fetch.participants.actions';
import handleTableColumns from '@/components/table/handle-table-columns';
import tableSelectColumn from '@/components/table/table-select-column';
import {
  FilterParticipantsType,
  PathParticipantsType,
  filterParticipantsSchema,
  pathParticipantsSchema,
} from '@/validation/participants/participants.validation';
import { usePathname } from 'next/navigation';
import React, { useMemo, useState, useTransition } from 'react';
import participantColumnApplication from './columns/participant-column-application';
import participantColumnOrganization from './columns/participant-column-organization';
import participantColumnEmail from './columns/participant-column-email';
import participantColumnNationalId from './columns/participant-column-nationalid';
import participantColumnRole from './columns/participant-column-role';
import participantColumnUser from './columns/participant-column-user';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import TableViews from '@/components/table/table-views';
import ReusableTable from '@/components/table/reusable-table';
import TablesPagination from '@/components/table/table-pagination';
import ParticipantsFilterForm from './filters/participants-filter-form';
import { SubmitHandler } from 'react-hook-form';
import filterParticipantsFields from './filters/participants-filter-fields';
import { cn } from '@/lib/utils';

type TableParticipantsProps = React.ComponentPropsWithoutRef<'div'> &
  ParticipantsTableProps;

const ParticipantsTable = ({
  participants,
  count,
  fetchParams,
  className,
  ...props
}: TableParticipantsProps) => {
  const path = usePathname();
  const [isPending, startTransition] = useTransition();
  const [modal, setModal] = useState();
  const pathParams: PathParticipantsType = pathParticipantsSchema.parse({
    ...fetchParams,
    path,
  });

  const { hiddenColumns, page, pageSize } = pathParams;
  const filterValues: FilterParticipantsType =
    filterParticipantsSchema.parse(pathParams);

  const viewParticipant = (participantId: string) => {
    startTransition(() => {});
  };

  const changePage = (pageInt: number) => {
    startTransition(() => {
      filterParticipants({
        ...pathParams,
        page: pageInt.toString(),
      });
    });
  };

  const changePageSize = (newPageSize: string) => {
    startTransition(() => {
      filterParticipants({
        ...pathParams,
        page: '1',
        pageSize: newPageSize,
      });
    });
  };

  const updateViews = (hideColumns?: string) => {
    startTransition(() => {
      filterParticipants({
        ...pathParams,
        hiddenColumns: hideColumns,
      });
    });
  };

  const clearFilters = () => {
    startTransition(() => {
      filterParticipants({
        path,
        page: '1',
        pageSize,
      });
    });
  };

  const onSubmit: SubmitHandler<FilterParticipantsType> = (values) => {
    startTransition(() => {
      filterParticipants({
        ...pathParams,
        ...values,
      });
    });
  };

  const hiddenColumnsArray = useMemo(
    () => (hiddenColumns ? hiddenColumns.split(',') : []),
    [hiddenColumns],
  );

  const { visibleColumns, allColumnIds } =
    handleTableColumns<SingleParticipantDetail>({
      hiddenColumnsArray,
      columns: [
        tableSelectColumn<SingleParticipantDetail>(isPending),
        participantColumnUser,
        participantColumnEmail,
        participantColumnNationalId,
        participantColumnRole,
        participantColumnOrganization,
        participantColumnApplication,
      ],
    });

  const table = useReactTable({
    data: participants,
    columns: visibleColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className={cn('flex flex-col space-y-4', className)} {...props}>
      <ParticipantsFilterForm
        isPending={isPending}
        clearFilters={clearFilters}
        customSubmit={onSubmit}
        filterValues={filterValues}
        filterForm={filterParticipantsFields(isPending)}
      />
      <div className="space-y-2 pb-4">
        <TableViews
          columnIds={allColumnIds}
          hiddenColumnArray={hiddenColumnsArray}
          isPending={isPending}
          updateViews={updateViews}
        />
        <ReusableTable table={table} />
      </div>
      <TablesPagination
        changePage={changePage}
        changePageSize={changePageSize}
        isPending={isPending}
        pagination={{ page, pageSize }}
        count={count}
      />
    </div>
  );
};

export default ParticipantsTable;
