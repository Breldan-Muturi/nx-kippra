import { domain, from, resend } from '@/constants/mail.constants';

export const inviteOrgTokenEmail = async ({
  to,
  token,
  organizationName,
  senderName,
  inviteRoute,
}: {
  to: string;
  token: string;
  organizationName: string;
  senderName: string;
  inviteRoute: string;
}) => {
  const registerLink = `${domain}/${inviteRoute}?token=${token}`;
  await resend.emails.send({
    from,
    to,
    subject: `KIPPRA Portal: Invite from ${organizationName}`,
    html: `<p>${senderName} has invited you to join ${organizationName} as a member on the KIPPRA Online Registration Portal. This will enable her to easily make include you as a participant for KIPPRA's training programs. If this was a mistake, please ignore the email. Otherwise, <a href="${registerLink}">Click here</a> to register your account on the portal.</p>`,
  });
};

export const inviteResendEmail = async ({
  to,
  token,
  organizationName,
  senderName,
  inviteRoute,
}: {
  to: string;
  token: string;
  organizationName: string;
  senderName: string;
  inviteRoute: string;
}) => {
  const registerLink = `${domain}/${inviteRoute}?token=${token}`;
  await resend.emails.send({
    from,
    to,
    subject: `KIPPRA Portal: Resent invite from ${organizationName}`,
    html: `<p>${senderName} has renewed your invite you to join ${organizationName} as a member on the KIPPRA Online Registration Portal. This will enable her to easily make include you as a participant for KIPPRA's training programs. If this was a mistake, please ignore the email. Otherwise, <a href="${registerLink}">Click here</a> to register your account on the portal.</p>`,
  });
};

export const inviteResponseEmail = async ({
  to,
  inviteeName,
  organizationName,
  organizationId,
  accepted,
}: {
  to: string;
  inviteeName: string;
  organizationName: string;
  organizationId: string;
  accepted: boolean;
}) => {
  const orgMembersLink = `${domain}/organization/${organizationId}/members`;
  await resend.emails.send({
    from,
    to,
    subject: `KIPPRA Portal: ${inviteeName} ${accepted ? 'accepted' : 'declined'} to join ${organizationName}`,
    html: `<p>This is to inform you that ${inviteeName} has ${accepted ? 'accepted' : 'declined'} your invitation to join ${organizationName} on the KIPPRA Online Registration Portal. <a href="${orgMembersLink}">Click here</a> to view and manage ${organizationName}'s members</p>`,
  });
};
