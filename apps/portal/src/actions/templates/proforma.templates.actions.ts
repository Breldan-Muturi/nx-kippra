'use server';

import { formatVenues } from '@/helpers/enum.helpers';
import { QRreturn, generateQR } from '@/helpers/templates.helpers';
import { db } from '@/lib/db';
import { Delivery } from '@prisma/client';

const proformaPromise = async (id: string) =>
  await db.application.findUnique({
    where: { id },
    select: {
      slotsCitizen: true,
      slotsEastAfrican: true,
      slotsGlobal: true,
      owner: { select: { name: true } },
      applicationFee: true,
      organization: { select: { name: true } },
      trainingSession: {
        select: {
          program: { select: { title: true, code: true } },
          startDate: true,
          endDate: true,
          venue: true,
        },
      },
      delivery: true,
    },
  });
type ProformaPromise = Awaited<ReturnType<typeof proformaPromise>>;

export type ProformaTemplateProps = {
  id: string;
  description: string;
  applicationFee: number;
  qrCode: string;
  paymentLink: string;
  startDate: Date;
  endDate: Date;
  organizationName?: string;
  trainingVenue: string;
  ownerName: string;
};

export const proformaTemplate = async (
  id: string,
): Promise<{ error: string } | ProformaTemplateProps> => {
  const paymentLink = `${process.env.NEXT_PUBLIC_APP_URL}/applications/?paymentFor=${id}`;
  let proforma: ProformaPromise, qrCode: QRreturn;
  try {
    [proforma, qrCode] = await Promise.all([
      proformaPromise(id),
      generateQR(paymentLink),
    ]);
  } catch (e) {
    console.error('Failed to load proforma info due to a server error: ', e);
    return {
      error:
        'Failed to load proforma info due to a server error. Please try again later',
    };
  }
  if (!proforma)
    return {
      error:
        'Could not match a proforma invoice to this application. Please try again later',
    };
  if (!proforma.applicationFee)
    return {
      error: 'This application has no application fee',
    };
  if (typeof qrCode === 'object' && 'error' in qrCode)
    return { error: qrCode.error };
  const {
    slotsCitizen,
    slotsEastAfrican,
    slotsGlobal,
    applicationFee,
    trainingSession: {
      program: { title },
      startDate,
      endDate,
      venue,
    },
    delivery,
    organization,
    owner: { name },
  } = proforma;
  return {
    id,
    description: `Application id ${id} for ${title} for ${String(slotsCitizen + slotsEastAfrican + slotsGlobal)} participants`,
    applicationFee,
    qrCode,
    paymentLink,
    startDate,
    endDate,
    trainingVenue:
      delivery === Delivery.ONLINE
        ? 'Online'
        : venue
          ? formatVenues(venue)
          : 'Online',
    organizationName: organization?.name,
    ownerName: name,
  };
};
