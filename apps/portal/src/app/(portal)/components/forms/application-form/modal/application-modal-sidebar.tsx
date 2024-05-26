import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ApplicationModalStepType } from './application-modal-steps';

type ApplicationModalSidebarProps = React.ComponentPropsWithoutRef<'div'> & {
  buttons: ApplicationModalStepType['button'][];
  activeStep: number;
  setFormStep: (step: number) => void;
};

export default function ApplicationModalSidebar({
  buttons,
  activeStep,
  setFormStep,
  className,
  ...props
}: ApplicationModalSidebarProps) {
  return (
    <div
      className={cn(
        'flex w-full justify-evenly md:justify-normal md:w-auto md:flex-col gap-y-6 items-start',
        className,
      )}
      {...props}
    >
      {buttons.map(
        ({ label, children, disabled = false, className, ...props }, i) => (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setFormStep(i)}
              className={cn(
                'flex md:hidden rounded-full border-2',
                activeStep === i
                  ? 'text-green-600 border-green-600 bg-muted hover:bg-muted'
                  : 'hover:bg-transparent',
              )}
            >
              {children}
            </Button>
            <Button
              variant="ghost"
              disabled
              onClick={() => setFormStep(i)}
              className={cn(
                activeStep === i
                  ? 'text-green-600 border border-green-600  bg-muted hover:bg-muted'
                  : 'hover:bg-transparent hover:underline',
                'hidden md:flex justify-start w-full',
                className,
              )}
              {...props}
            >
              {children}
              {label}
            </Button>
          </>
        ),
      )}
    </div>
  );
}
