import { uploadPDFile } from '@/actions/firebase/storage.actions';
import { generatePDFFromApi } from '@/actions/pdf/generate-pdf-api.actions';
import { processDateString, stringToDecimal } from '@/helpers/payment.helpers';
import { db } from '@/lib/db';
import { paymentCompletedEmail } from '@/mail/application.mail';
import {
  ipnReferenceArraySchema,
  ipnSchema,
  paymentApiResponseSchema,
} from '@/validation/payment/payment.validation';
import {
  ApplicationStatus,
  InvoiceStatus,
  PaymentReceipt,
} from '@prisma/client';
import { ApplicationPromise, applicationPromise } from '../promises';

type Props = {
  params: {
    applicationId: string;
  };
};

export async function POST(req: Request, { params: { applicationId } }: Props) {
  console.log('Mapping applicationId: ', applicationId);
  const paymentDetails = await req.json();
  console.log('Payment details: ', paymentDetails);

  const validApiResponse = paymentApiResponseSchema.safeParse(paymentDetails);
  if (!validApiResponse.success) {
    console.error('Api response validation error: ', validApiResponse.error);
    return new Response('Api response validation error', {
      status: 500,
      statusText: 'Api response did not pass payment details validation',
    });
  }

  const {
    payment_reference: apiPaymentReference,
    payment_date,
    amount_paid,
    invoice_amount,
    last_payment_amount,
    ...paymentApiInfo
  } = validApiResponse.data;

  // Process payment info
  const paymentInfo = {
    ...paymentApiInfo,
    amount_paid: stringToDecimal(amount_paid),
    invoice_amount: stringToDecimal(invoice_amount),
    last_payment_amount: stringToDecimal(last_payment_amount),
    payment_date: processDateString(payment_date),
  };
  console.log('Processed payment info: ', paymentInfo);
  const validPayment = ipnSchema.safeParse(paymentInfo);

  if (!validPayment.success) {
    console.error('Invalid payment info: ', validPayment.error);
    return new Response('Invalid payment info', {
      status: 500,
      statusText: 'Payment info did not pass payment details validation',
    });
  }

  // Process payment references
  const payment_reference = apiPaymentReference.map((reference) => {
    return {
      ...reference,
      amount: stringToDecimal(reference.amount),
      payment_date: new Date(reference.payment_date),
      inserted_at: new Date(reference.inserted_at),
    };
  });
  console.log('Processed payment reference: ', payment_reference);

  const validPaymentReference =
    ipnReferenceArraySchema.safeParse(payment_reference);
  if (!validPaymentReference.success) {
    console.error('Invalid payment reference: ', validPaymentReference.error);
    return new Response('Invalid payment reference', {
      status: 500,
      statusText: 'Payment reference did not pass schema validation',
    });
  }

  let existingApplication: ApplicationPromise | undefined = undefined;
  try {
    console.log('Fetching application');
    existingApplication = await applicationPromise({
      id: applicationId,
      invoiceNumber: validPayment.data.invoice_number,
    });
    console.log(
      'Application info: ',
      JSON.stringify(existingApplication, null, 2),
    );
  } catch (e) {
    console.error('Failed to fetch application details: ', e);
  }

  if (
    !existingApplication ||
    !existingApplication.id ||
    !existingApplication.applicationFee
  ) {
    console.error('There was an issue fetching the application details');
    return new Response('Missing application details', {
      status: 404,
      statusText: 'Missing application details',
    });
  }

  const relevantInvoice = existingApplication?.invoice[0];
  if (!relevantInvoice || !relevantInvoice.invoiceNumber) {
    console.error('This invoice could not be found');
    return new Response('Missing invoice details', {
      status: 404,
      statusText: 'Missing invoice details',
    });
  }

  console.log('Amount paid: ', validPayment.data.amount_paid);
  console.log('Invoice amount: ', validPayment.data.invoice_amount);
  console.log('Last payment amount: ', validPayment.data.last_payment_amount);
  console.log(
    `Application for ${existingApplication.trainingSession.program.title} fetched, updating payment info...`,
  );

  // Updating payment info for development
  const feePaid = parseFloat(
    (existingApplication.applicationFee + 50).toFixed(2),
  );
  validPayment.data = {
    ...validPayment.data,
    amount_paid: feePaid,
    invoice_amount: feePaid,
    last_payment_amount: feePaid,
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
    console.error('There was an error in generating the application receipt');
    return new Response('Application receipt error', {
      status: 500,
      statusText: 'There was an error generating the application receipt',
    });
  }

  // Save the application receipt
  const uploadedReceipt = await uploadPDFile(
    applicationReceipt.generatedPDF,
    `${existingApplication.id}-receipt`,
  );

  if (uploadedReceipt.error || !uploadedReceipt.success) {
    console.error(
      'There was an error in saving the application receipt to the database',
    );
    return new Response('Application receipt error', {
      status: 500,
      statusText: 'There was an error saving the application receipt',
    });
  }

  console.log(
    `Application receipt generated and saved. Link: ${uploadedReceipt.success}, sending payment confirmation email ...`,
  );

  let receipt: PaymentReceipt | undefined = undefined;
  try {
    receipt = await db.$transaction(
      async (prisma) => {
        const newPayment = await prisma.payment.create({
          data: {
            application: { connect: { id: existingApplication!.id } },
            ...validPayment.data,
          },
        });
        const updateApplication =
          newPayment.amount_paid >= existingApplication!.applicationFee!;
        const [_, __, createdReceipt] = await Promise.all([
          prisma.invoice.update({
            where: { id: relevantInvoice.id },
            data: { invoiceStatus: InvoiceStatus.SETTLED },
          }),
          prisma.paymentReference.createMany({
            data: validPaymentReference.data.map((reference) => ({
              paymentId: newPayment.id,
              ...reference,
            })),
          }),
          prisma.paymentReceipt.create({
            data: {
              payment: { connect: { id: newPayment.id } },
              fileName: `${existingApplication!.id}-receipt-${existingApplication!.payment.length + 1}`,
              filePath: uploadedReceipt.success!,
            },
          }),
          updateApplication
            ? prisma.application.update({
                where: { id: existingApplication!.id },
                data: {
                  status: ApplicationStatus.COMPLETED,
                },
              })
            : Promise.resolve(undefined),
        ]);

        return createdReceipt;
      },
      {
        maxWait: 20000,
        timeout: 20000,
      },
    );
  } catch (e) {
    console.error(
      'Failed to update payment and application due to a server error: ',
      e,
    );
    return new Response('Application update error', {
      status: 500,
      statusText: 'There was an error updating the application and payment',
    });
  }

  if (!receipt) {
    console.error('Failed to store application receipt due to a server error');
    return new Response('Failed to store application receipt', {
      status: 500,
      statusText: 'Failed to store application receipt',
    });
  }

  try {
    await paymentCompletedEmail({
      applicantEmail: existingApplication!.owner.email,
      endDate: existingApplication!.trainingSession.endDate,
      startDate: existingApplication!.trainingSession.startDate,
      title: existingApplication!.trainingSession.program.title,
      paymentReceipt: {
        filename: receipt.fileName,
        path: receipt.filePath,
      },
    });
    console.log('Payment confirmation email sent');
    return new Response('Payment successful', {
      status: 200,
      statusText: 'Payment recorded successfully, payment incomplete',
    });
  } catch (error) {
    console.error('Error processing payment details: ', error);
    return new Response('Payment recording unsuccessful', {
      status: 500,
      statusText: `Error recording payment: ${error}`,
    });
  }
}
