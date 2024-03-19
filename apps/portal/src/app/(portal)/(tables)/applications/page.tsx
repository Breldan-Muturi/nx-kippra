import {
  DefaultApplicationParams,
  FilterAdminApplicationType,
  FilterUserApplicationType,
} from "@/validation/application.validation";
import React from "react";
import ApplicationsTable from "../components/table/applications-table";
import {
  PaginationType,
  paginationSchema as zodPaginationSchema,
} from "@/validation/pagination.validation";
import ApproveApplication from "../components/modals/approve-application";
import RejectApplication from "../components/modals/reject-application";
import SendEmail from "../components/modals/send-email";
import { filterApplicationsTable } from "@/actions/applications/filter.applications.actions";
import DeleteApplication from "../components/modals/delete-application";
import { currentUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { getApplicationByIdPromise } from "@/actions/applications/user/single.application.action";
import PayApplication from "../components/modals/pay-application";
import { getPaymentApplicationPromise } from "@/actions/applications/user/pay.application.actions";
import RemoveApplication from "../components/modals/remove-me-application";
import ApplicationSheet from "../components/sheet/application-sheet";

const page = async ({
  searchParams: {
    page,
    pageSize,
    viewApplication,
    approveApplication,
    rejectApplication,
    sendEmail,
    deleteApplication,
    removeApplication,
    payApplication,
    ...filterParams
  },
}: {
  // Add better type conditions with FilterAdminApplicationType | FilterUserApplicationType
  // And then destructure the params based on the type of user.
  searchParams: FilterAdminApplicationType & FilterUserApplicationType;
}) => {
  const user = await currentUser();
  if (!user || !user.id) return null;
  const isAdmin = user?.role === UserRole.ADMIN;
  const defaultPages: PaginationType = { page: "1", pageSize: "10" };

  let pagePagination: PaginationType = defaultPages;

  const validPages = zodPaginationSchema.safeParse({ page, pageSize });

  if (!validPages.success) {
    pagePagination = defaultPages;
  } else {
    pagePagination = validPages.data;
  }

  const defaultParams: DefaultApplicationParams = {
    page: pagePagination.page,
    pageSize: pagePagination.pageSize,
    ...filterParams,
  };

  // Handle the promises concurrently
  const [applicationsTableResult, singleApplicationResult, paymentInfoResult] =
    await Promise.allSettled([
      filterApplicationsTable(defaultParams),
      viewApplication
        ? getApplicationByIdPromise({ id: viewApplication, userId: user.id })
        : Promise.resolve(null),
      payApplication
        ? getPaymentApplicationPromise({ id: payApplication, userId: user.id })
        : Promise.resolve(null),
    ]);

  const applicationsTable =
    applicationsTableResult.status === "fulfilled"
      ? applicationsTableResult.value
      : null;
  const singleApplication =
    singleApplicationResult.status === "fulfilled"
      ? singleApplicationResult.value
      : null;
  const paymentInfo =
    paymentInfoResult.status === "fulfilled" ? paymentInfoResult.value : null;

  if (!applicationsTable) return null;
  return (
    <>
      <ApplicationsTable {...applicationsTable} />
      {viewApplication && singleApplication && (
        <ApplicationSheet
          viewParams={defaultParams}
          isAdmin={isAdmin}
          application={singleApplication}
        />
      )}
      {approveApplication && isAdmin && (
        <ApproveApplication
          approveParams={{ ...defaultParams, approveApplication }}
        />
      )}
      {rejectApplication && isAdmin && (
        <RejectApplication
          rejectParams={{ ...defaultParams, rejectApplication }}
        />
      )}
      {sendEmail && <SendEmail emailParams={{ ...defaultParams, sendEmail }} />}
      {deleteApplication && (
        <DeleteApplication
          deleteParams={{ ...defaultParams, deleteApplication }}
        />
      )}
      {removeApplication && (
        <RemoveApplication
          removeParams={{ ...defaultParams, removeApplication }}
        />
      )}
      {payApplication && paymentInfo && (
        <PayApplication paymentInfo={paymentInfo} payParams={defaultParams} />
      )}
    </>
  );
};

export default page;
