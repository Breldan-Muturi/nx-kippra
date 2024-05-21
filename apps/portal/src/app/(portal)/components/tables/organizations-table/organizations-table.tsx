'use client';
import {
  ValidateInvite,
  validateInvite,
} from '@/actions/invites/validate.invites.actions';
import {
  FetchOrganizationsTable,
  SingleOrganizationDetail,
  filterOrganizations,
} from '@/actions/organization/filter.organization.actions';
import {
  RemoveOrgData,
  removeOrganizationPopup,
} from '@/actions/organization/remove.organization.actions';
import { OrganizationSearchParams } from '@/app/(portal)/(tables)/organizations/page';
import handleTableColumns from '@/components/table/handle-table-columns';
import ReusableTable from '@/components/table/reusable-table';
import TablesPagination from '@/components/table/table-pagination';
import tableSelectColumn from '@/components/table/table-select-column';
import TableViews from '@/components/table/table-views';
import {
  FilterOrganizationsType,
  OrganizationPathSchema,
  filterOrganizationsSchema,
  organizationPathSchema,
} from '@/validation/organization/organization.validation';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import organizationColumnActions from './columns/organization-column-actions';
import organizationColumnApplications from './columns/organization-column-applications';
import organizationColumnInfo from './columns/organization-column-info';
import organizationColumnInvites from './columns/organization-column-invites';
import organizationColumnOwner from './columns/organization-column-owner';
import organizationColumnParticipants from './columns/organization-column-participants';
import organizationColumnRole from './columns/organization-column-role';
import organizationColumnUsers from './columns/organization-column-users';
import organizationFilterFields from './filter/organizations-filter-fields';
import OrganizationFilterForm from './filter/organizations-filter-form';
import DeleteOrgModal, {
  DeleteOrgProps,
} from './modals/organization-modal-delete';
import InviteOrgModal from './modals/organization-modal-invite';
import RemoveOrgModal from './modals/organization-modal-remove';

type OrganizationTableProps = {
  orgInvite?: ValidateInvite;
  searchParams: OrganizationSearchParams;
  organizationTable: FetchOrganizationsTable;
};

const OrganizationsTable = ({
  orgInvite,
  searchParams: { token, ...fetchParams },
  organizationTable: { count, organizations, existingUser },
}: OrganizationTableProps) => {
  console.log('token: ', token);
  const path = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [action, setAction] = useState<
    RemoveOrgData | DeleteOrgProps | ValidateInvite | undefined
  >(orgInvite);

  const pathParams: OrganizationPathSchema = organizationPathSchema.parse({
    ...fetchParams,
    path,
  });
  const { hiddenColumns, page, pageSize } = pathParams;
  const filterValues: FilterOrganizationsType =
    filterOrganizationsSchema.parse(pathParams);

  const changePage = (pageInt: number) => {
    startTransition(() => {
      filterOrganizations({
        ...pathParams,
        page: pageInt.toString(),
      });
    });
  };

  const changePageSize = (newPageSize: string) => {
    startTransition(() => {
      filterOrganizations({
        ...pathParams,
        page: '1',
        pageSize: newPageSize,
      });
    });
  };

  const updateViews = (hideColumns?: string) => {
    startTransition(() => {
      filterOrganizations({
        ...pathParams,
        hiddenColumns: hideColumns,
      });
    });
  };

  const clearFilters = () => {
    startTransition(() => {
      filterOrganizations({
        path,
        page: '1',
        pageSize,
      });
    });
  };

  const onSubmit: SubmitHandler<FilterOrganizationsType> = (values) => {
    startTransition(() => {
      filterOrganizations({
        ...pathParams,
        ...values,
      });
    });
  };

  const hiddenColumnsArray = useMemo(
    () => (hiddenColumns ? hiddenColumns.split(',') : []),
    [hiddenColumns],
  );

  const handleRemove = (orgId: string) =>
    startTransition(() => {
      removeOrganizationPopup(orgId).then((data) => {
        if ('error' in data) {
          toast.error(data.error);
        } else if (data.deleteOrg) {
          setAction((prev) => ({ id: data.orgId, triggeredByRemove: true }));
        } else {
          setAction((prev) => data);
        }
      });
    });
  const removeModal = !!action && 'orgId' in action;

  const handleDelete = (orgId: string) => setAction((prev) => ({ id: orgId }));
  const deleteModal = !!action && 'id' in action;

  const handleInvite = (inviteToken: string) =>
    startTransition(() => {
      validateInvite(inviteToken).then((data) => setAction((prev) => data));
    });

  useEffect(() => {
    if (token) handleInvite(token);
  }, [token]);

  const inviteModal =
    !!action &&
    ('error' in action || 'invalid' in action || 'invite' in action);

  const handleView = (orgId: string) => router.push(`/organization/${orgId}`);

  const { visibleColumns, allColumnIds } =
    handleTableColumns<SingleOrganizationDetail>({
      hiddenColumnsArray,
      columns: [
        tableSelectColumn<SingleOrganizationDetail>(isPending),
        organizationColumnInfo,
        organizationColumnActions({
          existingUser,
          isPending,
          handleView,
          handleDelete,
          handleRemove,
          handleInvite,
        }),
        organizationColumnRole({
          userId: existingUser.id,
          email: existingUser.email,
        }),
        organizationColumnOwner,
        organizationColumnUsers,
        organizationColumnInvites,
        organizationColumnApplications,
        organizationColumnParticipants,
      ],
    });

  const table = useReactTable({
    data: organizations,
    columns: visibleColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleDismiss = () => setAction((prev) => undefined);

  return (
    <>
      <div className="flex flex-col space-y-4">
        <OrganizationFilterForm
          isPending={isPending}
          clearFilters={clearFilters}
          customSubmit={onSubmit}
          filterValues={filterValues}
          filterForm={organizationFilterFields(isPending)}
        />
        <div className="pb-4 space-y-2">
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
      {deleteModal && (
        <DeleteOrgModal
          open={deleteModal}
          handleDismiss={handleDismiss}
          {...action}
        />
      )}
      {removeModal && (
        <RemoveOrgModal
          open={removeModal}
          handleDismiss={handleDismiss}
          {...action}
        />
      )}

      {inviteModal && (
        <InviteOrgModal
          open={inviteModal}
          handleDismiss={handleDismiss}
          orgInvite={action}
        />
      )}
    </>
  );
};

export default OrganizationsTable;
