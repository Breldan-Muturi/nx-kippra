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
