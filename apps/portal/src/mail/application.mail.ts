'use server';
import { domain, from, resend } from '@/constants/mail.constants';
import { Attachment } from '@/types/mail.types';
import { add, format } from 'date-fns';

export type NewApplicationEmailType = {
  email: string;
  token: string;
  expires: Date;
  title: string;
  startDate: Date;
  endDate: Date;
};

export const newApplicationEmail = async ({
  email,
  token,
  expires,
  title,
  startDate,
  endDate,
}: NewApplicationEmailType) => {
  const formattedStartDate = format(startDate, 'PPP');
  const formattedEndDate = format(endDate, 'PPP');
  const confirmLink = `${domain}/profile/applications?token=${token}`;
  const cancelLink = `${domain}/profile/applications?cancellation=${token}`;
  await resend.emails.send({
    from,
    to: email,
    subject: `KIPPRA: Confirm your enrolment for ${title} from ${formattedStartDate} to ${formattedEndDate}`,
    html: `<p>You have been enrolled into the Kenya Institute of Public Policy Research and Analysis (KIPPRA's) program for <b>${title}</b> starting on ${formattedStartDate} to ${formattedEndDate}. This invite will be expiring on ${format(expires, 'PPP')}. Kindly confirm your enrolment before then. Otherwise, it will be automatically cancelled. <a href="${confirmLink}">Click here to confirm your attendance.</a><br/> <a href="${cancelLink}">Otherwise, cancel your enrolment here</a></p>`,
  });
};

export type ApprovedApplicationEmailType = {
  applicantEmail: string;
  approvalDate: Date;
  title: string;
  startDate: Date;
  endDate: Date;
  venue?: string;
  message?: string;
  offerLetter: Attachment;
  proformaInvoice: Attachment;
};

export const approvedApplicationEmail = async ({
  applicantEmail,
  approvalDate,
  title,
  startDate,
  endDate,
  venue,
  offerLetter,
  proformaInvoice,
  message,
}: ApprovedApplicationEmailType) => {
  const formattedApprovalDate = format(approvalDate, 'PPP');
  const formattedStartDate = format(startDate, 'PPP');
  const formattedEndDate = format(endDate, 'PPP');
  const paymentDueDate = format(add(approvalDate, { days: 30 }), 'PPP');
  try {
    await resend.emails.send({
      from,
      to: applicantEmail,
      subject: `KIPPRA: Application Approval for ${title} ${venue ? `at ${venue} ` : ''}from ${formattedStartDate} to ${formattedEndDate}`,
      html: `Your application for the program for ${title} is approved as of ${formattedApprovalDate}. The program is scheduled to start from ${formattedStartDate} to ${formattedEndDate}. Kindly ensure payment for your application is submitted by ${paymentDueDate}${message ? `<br/>Message from the admin below:<br/> ${message}` : ''}`,
      attachments: [offerLetter, proformaInvoice],
    });
  } catch (error) {
    console.log(error);
  }
};

export const deletedApplicationEmail = async ({
  applicationEmails,
  title,
  venue,
  startDate,
  endDate,
}: {
  applicationEmails: string[];
  title: string;
  venue?: string;
  startDate: Date;
  endDate: Date;
}) => {
  const formattedStartDate = format(startDate, 'PPP');
  const formattedEndDate = format(endDate, 'PPP');
  try {
    await resend.emails.send({
      from,
      to: applicationEmails,
      subject: `KIPPRA: Deleted application for ${title} ${venue ? `at ${venue} ` : ''}from ${formattedStartDate} to ${formattedEndDate}`,
      html: `Please note the application for ${title} ${venue ? `at ${venue} ` : ''}from ${formattedStartDate} to ${formattedEndDate} has been deleted by the application owner and your reserved slots have been withdrawn.`,
    });
  } catch (error) {
    console.log('Error sending application deletion emails: ', error);
  }
};

export const removeMeParticipantEmail = async ({
  removedParticipantEmail,
  title,
  venue,
  startDate,
  endDate,
}: {
  removedParticipantEmail: string;
  title: string;
  venue?: string;
  startDate: string;
  endDate: string;
}) => {
  try {
    await resend.emails.send({
      from,
      to: removedParticipantEmail,
      subject: 'KIPPRA: Application Removal Confirmation',
      html: `This is to confirm you have successfully cancelled your participation for ${title} ${venue ? `at ${venue} ` : ''}from ${startDate} to ${endDate} by removing yourself from the application`,
    });
  } catch (error) {
    console.log('Error sending participant application removal email: ', error);
  }
};

export const removeMeOwnerEmail = async ({
  removedPatricipantOwner,
  name,
  title,
  venue,
  startDate,
  endDate,
}: {
  removedPatricipantOwner: string;
  name: string;
  title: string;
  venue?: string;
  startDate: string;
  endDate: string;
}) => {
  try {
    await resend.emails.send({
      from,
      to: removedPatricipantOwner,
      subject: 'KIPPRA: Application participant removal',
      html: `This is to inform you that ${name}, who was included in your application for ${title} ${venue ? `at ${venue} ` : ''}from ${startDate} to ${endDate} has removed themself from participating in the training session.`,
    });
  } catch (error) {
    console.log(
      'Error sending application owner email on participant removal: ',
      error,
    );
  }
};
