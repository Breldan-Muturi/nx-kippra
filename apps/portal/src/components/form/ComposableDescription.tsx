import { cn } from '@/lib/utils';
import React from 'react';

interface ComposableDescriptionProps
  extends React.ComponentPropsWithoutRef<'span'> {
  label: string;
  children?: React.ReactNode;
}

const ComposableDescription: React.FC<ComposableDescriptionProps> = ({
  className,
  label,
  children,
}) => {
  return (
    <span
      className={cn(
        'flex items-center justify-start text-muted-foreground text-sm',
        className,
      )}
    >
      {/* Adding a non-breaking space to reliably separate the text and link */}
      {label}&nbsp;
      {/* TODO: Add theming font and colors */}
      {children}
    </span>
  );
};

export default ComposableDescription;
