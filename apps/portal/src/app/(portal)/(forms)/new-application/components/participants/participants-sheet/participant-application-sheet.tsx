import { SingleApplicationParticipant } from '@/actions/participants/single.participant.actions';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

const ParticipantApplicationSheet = ({
  participant,
  open,
  onOpenChange,
}: {
  participant: SingleApplicationParticipant;
  open: boolean;
  onOpenChange: () => void;
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Participant Details</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you are done.
          </SheetDescription>
        </SheetHeader>
        {JSON.stringify(participant)}
      </SheetContent>
    </Sheet>
  );
};

export default ParticipantApplicationSheet;
