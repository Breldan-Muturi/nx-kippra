import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { TooltipActionsType } from '@/types/tooltip.types';
import React from 'react';

export type TooltipActionButtonProps =
  React.ComponentPropsWithoutRef<'button'> & TooltipActionsType;

const TooltipActionButton = ({
  isVisible = true,
  title,
  icon,
  tooltipContentClassName,
  disabled,
  className,
  ...props
}: TooltipActionButtonProps) => {
  if (!isVisible) return null;
  return (
    <Tooltip>
      <TooltipTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          size="icon"
          className={cn('size-8 rounded-full', className)}
          title={title}
          {...props}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent
        className={cn(
          'rounded-md border bg-background p-2  text-gray-600',
          tooltipContentClassName,
        )}
      >
        {title}
      </TooltipContent>
    </Tooltip>
  );
};

export default TooltipActionButton;
