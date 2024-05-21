'use server';
import {
  FilesUploadReturn,
  pdfsUpload,
} from '@/actions/firebase/storage.actions';
import {
  PDFResponse,
  generatePDFFromApi,
} from '@/actions/pdf/generate-pdf-api.actions';
import { currentUser } from '@/lib/auth';
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

  let pdfProforma: PDFResponse, pdfOffer: PDFResponse;
  try {
    [pdfProforma, pdfOffer] = await Promise.all([
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
  if ('error' in pdfProforma) {
    console.error('Error generating proforma: ', pdfProforma.error);
    return {
      error:
        'Failed to generate proforma due to a server error. Please try again later',
    };
  }
  if ('error' in pdfOffer) {
    return {
      error:
        'Failed to generate offer letter due to a server error. Please try again later',
    };
  }

  let pdfUploads: FilesUploadReturn;
  try {
    pdfUploads = await pdfsUpload(
      [
        {
          buffer: pdfProforma.generatedPDF,
          fileName: 'proforma-invoice',
        },
        {
          buffer: pdfOffer.generatedPDF,
          fileName: 'offer-letter',
        },
      ],
      `applications/${existingApplication.id}`,
    );
  } catch (e) {
    console.error('Failed to save pdfs due to a server error: ', e);
    return {
      error:
        'Failed to save pdfs due to a server error. Please try again later',
    };
  }

  if ('error' in pdfUploads) return { error: pdfUploads.error };

  const proforma = pdfUploads.find(({ filePath }) =>
    filePath.endsWith('proforma-invoice'),
  );
  const offer = pdfUploads.find(({ filePath }) =>
    filePath.endsWith('offer-letter'),
  );

  if (!proforma || !offer)
    return {
      error:
        'Failed to generate PDFs for this application due to server error. Please try again later',
    };
  // Update Application Status, Proforma-Invoice, and Offer Letter
  try {
    // Use a transaction to create the documents and update the application
    await db.application.update({
      where: { id: existingApplication.id },
      data: {
        status: ApplicationStatus.APPROVED,
        proformaInvoice: { create: proforma! },
        offerLetter: { create: offer! },
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
        filename: `Proforma invoice`,
        path: proforma?.filePath!,
      },
      offerLetter: {
        filename: `Offer letter`,
        path: offer?.filePath!,
      },
    });
    return { success: 'Application approved successfully' };
  } catch (error) {
    console.log(error);
    return { error: 'There was an error sending the notification email' };
  }
};
