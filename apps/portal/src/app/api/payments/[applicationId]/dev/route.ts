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
  console.log('Mapping applicationId: ', applicationId);
  try {
    const paymentDetails = await req.json();
    const validPayment = ipnSchema.safeParse(paymentDetails);
    if (!validPayment.success) {
      return NextResponse.json({
        message: 'The payment information is not valid',
      });
    }

    console.log('Fetching application');
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

    if (
      !existingApplication ||
      !existingApplication.id ||
      !existingApplication.applicationFee
    ) {
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

    console.log('Amount paid: ', validPayment.data.amount_paid);
    console.log('Invoice amount: ', validPayment.data.invoice_amount);
    console.log('Last payment amount: ', validPayment.data.last_payment_amount);
    console.log(
      `Application for ${existingApplication.trainingSession.program.title} fetched, updating payment info...`,
    );

    // Updating payment info for development
    const feeAsString = (existingApplication.applicationFee + 50).toString();
    validPayment.data = {
      ...validPayment.data,
      amount_paid: feeAsString,
      invoice_amount: feeAsString,
      last_payment_amount: feeAsString,
    };

    console.log('Amount paid: ', validPayment.data.amount_paid);
    console.log('Invoice amount: ', validPayment.data.invoice_amount);
    console.log('Last payment amount: ', validPayment.data.last_payment_amount);
    console.log(
      `Application information updated, generating application receipt...`,
    );

    // Generating application receipt
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

    console.log(
      `Application receipt generated and saved. Link: ${uploadedReceipt.success}, sending payment confirmation email ...`,
    );
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
    console.log('Payment confirmation email sent');

    if (
      parseFloat(paymentUpdated.amount_paid) >=
      existingApplication.applicationFee
    ) {
      console.log('Updating application ...');
      await db.application.update({
        where: { id: existingApplication.id },
        data: {
          status: ApplicationStatus.COMPLETED,
        },
      });
      console.log('Application updated to completed');
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
