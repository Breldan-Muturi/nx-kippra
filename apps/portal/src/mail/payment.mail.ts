'use server';
import { from, resend } from '@/constants/mail.constants';
import { Attachment } from '@/types/mail.types';
import { format } from 'date-fns';

export type PaymentCompletedEmailType = {
  to: string[];
  title: string;
  startDate: Date;
  endDate: Date;
  venue?: string;
  paymentReceipt: Attachment;
  isUpdate: boolean;
};

export const paymentCompletedEmail = async ({
  to,
  title,
  startDate,
  endDate,
  venue,
  paymentReceipt,
  isUpdate,
}: PaymentCompletedEmailType) => {
  const formattedStartDate = format(startDate, 'PPP');
  const formattedEndDate = format(endDate, 'PPP');
  try {
    await resend.emails.send({
      from,
      to,
      subject: `KIPPRA: Payment confirmation`,
      html: `Your payment for the program for ${title} has been received. The training will ${venue ? `be at ${venue}` : 'be conducted online'} starting from ${formattedStartDate} to ${formattedEndDate}.${isUpdate ? `<br/> Having completed the payment this application has been marked as complete and you may proceed to attend the program` : ''}`,
      attachments: [paymentReceipt],
    });
  } catch (error) {
    console.log(error);
  }
};
