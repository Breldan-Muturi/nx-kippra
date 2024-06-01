import { buttonVariants } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { TooltipActionsType } from '@/types/tooltip.types';
import Link, { LinkProps } from 'next/link';
import React from 'react';

export type TooltipLinkButtonProps = React.ComponentPropsWithoutRef<'a'> &
  LinkProps &
  TooltipActionsType;

const TooltipLinkButton = ({
  isVisible = true,
  title,
  href,
  icon,
  tooltipContentClassName,
  disabled,
  className,
  ...props
}: TooltipLinkButtonProps) => {
  if (!isVisible) return null;
  return (
    <Tooltip>
      <TooltipTrigger asChild disabled={disabled}>
        <Link
          href={href}
          title={title}
          className={cn(
            buttonVariants({ variant: 'outline', size: 'icon' }),
            'size-8 rounded-full',
            className,
          )}
          {...props}
        >
          {icon}
        </Link>
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

export default TooltipLinkButton;
