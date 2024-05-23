import { from, resend } from '@/constants/mail.constants';
import { format } from 'date-fns';

export const completedResponseEmail = async ({
  to,
  name,
  title,
  createdAt,
  message,
  accepted,
}: {
  to: string[];
  name: string;
  title: string;
  createdAt: Date;
  message?: string;
  accepted: boolean;
}) => {
  //  TODO: Add a link someone can use to navigate to the completed program
  //   const registerLink = `${domain}/${inviteRoute}?token=${token}`;
  await resend.emails.send({
    from,
    to,
    subject: `KIPPRA Portal: ${accepted ? 'Accepted' : 'Rejected'} Completed Program`,
    html: `<p>This is to notify you that the completed program submitted on ${format(createdAt, 'PPP')} for ${name} for ${title} was ${accepted ? 'accepted' : 'rejected'}.${message ? `For the reasons below: </br> ${message}` : ''}</p>`,
  });
};

export const completedDeletedEmail = async ({
  name,
  bcc,
  message,
  reply_to,
}: {
  name: string;
  bcc: string[];
  reply_to: string[];
  message?: string;
}) =>
  await resend.emails.send({
    from,
    to: 'portal@kippra.or.ke',
    reply_to: [...reply_to, 'portal@kippra.or.ke'],
    bcc,
    subject: `KIPPRA Portal: Updates on your completed program`,
    // TODO: Add a link to navigate to completed programs.
    html: `Your completed program to submission to the online registration portal has been deleted by ${name}${message ? ` for the following reasons:<br/> ${message}` : '.'}`,
  });

export const newCompletedEmail = async ({
  participantName,
  programTitle,
  to,
}: {
  participantName: string;
  programTitle: string;
  to: string[];
}) =>
  await resend.emails.send({
    from,
    to,
    reply_to: 'portal@kippra.or.ke',
    subject: `KIPPRA Portal: New program completion for ${programTitle} for ${participantName}`,
    html: `A new program completion has been submitted for ${participantName} for ${programTitle}. The Admin has also been prompted to approve this submission. You will receive a follow up email once a response is made by the Admin.`,
  });

export const updateCompletedEmail = async ({
  participantName,
  to,
}: {
  participantName: string;
  to: string[];
}) =>
  await resend.emails.send({
    from,
    to,
    reply_to: 'portal@kippra.or.ke',
    subject: `KIPPRA Portal: Updates on your program completion for ${participantName}`,
    html: `A program completion for ${participantName} has been updated. The Admin has also been prompted to approve this submission. You will receive a follow up email once a response is made by the Admin.`,
  });
