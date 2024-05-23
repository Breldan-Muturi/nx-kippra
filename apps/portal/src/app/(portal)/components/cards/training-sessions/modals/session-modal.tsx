'use client';

import { newTrainingSession } from '@/actions/training-session/new.training-session.actions';
import { updateTrainingSession } from '@/actions/training-session/update.training-session.actions';
import ReusableForm from '@/components/form/ReusableForm';
import SubmitButton from '@/components/form/SubmitButton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  NewTrainingSessionForm,
  UpdateTrainingSessionForm,
  trainingSessionSchema,
} from '@/validation/training-session/training-session.validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Delivery, TrainingSession } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { kshFeesFields, sessionFields, usdFeesFields } from './session-fields';

type SessionModalProps = React.ComponentPropsWithoutRef<'div'> &
  (
    | { programId: string; trainingSession?: never }
    | { programId?: never; trainingSession: TrainingSession }
  ) & { dismissModal: () => void };

const SessionModal = ({
  programId,
  trainingSession,
  dismissModal,
  className,
  ...props
}: SessionModalProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const newSession = trainingSession === undefined;
  console.log('Training session: ', JSON.stringify(trainingSession, null, 2));

  const form = useForm<NewTrainingSessionForm | UpdateTrainingSessionForm>({
    resolver: zodResolver(trainingSessionSchema),
    mode: 'onChange',
    defaultValues: newSession
      ? {
          programId,
          usingUsd: false,
          usingDifferentFees: false,
        }
      : (() => {
          const {
            onlineSlotsTaken,
            onPremiseSlotsTaken,
            ...restTrainingSession
          } = trainingSession;
          return {
            ...Object.fromEntries(
              Object.entries(restTrainingSession).filter(
                ([_, value]) => value !== null,
              ),
            ),
            usingUsd: [
              trainingSession.usdCitizenFee,
              trainingSession.usdCitizenOnlineFee,
            ].some(Boolean),
            usingDifferentFees: [
              trainingSession.mode !== Delivery.ONLINE &&
                trainingSession.eastAfricaFee,
              trainingSession.mode !== Delivery.ON_PREMISE &&
                trainingSession.eastAfricaOnlineFee,
            ].some(Boolean),
          };
        })(),
  });

  const { handleSubmit, getValues, reset, watch } = form;
  const usingDifferentFees = watch('usingDifferentFees') === true;
  const usingUsd = watch('usingUsd') === true;
  const mode = watch('mode');

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'mode') {
        reset({
          ...value,
          ...(value.mode === Delivery.ONLINE
            ? {
                onPremiseSlots: undefined,
                citizenFee: undefined,
                usdCitizenFee: undefined,
                eastAfricaFee: undefined,
                usdEastAfricaFee: undefined,
                globalParticipantFee: undefined,
                usdGlobalParticipantFee: undefined,
              }
            : {}),
          ...(value.mode === Delivery.ON_PREMISE
            ? {
                onlineSlots: undefined,
                citizenOnlineFee: undefined,
                usdCitizenOnlineFee: undefined,
                eastAfricaOnlineFee: undefined,
                usdEastAfricaOnlineFee: undefined,
                globalParticipantOnlineFee: undefined,
                usdGlobalParticipantOnlineFee: undefined,
              }
            : {}),
        });
        return;
      }
      if (name === 'usingDifferentFees') {
        reset({
          ...value,
          ...(!value.usingDifferentFees
            ? {
                eastAfricaFee: undefined,
                usdEastAfricaFee: undefined,
                globalParticipantFee: undefined,
                usdGlobalParticipantFee: undefined,
                eastAfricaOnlineFee: undefined,
                usdEastAfricaOnlineFee: undefined,
                globalParticipantOnlineFee: undefined,
                usdGlobalParticipantOnlineFee: undefined,
              }
            : {}),
        });
        return;
      }
      if (name === 'usingUsd') {
        reset({
          ...value,
          ...(!value.usingUsd
            ? {
                usdCitizenFee: undefined,
                usdCitizenOnlineFee: undefined,
                usdEastAfricaFee: undefined,
                usdGlobalParticipantFee: undefined,
                usdEastAfricaOnlineFee: undefined,
                usdGlobalParticipantOnlineFee: undefined,
              }
            : {}),
        });
        return;
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, reset]);

  const onSubmit = (
    data: NewTrainingSessionForm | UpdateTrainingSessionForm,
  ) => {
    startTransition(() => {
      if (newSession) {
        newTrainingSession(data as NewTrainingSessionForm)
          .then((data) => {
            if (data.error) {
              toast.error(data.error);
            } else if (data.success) {
              toast.success(data.success);
              router.refresh();
            }
          })
          .finally(dismissModal);
      } else {
        updateTrainingSession(data as UpdateTrainingSessionForm)
          .then((data) => {
            if (data.error) {
              toast.error(data.error);
            } else if (data.success) {
              toast.success(data.success);
              router.refresh();
            }
          })
          .finally(dismissModal);
      }
    });
  };

  return (
    <Dialog open onOpenChange={dismissModal}>
      <DialogContent className={className} {...props}>
        <DialogHeader>
          <DialogTitle>{`${newSession ? 'New' : 'Update'} training session`}</DialogTitle>
          <DialogDescription className="text-green-600">
            {`${newSession ? 'Submit details for the new training session' : 'Complete the form correctly to update this training session'}`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-2 gap-2"
          >
            <ReusableForm
              formFields={sessionFields({
                usingDifferentFees,
                usingUsd,
                mode,
              })}
            />
            {usingUsd && (
              <Tabs defaultValue="ksh" className="col-span-2">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="ksh">Ksh Fees</TabsTrigger>
                  <TabsTrigger value="usd">USD Fees</TabsTrigger>
                </TabsList>
                <TabsContent value="ksh" className="grid grid-cols-2 gap-2">
                  <ReusableForm
                    formFields={kshFeesFields(usingDifferentFees, mode)}
                  />
                </TabsContent>
                <TabsContent value="usd" className="grid grid-cols-2 gap-2">
                  <ReusableForm
                    formFields={usdFeesFields(usingDifferentFees, mode)}
                  />
                </TabsContent>
              </Tabs>
            )}
            <SubmitButton
              className="my-4"
              label={`${newSession ? 'New' : 'Update'} session`}
              isSubmitting={isPending}
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SessionModal;
