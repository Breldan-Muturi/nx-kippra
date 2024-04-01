'use server';
import { currentRole } from '@/lib/auth';
import { ApplicationStatus, Prisma, UserRole } from '@prisma/client';
import { uploadPDFile } from '@/actions/firebase/storage.actions';
import { ActionReturnType } from '@/types/actions.types';
import { db } from '@/lib/db';
import { approvedApplicationEmail } from '@/mail/application.mail';
import { generatePDFFromApi } from '@/actions/pdf/generate-pdf-api.actions';

export const adminApproveApplication = async (
  applicationId: string,
): Promise<ActionReturnType> => {
  // Only admins can approve applications, confirm that here.
  const role = await currentRole();
  if (role !== UserRole.ADMIN)
    return { error: 'You are not permited to approve applications' };

  // Fetch the application, selecting the information needed to process this approval
  const existingApplication = await db.application.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      status: true,
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

  // Begin Defining the proforma and offer to be saved in the DB
  let proformaInvoice: Prisma.ApplicationProformaInvoiceCreateInput = {
    application: { connect: { id: existingApplication.id } },
    fileName: `${applicationId}-proforma-invoice`,
    filePath: '',
  };
  let offerLetter: Prisma.ApplicationOfferLetterCreateInput = {
    application: { connect: { id: existingApplication.id } },
    fileName: `${applicationId}-offer`,
    filePath: '',
  };

  // Initialte PDF Generation without waiting here
  const pdfProforma = generatePDFFromApi({
    applicationId: existingApplication.id,
    template: 'pro-forma-invoice',
  });
  const pdfOffer = generatePDFFromApi({
    applicationId: existingApplication.id,
    template: 'offer-letter',
  });

  // Wait for both promises to resolve
  const results = await Promise.allSettled([pdfProforma, pdfOffer]);

  const errors: string[] = [];
  const uploads: Promise<ActionReturnType>[] = [];

  // Handling the results with forEach
  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      const { success } = result.value;
      if (success) {
        const fileName =
          i === 0 ? proformaInvoice.fileName : offerLetter.fileName;
        uploads.push(uploadPDFile(result.value.generatedPDF, fileName));
      } else {
        errors.push(result.value.error);
      }
    } else if (result.status === 'rejected') {
      errors.push('An error occurred during PDF generation');
    }
  });

  // Return any errors from the PDF Generation Process
  if (errors.length > 0) {
    return { error: errors.join(' ') };
  }

  // Wait for all upload operations to finish
  const uploadResults = await Promise.allSettled(uploads);

  // Define the urls to pass to the application when the upload operations succeed
  // Otherwise return an error
  uploadResults.forEach((uploadResult, i) => {
    if (uploadResult.status === 'rejected') {
      errors.push(
        uploadResult.reason || 'An error occurred during file upload',
      );
    } else if (uploadResult.status === 'fulfilled') {
      const { error, success } = uploadResult.value;
      if (error) {
        errors.push(error);
      } else if (success) {
        if (i === 0) {
          proformaInvoice.filePath = success;
        } else if (i === 1) {
          offerLetter.filePath = success;
        }
      }
    }
  });

  // Return any errors from the PDF Upload process
  if (errors.length > 0) {
    return { error: errors.join(' ') };
  }

  // Update Application Status, Proforma-Invoice, and Offer Letter
  try {
    // Use a transaction to create the documents and update the application
    await db.$transaction(
      async (prisma) => {
        // Create the offer and proforma concurrently
        const [proforma, offer] = await Promise.all([
          prisma.applicationProformaInvoice.create({ data: proformaInvoice }),
          prisma.applicationOfferLetter.create({ data: offerLetter }),
        ]);

        await prisma.application.update({
          where: { id: existingApplication.id },
          data: {
            status: ApplicationStatus.APPROVED,
            proformaInvoice: { connect: { id: proforma.id } },
            offerLetter: { connect: { id: offer.id } },
          },
        });
      },
      { maxWait: 20000, timeout: 200000 },
    );
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
      proformaInvoice: {
        filename: proformaInvoice.fileName,
        path: proformaInvoice.filePath,
      },
      offerLetter: {
        filename: offerLetter.fileName,
        path: offerLetter.filePath,
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
