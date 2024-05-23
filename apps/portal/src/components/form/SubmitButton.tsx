import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import React from 'react';

type SubmitButtonProps = React.ComponentPropsWithoutRef<'button'> & {
  isSubmitting?: boolean;
  label: string;
  form?: string;
};

const SubmitButton: React.FC<SubmitButtonProps> = ({
  label,
  className,
  form,
  isSubmitting = false,
  ...props
}) => {
  return (
    <Button
      variant="default"
      type="submit"
      className={cn('col-span-2 bg-green-600', className)}
      disabled={isSubmitting}
      form={form}
      {...props}
    >
      {isSubmitting && (
        <Loader2 color="white" className="w-4 h-4 mr-2 animate-spin" />
      )}
      {label}
    </Button>
  );
};

export default SubmitButton;
