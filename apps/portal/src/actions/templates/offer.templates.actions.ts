import { formatVenues } from '@/helpers/enum.helpers';
import { db } from '@/lib/db';
import { Delivery } from '@prisma/client';

export type OfferTemplate = {
  ourRef: string;
  county: string | 'Nairobi';
  title: string;
  venue: string | 'Online';
  applicantName: string;
  applicantOccupation?: string;
  startDate: Date;
};

export type OfferTemplateReturn = { error: string } | OfferTemplate;

export const offerTemplate = async (
  id: string,
): Promise<OfferTemplateReturn> => {
  try {
    const offer = await db.application.findUnique({
      where: { id },
      select: {
        owner: { select: { name: true, occupation: true, county: true } },
        organization: { select: { county: true } },
        delivery: true,
        trainingSession: {
          select: {
            venue: true,
            startDate: true,
            program: { select: { title: true } },
          },
        },
      },
    });
    if (!offer)
      return {
        error:
          'Failed to generate offer because the application no-longer exists.',
      };
    return {
      ourRef: id.slice(0, 5),
      venue:
        !!offer.trainingSession.venue && offer.delivery !== Delivery.ONLINE
          ? formatVenues(offer.trainingSession.venue)
          : 'Online',
      applicantName: offer.owner.name,
      applicantOccupation: offer.owner.occupation || undefined,
      county: offer.organization?.county || offer.owner.county || 'Nairobi',
      title: offer.trainingSession.program.title,
      startDate: offer.trainingSession.startDate,
    };
  } catch (e) {
    console.error('Failed to generate offer letter due to a server error: ', e);
    return {
      error:
        'Failed to return offer letter due to a server error. Please try again later',
    };
  }
};
