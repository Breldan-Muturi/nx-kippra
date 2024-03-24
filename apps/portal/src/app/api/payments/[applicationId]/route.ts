import { uploadPDFile } from '@/actions/firebase/storage.actions';
import { generatePDFFromApi } from '@/actions/pdf/generate-pdf-api.actions';
import { db } from '@/lib/db';
import { paymentCompletedEmail } from '@/mail/application.mail';
import { ipnSchema } from '@/validation/payment.validation';
import { ApplicationStatus } from '@prisma/client';
import { NextResponse } from 'next/server';

type Props = {
  params: {
    applicationId: string;
  };
};

export async function POST(req: Request, { params: { applicationId } }: Props) {
  try {
    const paymentDetails = await req.json();
    console.log(
      `[${new Date().toISOString()}]/api/payments/: `,
      paymentDetails,
    );
    const validPayment = ipnSchema.safeParse(paymentDetails);
    if (!validPayment.success) {
      return NextResponse.json({
        message: 'The payment information is not valid',
      });
    }
    const existingApplication = await db.application.findUnique({
      where: { id: applicationId },
      select: {
        id: true,
        payment: { select: { id: true } },
        trainingSession: {
          select: {
            startDate: true,
            endDate: true,
            program: { select: { title: true } },
          },
        },
        owner: { select: { email: true } },
        applicationFee: true,
      },
    });

    if (!existingApplication || !existingApplication.id) {
      return new Response(`Application id ${applicationId} not found`, {
        status: 400,
        statusText: `Application id ${applicationId} not found`,
      });
    }
    if (!existingApplication.payment?.id) {
      return NextResponse.json({
        error: 'There is no payment associated with this application',
      });
    }
    const applicationReceipt = await generatePDFFromApi({
      applicationId: existingApplication.id,
      template: 'receipt',
    });
    if ('error' in applicationReceipt) {
      return new Response('Server error', {
        status: 500,
        statusText: 'Error generating PDF receipt',
      });
    }
    const uploadedReceipt = await uploadPDFile(
      applicationReceipt.generatedPDF,
      `${existingApplication.id}-receipt`,
    );

    if (uploadedReceipt.error) {
      return new Response('Server error', {
        status: 500,
        statusText: 'Receipt not saved successfully',
      });
    }

    const paymentUpdated = await db.payment.update({
      where: { id: existingApplication.payment.id },
      data: {
        receipt_url: uploadedReceipt.success,
        ...validPayment.data,
      },
    });

    if (!paymentUpdated.receipt_url || !paymentUpdated.amount_paid) {
      return new Response('Server error', {
        status: 500,
        statusText: 'Could not retrieve payment details',
      });
    }

    await paymentCompletedEmail({
      applicantEmail: existingApplication.owner.email,
      endDate: existingApplication.trainingSession.endDate,
      startDate: existingApplication.trainingSession.startDate,
      title: existingApplication.trainingSession.program.title,
      paymentReceipt: {
        filename: `${existingApplication.id}-receipt`,
        path: paymentUpdated.receipt_url,
      },
    });

    if (
      parseFloat(paymentUpdated.amount_paid) >=
      existingApplication.applicationFee
    ) {
      await db.application.update({
        where: { id: existingApplication.id },
        data: {
          status: ApplicationStatus.COMPLETED,
        },
      });
      return new Response('Success', {
        status: 200,
        statusText: 'Application fee paid in full',
      });
    }

    return new Response('Success', {
      status: 200,
      statusText: 'Payment information saved successfully',
    });
  } catch (error) {
    console.error('Error processing payment details: ', error);
    return new Response(`Not found`, {
      status: 404,
      statusText: `Application id ${applicationId} not found`,
    });
  }
}
