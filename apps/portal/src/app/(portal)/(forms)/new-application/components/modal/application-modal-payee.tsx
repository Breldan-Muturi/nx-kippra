import ReusableForm from '@/components/form/ReusableForm';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { payApplicationFields } from '@/validation/payment/payment-fields';
import {
  PayeeForm,
  payeeFormSchema,
} from '@/validation/payment/payment.validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import React, { useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';

export type ApplicationModalPayeeProps = {
  payee: PayeeForm | undefined;
  handlePayee: (payee: PayeeForm | undefined) => void;
};

const ApplicationModalPayee = ({
  payee,
  handlePayee,
}: ApplicationModalPayeeProps) => {
  const [isPending, startTransition] = useTransition();
  const form = useForm<PayeeForm>({
    mode: 'onChange',
    resolver: zodResolver(payeeFormSchema),
    defaultValues: payee,
  });

  const { watch } = form;

  const validPayeeFields = payeeFormSchema.safeParse(watch());

  const onSubmit = (data: PayeeForm) => {
    startTransition(() => {
      handlePayee(data);
    });
  };

  useEffect(() => {
    const subscription = watch((value, { type }) => {
      if (type === 'change') {
        handlePayee(undefined);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, handlePayee]);

  return (
    <Form {...form}>
      <div className="grid grid-cols-2 w-full gap-x-2 gap-y-4">
        <ReusableForm formFields={payApplicationFields} />
        <Button
          variant="default"
          className={'col-span-2 bg-green-600 mt-2'}
          disabled={isPending || !validPayeeFields.success}
          onClick={() => onSubmit(watch())}
        >
          {isPending && (
            <Loader2 color="white" className="mr-2 h-4 w-4 animate-spin" />
          )}
          Confirm Application Payee
        </Button>
      </div>
    </Form>
  );
};

export default ApplicationModalPayee;
