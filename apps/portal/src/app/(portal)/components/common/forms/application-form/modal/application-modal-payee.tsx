import ReusableForm from '@/components/form/ReusableForm';
import { Checkbox } from '@/components/ui/checkbox';
import { Form } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { payApplicationFields } from '@/validation/payment/payment-fields';
import {
  PayeeForm,
  payeeFormSchema,
} from '@/validation/payment/payment.validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';

type ApplicationModalPayeeProps = {
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
      <div className="grid w-full grid-cols-2 gap-x-2 gap-y-4">
        <ReusableForm formFields={payApplicationFields} />
        <div className="flex col-span-2 mt-4 space-x-2 items-top">
          <Checkbox
            id="confirmation"
            disabled={isPending || !validPayeeFields.success}
            onCheckedChange={() =>
              validPayeeFields.success && handlePayee(validPayeeFields.data)
            }
          />
          <div className="grid gap-1.5 leading-none">
            <Label
              htmlFor="confirmation"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Confirm application payee
            </Label>
            <p className="text-sm text-muted-foreground">
              This will create an invoice using the above payee details such as
              their phone number and email
            </p>
          </div>
        </div>
      </div>
    </Form>
  );
};

export default ApplicationModalPayee;
