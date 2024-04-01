import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import React from 'react';

export type TableActionsType = {
  isVisible?: boolean;
  content: string;
  icon: React.ReactNode;
  // Pass a tailwind color
  tooltipContentClassName?: string;
  isPending: boolean;
};

export type TableActionProps = React.ComponentPropsWithoutRef<'button'> &
  TableActionsType;

const TableAction = ({
  isVisible = true,
  content,
  icon,
  tooltipContentClassName,
  isPending,
  className,
  ...props
}: TableActionProps) => {
  if (!isVisible) return null;
  return (
    <Tooltip>
      <TooltipTrigger asChild disabled={isPending}>
        <Button
          variant="outline"
          size="icon"
          className={cn('h-8 w-8 rounded-full', className)}
          title={content}
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
        {content}
      </TooltipContent>
    </Tooltip>
  );
};

export default TableAction;
