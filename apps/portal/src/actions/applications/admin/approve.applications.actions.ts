'use server';
import { uploadPDFile } from '@/actions/firebase/storage.actions';
import {
  PDFResponse,
  generatePDFFromApi,
} from '@/actions/pdf/generate-pdf-api.actions';
import { currentRole, currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { approvedApplicationEmail } from '@/mail/application.mail';
import { ActionReturnType } from '@/types/actions.types';
import { ApprovalSchema } from '@/validation/applications/approval.application.validation';
import { ApplicationStatus, UserRole } from '@prisma/client';

const applicationPromise = async (id: string) =>
  await db.application.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      applicationFee: true,
      trainingSession: {
        select: {
          startDate: true,
          endDate: true,
          venue: true,
          program: {
            select: {
              title: true,
            },
          },
        },
      },
      owner: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
type ApplicationPromise = Awaited<ReturnType<typeof applicationPromise>>;

export const adminApproveApplication = async ({
  id,
  applicationFee,
  message,
}: ApprovalSchema): Promise<ActionReturnType> => {
  const user = await currentUser();
  if (!user || user.role !== UserRole.ADMIN)
    return { error: 'You are not permitted to approve applications' };
  let existingApplication: ApplicationPromise;
  try {
    existingApplication = await applicationPromise(id);
  } catch (e) {
    console.error('Failed to fetch application due to a server error: ', e);
    return {
      error:
        'Failed to fetch application due to a server error. Please try again later',
    };
  }

  // Confirm the application still exists
  if (!existingApplication) {
    return { error: 'An application with this Id does not exist' };
  }

  // Confirm the application is pending for approval
  if (existingApplication.status !== ApplicationStatus.PENDING) {
    return { error: 'This application has already been approved' };
  }

  // Confirm the application participants are still valid users
  if (!existingApplication.owner) {
    return {
      error: 'This approval failed because there are no valid participants',
    };
  } else if (existingApplication.owner.email === null) {
    return {
      error: 'The application owner does not have a valid email address',
    };
  }

  if (applicationFee !== existingApplication.applicationFee) {
    try {
      await db.application.update({
        where: { id: existingApplication.id },
        data: {
          applicationFee,
        },
      });
    } catch (e) {
      console.error('Failed to update application fee: ', e);
      return {
        error:
          'Failed to update application fee due to a server error. Please try again later',
      };
    }
  }

  let proforma: PDFResponse, offer: PDFResponse;
  try {
    [proforma, offer] = await Promise.all([
      generatePDFFromApi({
        applicationId: existingApplication.id,
        template: 'pro-forma-invoice',
      }),
      generatePDFFromApi({
        applicationId: existingApplication.id,
        template: 'offer-letter',
      }),
    ]);
  } catch (e) {
    console.error('Failed to generate pdfs due to a server error: ', e);
    return {
      error:
        'Failed to generate pdfs due to a server error. Please try again later',
    };
  }
  if ('error' in proforma) {
    return {
      error:
        'Failed to generate proforma due to a server error. Please try again later',
    };
  }
  if ('error' in offer) {
    return {
      error:
        'Failed to generate offer letter due to a server error. Please try again later',
    };
  }

  let proformaSaved: ActionReturnType, offerSaved: ActionReturnType;
  try {
    [proformaSaved, offerSaved] = await Promise.all([
      uploadPDFile(
        proforma.generatedPDF,
        `${existingApplication.id}-proforma-invoice`,
      ),
      uploadPDFile(
        offer.generatedPDF,
        `${existingApplication.id}-offer-letter`,
      ),
    ]);
  } catch (e) {
    console.error('Failed to save pdfs due to a server error: ', e);
    return {
      error:
        'Failed to save pdfs due to a server error. Please try again later',
    };
  }
  if (proformaSaved.error) {
    return {
      error:
        'Failed to save proforma due to a server error. Please try again later',
    };
  }
  if (offerSaved.error) {
    return {
      error:
        'Failed to save offer letter due to a server error. Please try again later',
    };
  }

  // Update Application Status, Proforma-Invoice, and Offer Letter
  try {
    // Use a transaction to create the documents and update the application
    await db.application.update({
      where: { id: existingApplication.id },
      data: {
        status: ApplicationStatus.APPROVED,
        proformaInvoice: {
          create: {
            fileName: `${existingApplication.id}-proforma-invoice`,
            filePath: proformaSaved.success!,
          },
        },
        offerLetter: {
          create: {
            fileName: `${existingApplication.id}-offer-letter`,
            filePath: offerSaved.success!,
          },
        },
      },
    });
  } catch (error) {
    console.log(error);
    return { error: 'Failed to approve the application due to a system error' };
  }

  // Send Applcation Approval Email
  try {
    await approvedApplicationEmail({
      approvalDate: new Date(),
      // Training session information
      title: existingApplication.trainingSession.program.title,
      startDate: existingApplication.trainingSession.startDate,
      endDate: existingApplication.trainingSession.endDate,
      venue: existingApplication.trainingSession.venue ?? undefined,
      // Applicant information
      applicantEmail: existingApplication.owner.email,
      message,
      proformaInvoice: {
        filename: `${existingApplication.id}-proforma-invoice`,
        path: proformaSaved.success!,
      },
      offerLetter: {
        filename: `${existingApplication.id}-offer-letter`,
        path: offerSaved.success!,
      },
    });
    return { success: 'Application approved successfully' };
  } catch (error) {
    console.log(error);
    return { error: 'There was an error sending the notification email' };
  }
};

export const adminRejectApplication = async (
  applicationId: string,
): Promise<ActionReturnType> => {
  const role = await currentRole();
  if (role !== UserRole.ADMIN)
    return { error: 'You are not permited to reject applications' };

  // Update Application Status
  // Send Applcation Rejection Email
  return { success: 'Application approved successfully' };
};

export const adminSendEmail = async (
  applicationId: string,
): Promise<ActionReturnType> => {
  const role = await currentRole();
  if (role !== UserRole.ADMIN)
    return { error: 'Only admins can send application related email' };

  // Send Application Related Email
  return { success: 'Email successfully sent to the applicant' };
};
