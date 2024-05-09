import { offerTemplate } from '@/actions/templates/offer.templates.actions';
import { getFirstName } from '@/lib/utils';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';

const OfferLetter = async ({
  params: { applicationId },
}: {
  params: { applicationId: string };
}) => {
  const offer = await offerTemplate(applicationId);
  if ('error' in offer) return null;
  const { ourRef, applicantName, title, startDate, venue } = offer;
  return (
    <main className="container flex flex-col min-h-screen py-8 mx-auto space-y-8">
      {/* Letterhead */}
      <div className="flex items-center justify-center w-full pb-4 border-b-4 border-green-600">
        <Link
          href="https://kippra.or.ke"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="/kippra-doc-logo.png"
            alt="KIPPRA Logo"
            width={200}
            height={100}
          />
        </Link>
      </div>
      {/* Content */}
      <div className="flex flex-col flex-grow w-full">
        <p>
          <span className="font-semibold">Our Ref: </span>
          <span className="capitalize">Application id </span>
          <span className="uppercase">{ourRef}</span>
        </p>
        <p className="text-right">{format(new Date(), 'PPP')}</p>
        <p>{`Mr(s). ${applicantName}`}</p>
        <p>Web developer</p>
        <p>Nairobi</p>
        <p className="mt-4">{`Greetings ${getFirstName(applicantName)}`}</p>
        <p className="mt-8 font-bold underline uppercase">
          {`INVITATION TO PARTICIPATE IN THE ${title} PROGRAMME`}
        </p>
        <p className="mt-4">
          {`The Kenya Institute for Public Policy Research and Analysis (KIPPRA)
          is a State Corporation established by an Act of Parliament, No. 15
          2006, with a primary mandate of providing quality policy advice to the
          Government of Kenya, private sector and other key stakeholders by
          conducting objective research and analysis and through capacity
          building in order to contribute to the achievement of national
          long-term development objectives by positively influencing the
          decision-making processes.`}
        </p>
        <p className="mt-4">
          Following your application for Capacity Building programme in
          Understanding Governance Structures in a Devolved System of
          Government, we are pleased to inform you that you are invited to
          participate in the programme. The programme is scheduled for{' '}
          <span className="font-bold">{format(startDate, 'PPP')}</span> in{' '}
          <span className="font-bold">{venue}</span>.
          <br />
          Kindly note that proof of payment will be required before any
          participant is allowed in the training room.
        </p>
        <p className="mt-4">We look forward to engaging with you.</p>
        <p className="mt-4">Yours Sincerely,</p>
        <p className="mt-8 font-bold uppercase">
          DR. ROSE NGUGI
          <br />
          <span className="underline">EXECUTIVE DIRECTOR</span>
        </p>
      </div>
      {/* Footer */}
      <div className="items-center justify-center w-full py-4 mt-auto border-t-4 border-green-600 ">
        <p className="text-xs text-center text-balance">
          2nd floor Bishop Garden Towers, P.O.Box 56445 - 00200, Tel: +254 20
          4936000 / 2719933/4
          <br />
          0724256078/ 0736712724, Fax: +254-20-2719951, Email:
          admin@kippra.or.ke, Website: https://kippra.or.ke
        </p>
      </div>
    </main>
  );
};

export default OfferLetter;
