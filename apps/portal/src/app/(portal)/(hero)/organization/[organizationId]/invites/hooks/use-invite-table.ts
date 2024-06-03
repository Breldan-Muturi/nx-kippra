import { filterInvites } from '@/actions/invites/fetch.invites.actions';
import invitesResend from '@/actions/invites/resend.invites.actions';
import { revokeInvite } from '@/actions/invites/revoke.invites.actions';
import { sendInvite } from '@/actions/invites/send.invites.actions';
import { getOrganizationInvite } from '@/helpers/invites.helpers';
import {
  FilterInvitesSchema,
  pathInvitesSchema,
} from '@/validation/organization/organization.invites.validation';
import { usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';

const useInviteTable = ({
  organizationId,
  fetchParams,
}: {
  organizationId: string;
  fetchParams: FilterInvitesSchema;
}) => {
  const router = useRouter();
  const path = usePathname();
  const [isPending, startTransition] = useTransition();
  const pathParams = pathInvitesSchema.parse({
    ...fetchParams,
    path,
  });
  const { pageSize } = pathParams;

  const changePage = (pageInt: number) =>
    startTransition(() => {
      filterInvites({
        ...pathParams,
        page: pageInt.toString(),
      });
    });

  const changePageSize = (newPageSize: string) =>
    startTransition(() => {
      filterInvites({
        ...pathParams,
        page: '1',
        pageSize: newPageSize,
      });
    });

  const clearForm = () =>
    startTransition(() => {
      filterInvites({
        path,
        page: '1',
        pageSize,
      });
    });

  const onSubmit: SubmitHandler<FilterInvitesSchema> = (values) => {
    if (!!values.email)
      startTransition(() => {
        getOrganizationInvite({
          email: values.email as string,
          organizationId,
        }).then((data) => {
          if (!data || !data.id) {
            sendInvite({
              email: values.email as string,
              organizationId,
            })
              .then((data) => {
                if (data.error) {
                  toast.error(data.error);
                } else if (data.success) {
                  toast.success(data.success);
                }
              })
              .finally(() => {
                router.push(path);
              });
          } else {
            filterInvites({
              ...pathParams,
              email: values.email,
            });
          }
        });
      });
  };

  const resendInvites = (inviteIds: string[]) =>
    startTransition(() => {
      invitesResend({ organizationId, inviteIds })
        .then((data) => {
          if ('error' in data) toast.error(data.error);
          if ('success' in data) toast.success(data.success);
        })
        .finally(() => router.push(path));
    });

  const revokeInvites = (inviteIds: string[]) =>
    startTransition(() => {
      revokeInvite({ ids: inviteIds, organizationId })
        .then((data) => {
          if (data.error) {
            toast.error(data.error);
          } else if (data.success) {
            toast.success(data.success);
          }
        })
        .finally(() => router.push(path));
    });

  return {
    isPending,
    pathParams,
    changePage,
    changePageSize,
    clearForm,
    onSubmit,
    resendInvites,
    revokeInvites,
  };
};

export default useInviteTable;
