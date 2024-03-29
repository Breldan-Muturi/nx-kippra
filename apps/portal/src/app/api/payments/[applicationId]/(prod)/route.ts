import { uploadPDFile } from '@/actions/firebase/storage.actions';
import { generatePDFFromApi } from '@/actions/pdf/generate-pdf-api.actions';
import { processDateString, stringToDecimal } from '@/helpers/payment.helpers';
import { db } from '@/lib/db';
import { paymentCompletedEmail } from '@/mail/application.mail';
import {
  ipnReferenceArraySchema,
  ipnSchema,
  paymentApiResponseSchema,
} from '@/validation/payment.validation';
import { ApplicationStatus, InvoiceStatus, Prisma } from '@prisma/client';

type Props = {
  params: {
    applicationId: string;
  };
};

export async function POST(req: Request, { params: { applicationId } }: Props) {
  try {
    const paymentDetails = await req.json();
    const validApiResponse = paymentApiResponseSchema.safeParse(paymentDetails);
    if (!validApiResponse.success) {
      console.error('Api response validation error: ', validApiResponse.error);
      return;
    }
    const {
      payment_reference: apiPaymentReference,
      payment_date,
      ...paymentApiInfo
    } = validApiResponse.data;

    // Process payment info
    const paymentInfo = {
      ...paymentApiInfo,
      payment_date: processDateString(payment_date),
    };
    const validPayment = ipnSchema.safeParse(paymentInfo);
    if (!validPayment.success) {
      console.error('Invalid payment info: ', validPayment.error);
      return;
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
    const validPaymentReference =
      ipnReferenceArraySchema.safeParse(payment_reference);
    if (!validPaymentReference.success) {
      console.error('Invalid payment reference: ', validPaymentReference.error);
      return;
    }

    const existingApplication = await db.application.findUnique({
      where: { id: applicationId },
      select: {
        id: true,
        payment: { select: { id: true } },
        invoice: {
          where: { invoiceNumber: validPayment.data.invoice_number },
          select: { id: true, invoiceNumber: true },
        },
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
      console.error('There was an issue fetching the application details');
      return;
    }
    const relevantInvoice = existingApplication?.invoice[0];
    if (!relevantInvoice || !relevantInvoice.invoiceNumber) {
      console.error('This invoice could not be found');
      return;
    }

    // Generating application receipt
    const applicationReceipt = await generatePDFFromApi({
      applicationId: existingApplication.id,
      template: 'receipt',
    });

    if ('error' in applicationReceipt) {
      console.error('There was an error in generating the application receipt');
      return;
    }

    const uploadedReceipt = await uploadPDFile(
      applicationReceipt.generatedPDF,
      `${existingApplication.id}-receipt`,
    );

    if (uploadedReceipt.error || !uploadedReceipt.success) {
      console.error(
        'There was an error in saving the application receipt to the database',
      );
      return;
    }

    const newPayment = await db.payment.create({
      data: {
        application: { connect: { id: existingApplication.id } },
        ...validPayment.data,
      },
    });
    if (!newPayment) {
      console.error('There was an error saving the application payment');
      return;
    }

    await db.invoice.update({
      where: { id: relevantInvoice.id },
      data: { invoiceStatus: InvoiceStatus.SETTLED },
    });

    const paymentReferenceCreate: Prisma.PaymentReferenceCreateInput[] =
      validPaymentReference.data.map((reference) => ({
        payment: { connect: { id: newPayment.id } },
        ...reference,
      }));

    await db.$transaction(
      async (prisma) =>
        paymentReferenceCreate.map((paymentRef) =>
          prisma.paymentReference.create({
            data: paymentRef,
          }),
        ),
      {
        maxWait: 20000,
        timeout: 20000,
      },
    );

    const receipt = await db.paymentReceipt.create({
      data: {
        payment: { connect: { id: newPayment.id } },
        fileName: `${existingApplication.id}-receipt`,
        filePath: uploadedReceipt.success,
      },
    });
    if (!receipt) {
      console.error('There was an error saving the application receipt');
      return;
    }

    await paymentCompletedEmail({
      applicantEmail: existingApplication.owner.email,
      endDate: existingApplication.trainingSession.endDate,
      startDate: existingApplication.trainingSession.startDate,
      title: existingApplication.trainingSession.program.title,
      paymentReceipt: {
        filename: receipt.fileName,
        path: receipt.filePath,
      },
    });

    if (newPayment.amount_paid >= existingApplication.applicationFee) {
      await db.application.update({
        where: { id: existingApplication.id },
        data: {
          status: ApplicationStatus.COMPLETED,
        },
      });
      return;
    }

    return;
  } catch (error) {
    console.error('Error processing payment details: ', error);
    return;
  }
}
