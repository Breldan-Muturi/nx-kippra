'use client';

import {
  ApplicationApproval,
  fetchApprovalApplication,
} from '@/actions/applications/admin/fetch-approval.applications.actions';
import {
  PayeeApplicationModal,
  getPaymentApplicationPromise,
} from '@/actions/applications/pay.application.actions';
import {
  ViewApplicationSheet,
  getApplicationByIdPromise,
} from '@/actions/applications/single.application.action';
import { useCurrentUser } from '@/hooks/use-current-user';
import { UserRole } from '@prisma/client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';
import { toast } from 'sonner';

export type ApplicationViewSheet = {
  data: ViewApplicationSheet;
  nextId?: string;
  prevId?: string;
};

const useApplicationModals = ({
  applicationIds,
  selectedApplicationId,
}: {
  applicationIds: string[];
  selectedApplicationId?: string;
}) => {
  const user = useCurrentUser();
  const router = useRouter();
  const path = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [modal, setModal] = useState<
    | undefined
    | { type: 'view'; application: ApplicationViewSheet }
    | { type: 'pay'; data: PayeeApplicationModal }
    | { type: 'approve'; data: ApplicationApproval }
    | { type: 'email'; id: string }
    | { type: 'reject'; id: string }
    | { type: 'remove'; id: string }
    | { type: 'delete'; id: string }
  >();

  if (!user) {
    router.push(`/accounts`);
  }

  const dismissModal = useCallback(() => {
    setModal(undefined);
    if (selectedApplicationId) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('applicationId');
      const updatedParams = params.toString();
      const newParams = updatedParams ? `${path}?${updatedParams}` : path;
      router.push(newParams);
    } else {
      router.refresh();
    }
  }, [router, selectedApplicationId]);

  const viewApplication = useCallback(
    (applicationId: string) => {
      if (!user) {
        toast.error('Only logged in users can view applications');
      } else {
        startTransition(() => {
          getApplicationByIdPromise(applicationId).then((data) => {
            if ('error' in data) {
              toast.error(data.error);
            } else {
              const appIndex = applicationIds.findIndex(
                (id) => id === applicationId,
              );
              const nextId = applicationIds[appIndex + 1];
              const prevId = applicationIds[appIndex - 1];
              setModal({ type: 'view', application: { data, nextId, prevId } });
            }
          });
        });
      }
    },
    [applicationIds],
  );
  const viewData =
    !!modal && modal.type === 'view' && typeof modal.application === 'object'
      ? modal.application
      : undefined;

  const approveApplication = useCallback(
    (applicationId: string) => {
      if (user?.role !== UserRole.ADMIN) {
        toast.error('Only admins are allowed to approve applications');
      } else {
        startTransition(() => {
          fetchApprovalApplication(applicationId).then((data) => {
            if ('error' in data) {
              toast.error(data.error);
            } else {
              setModal({ type: 'approve', data });
            }
          });
        });
      }
    },
    [user?.role],
  );
  const approveData =
    !!modal && modal.type === 'approve' && 'id' in modal.data
      ? modal.data
      : undefined;

  const rejectApplication = useCallback((applicationId: string) => {
    if (user?.role !== UserRole.ADMIN) {
      toast.error('Only admins can reject applications.');
    } else {
      setModal({ type: 'reject', id: applicationId });
    }
  }, []);
  const rejectId =
    !!modal && modal.type === 'reject' && 'id' in modal ? modal.id : undefined;

  const sendEmail = useCallback((applicationId: string) => {
    if (!user) {
      toast.error('Only logged in users can view applications');
    } else {
      setModal({ type: 'email', id: applicationId });
    }
  }, []);
  const emailId =
    !!modal && modal.type === 'email' && 'id' in modal ? modal.id : undefined;

  const payApplication = useCallback((applicationId: string) => {
    if (!user) {
      toast.error('Only logged in users can view applications');
    } else {
      startTransition(() => {
        getPaymentApplicationPromise(applicationId).then((data) => {
          if ('error' in data) {
            toast.error(data.error);
          } else {
            setModal({ type: 'pay', data });
          }
        });
      });
    }
  }, []);
  const payData =
    !!modal && modal.type === 'pay' && 'paymentDetails' in modal.data
      ? modal.data
      : undefined;

  const removeApplication = useCallback((applicationId: string) => {
    if (!user) {
      toast.error('Only logged in users can view applications');
    } else {
      setModal({ type: 'remove', id: applicationId });
    }
  }, []);
  const removeId =
    !!modal && modal.type === 'remove' && 'id' in modal ? modal.id : undefined;

  const deleteApplication = useCallback((applicationId: string) => {
    if (!user) {
      toast.error('Only logged in users can view applications');
    } else {
      setModal({ type: 'delete', id: applicationId });
    }
  }, []);
  const deleteId =
    !!modal && modal.type === 'delete' && 'id' in modal ? modal.id : undefined;

  return {
    isPending,
    startTransition,
    path,
    user: user!,
    viewApplication,
    viewData,
    approveApplication,
    approveData,
    rejectApplication,
    rejectId,
    sendEmail,
    emailId,
    payApplication,
    payData,
    removeApplication,
    removeId,
    deleteApplication,
    deleteId,
    dismissModal,
  };
};

export default useApplicationModals;
