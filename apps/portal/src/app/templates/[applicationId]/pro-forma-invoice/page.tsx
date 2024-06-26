import { proformaTemplate } from '@/actions/templates/proforma.templates.actions';
import { buttonVariants } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { KIPPRA_LOGO } from '@/constants/template.constants';
import { cn, formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';

type TableItem = { description: string; amount: string };
const ProformaInvoice = async ({
  params: { applicationId },
}: {
  params: { applicationId: string };
}) => {
  const proforma = await proformaTemplate(applicationId);
  if ('error' in proforma) return null;
  const {
    id,
    organizationName,
    applicationFee,
    qrCode,
    paymentLink,
    startDate,
    endDate,
    trainingVenue,
    description,
    ownerName,
  } = proforma;
  const proformaRef = id.slice(0, 8);
  const invoiceDate = format(new Date(), 'PPP');

  const tableBody: TableItem[] = [
    {
      description,
      amount: formatCurrency(applicationFee),
    },
    {
      description: 'eCitizen PesaFlow Convenience Fee',
      amount: formatCurrency(50),
    },
  ];

  const tableFooter: TableItem[] = [
    {
      description: 'Sub-total',
      amount: formatCurrency(applicationFee + 50),
    },
    {
      description: 'VAT 16%',
      amount: formatCurrency(0),
    },
    {
      description: 'Total',
      amount: formatCurrency(applicationFee + 50),
    },
  ];

  return (
    <main className="container min-h-screen py-8 mx-auto space-y-6">
      <div className="flex items-center justify-between w-full">
        <Link
          href="https://kippra.or.ke"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image src={KIPPRA_LOGO} alt="KIPPRA Logo" width={150} height={100} />
        </Link>
        <div className="text-sm">
          <p>
            <span className="font-bold">Our ref:</span>{' '}
            <span className="uppercase">{proformaRef}</span>
          </p>
          <p>
            <span className="font-bold">Proforma Invoice No: </span>
            <span className="uppercase">{proformaRef}/2024</span>
          </p>
        </div>
      </div>
      <div className="flex flex-col w-full mt-8 text-sm">
        <p>P.O. Box 56445-00200, Nairobi.</p>
        <p>Bishop Garden Towers, Bishop Road.</p>
        <Link href="https://kippra.or.ke">
          <span className="font-bold">Website: </span> www.kippra.or.ke
        </Link>
        <Link href="mailto:admin@kippra.or.ke">
          <span className="font-bold">Email: </span> admin@kippra.or.ke
        </Link>
        <div className="flex space-x-2">
          <p className="font-bold">Mobile:</p>
          <Link href="tel: +254 20 4936000">+254 20 4936000</Link>
          {', '}
          <Link href="tel: +254 20 4936000">+254 724 256 078</Link>
        </div>
        <p>
          <span className="font-bold">PIN No: </span> P051126614Z
        </p>
        <p className="mt-4">
          <span className="font-bold">To: </span> {organizationName}
          <br />
          ATTN: {ownerName}
        </p>
        <p>
          <span className="font-bold">Date: </span> {invoiceDate}
        </p>
      </div>
      {/* Table with the price breakdown */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="flex-grow">Description</TableHead>
            <TableHead>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableBody.map(({ amount, description }, i) => (
            <TableRow key={`${i}${description}`}>
              <TableCell className="flex-grow">{description}</TableCell>
              <TableCell>{amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          {tableFooter.map(({ amount, description }, i) => (
            <TableRow key={`${i}${description}`}>
              <TableCell className="flex-grow">{description}</TableCell>
              <TableCell>{amount}</TableCell>
            </TableRow>
          ))}
        </TableFooter>
      </Table>
      {/* Notes */}
      <div className="flex justify-between w-full space-x-20 items-top flex-cols-4">
        <div className="flex flex-col items-start col-span-3 space-y-2 text-sm">
          <p>
            <span className="font-bold">Note:</span>
            <br />
            <span>Payments to KIPPRA should be made through eCitizen:</span>
          </p>
          <p>
            To complete this payment kindly scan the QR Code alongside or click
            the <strong>Make payment</strong> button below.
          </p>
          <p>
            Otherwise, use the link below:
            <br />
            <Link
              href={paymentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-green-600"
            >
              {paymentLink}
            </Link>{' '}
          </p>
        </div>
        <div className="flex flex-col col-span-1 space-y-2">
          <div className="p-1 border-2 border-green-600 rounded-md">
            <Link href={paymentLink} target="_blank" rel="noopener noreferrer">
              <Image
                src={qrCode}
                alt="Payment QR Code"
                height={150}
                width={150}
              />
            </Link>
          </div>
          <Link
            href={paymentLink}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: 'default' }),
              'bg-green-600 hover:bg-green-700',
            )}
          >
            Make Payment
          </Link>
        </div>
      </div>
      {/* Additional details */}
      <div className="flex flex-col items-start flex-grow w-full space-y-4 text-sm">
        <p className="font-semibold text-red-600">
          Payment is due withing 30 days from the invoice date
        </p>
        <p>
          <span className="font-semibold">The training will be held on:</span>
          <br />
          {format(startDate, 'PPP')} to {format(endDate, 'PPP')}
        </p>
        <p>
          <span className="font-semibold">Training venue: </span>
          {trainingVenue}
        </p>
      </div>
      {/* Footer */}
      <div className="items-center justify-center mt-auto w-full py-4 border-t-4 border-green-600 px-auto">
        <p className="text-sm text-center">
          Disclaimer: This is an auto-generated invoice and does not require a
          signature
        </p>
      </div>
    </main>
  );
};

export default ProformaInvoice;
