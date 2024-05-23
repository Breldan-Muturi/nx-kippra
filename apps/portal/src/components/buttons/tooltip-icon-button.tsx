import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import React from 'react';

export interface TooltipIconButtonProps
  extends React.ComponentPropsWithoutRef<'button'> {
  isVisible?: boolean;
  icon: React.ReactNode;
  tooltipLabel: string;
}

const TooltipIconButton = ({
  isVisible = true,
  icon,
  tooltipLabel,
  className,
  ...btnProps
}: TooltipIconButtonProps) => {
  if (!isVisible) {
    return null;
  } else
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="destructive"
            size="icon"
            className={cn('rounded-full', className)}
            {...btnProps}
          >
            {icon}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{tooltipLabel}</TooltipContent>
      </Tooltip>
    );
};

export default TooltipIconButton;
