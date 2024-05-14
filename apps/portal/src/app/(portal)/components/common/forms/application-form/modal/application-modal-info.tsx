import { Badge } from '@/components/ui/badge';
import {
  deliveryModeOptions,
  formatDeliveryMode,
} from '@/helpers/enum.helpers';
import { cn } from '@/lib/utils';
import { Delivery, UserRole } from '@prisma/client';
import { ApplicationModalProps } from './application-modal-steps';

const ApplicationInfo = ({
  data,
  applicationTrainingSession,
  formSlots,
  role,
}: Pick<
  ApplicationModalProps,
  'data' | 'applicationTrainingSession' | 'formSlots' | 'role'
>) => {
  const { slotsCitizen, slotsEastAfrican, slotsGlobal } = formSlots;
  const { delivery } = data;
  const {
    onPremiseSlots,
    onlineSlots,
    onPremiseSlotsTaken,
    onlineSlotsTaken,
    mode,
    program: { serviceId },
  } = applicationTrainingSession;
  const bookedSlots =
    (slotsCitizen || 0) + (slotsEastAfrican || 0) + (slotsGlobal || 0);
  const availableSlotsOnline = onlineSlots
    ? onlineSlots - (onlineSlotsTaken || 0)
    : 0;
  const availableSlotsOnpremise = onPremiseSlots
    ? onPremiseSlots - (onPremiseSlotsTaken || 0)
    : 0;
  const deliveryModeNotSelected =
    mode === Delivery.BOTH_MODES
      ? deliveryModeOptions
          .filter(
            ({ value }) => value !== delivery && value !== Delivery.BOTH_MODES,
          )
          .map(({ optionLabel }) => optionLabel)[0]
      : undefined;
  const isAdmin = role === UserRole.ADMIN;
  return (
    <ul className="space-y-2">
      <li>
        <div className="flex items-center gap-2">
          <p>Mode of delivery:</p>
          <Badge variant="default" className="bg-green-600">
            {formatDeliveryMode(delivery)}
          </Badge>
          {deliveryModeNotSelected && (
            <Badge variant="outline">{deliveryModeNotSelected}</Badge>
          )}
        </div>
      </li>
      <li>
        Application booked slots:{' '}
        <span className="font-medium text-green-600">{bookedSlots}</span>
        {'/'}
        <span className="font-medium">
          {delivery !== Delivery.ON_PREMISE
            ? availableSlotsOnline
            : availableSlotsOnpremise}
        </span>
      </li>
      <li>
        Kenyan citizens:{' '}
        <span
          className={cn(
            'font-medium',
            slotsCitizen ? 'text-green-600' : 'text-red-600',
          )}
        >
          {slotsCitizen || 0}
        </span>
        {'/'}
        <span className="font-medium">{bookedSlots}</span>
      </li>
      <li>
        East African citizens:{' '}
        <span
          className={cn(
            'font-medium',
            slotsEastAfrican ? 'text-green-600' : 'text-red-600',
          )}
        >
          {slotsEastAfrican || 0}
        </span>
        {'/'}
        <span className="font-medium">{bookedSlots}</span>
      </li>
      <li>
        Global citizens:{' '}
        <span
          className={cn(
            'font-medium',
            slotsGlobal ? 'text-green-600' : 'text-red-600',
          )}
        >
          {slotsGlobal || 0}
        </span>
        {'/'}
        <span className="font-medium">{bookedSlots}</span>
      </li>
      {isAdmin && (
        <>
          <li>
            Pesaflow Service Id for Ksh Payments:{' '}
            <span className="font-medium text-green-600">{serviceId}</span>
          </li>
          <li>
            Pesaflow Service Id for Usd Payments:{' '}
            <span className="font-medium text-green-600">{serviceId}</span>
          </li>
        </>
      )}
    </ul>
  );
};

export default ApplicationInfo;
