import { DynamicParticipantOption } from '@/actions/participants/application.participants.actions';
import ReusableForm from '@/components/form/ReusableForm';
import { Form } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import {
  AdminApplicationParticipant,
  applicationParticipantSchema,
} from '@/validation/applications/participants.application.validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import participantFields from './application-participant-fields';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, X } from 'lucide-react';
import ParticipantButton from '@/app/(portal)/(hero)/[programId]/training-sessions/[trainingsessionid]/components/participant-button';

type ApplicationParticipantFormProps =
  React.ComponentPropsWithoutRef<'section'> & {
    participant?: DynamicParticipantOption;
    customSubmit: SubmitHandler<AdminApplicationParticipant>;
    dismissForm: () => void;
    isSubmitting: boolean;
  };

const ApplicationParticipantForm = ({
  participant,
  customSubmit,
  dismissForm,
  className,
  isSubmitting,
  ...props
}: ApplicationParticipantFormProps) => {
  const form = useForm<AdminApplicationParticipant>({
    resolver: zodResolver(applicationParticipantSchema),
    defaultValues: {
      ...participant,
      userId: participant?.id,
      isOwner: false,
      nationalId: participant?.nationalId || undefined,
    },
    mode: 'onChange',
  });

  const { handleSubmit } = form;

  return (
    <section className={cn('flex flex-col space-y-1', className)} {...props}>
      <Form {...form}>
        <div className="flex space-x-4 items-center mb-4">
          <ParticipantButton
            icon={<X className="size-4" />}
            tooltipLabel="Dismiss form"
            className="bg-red-600/80 hover:bg-red-600 size-6"
            onClick={dismissForm}
          />
          <Badge color={!!participant?.id ? 'green' : undefined}>
            {!!participant?.id ? 'Registered participant' : 'New participant'}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-4">
          <ReusableForm formFields={participantFields(participant)} />
          <Button
            variant="default"
            className={cn('col-span-2 bg-green-600', className)}
            disabled={isSubmitting}
            onClick={handleSubmit(customSubmit)}
          >
            {isSubmitting && (
              <Loader2 color="white" className="mr-2 h-4 w-4 animate-spin" />
            )}
            Add participant
          </Button>
        </div>
      </Form>
    </section>
  );
};

export default ApplicationParticipantForm;
