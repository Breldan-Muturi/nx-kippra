'use client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MixerHorizontalIcon } from '@radix-ui/react-icons';
import { FileCheck2, Send, ShieldX } from 'lucide-react';
import { useState } from 'react';
import TooltipActionButton, {
  TooltipActionButtonProps,
} from '../buttons/tooltip-action-button';

type TableViewsProps = {
  columnIds: string[];
  hiddenColumnArray: string[];
  isPending: boolean;
  updateViews: (hideColumns?: string) => void;
  actions?: TooltipActionButtonProps[];
};

const TableViews = ({
  isPending,
  updateViews,
  columnIds,
  hiddenColumnArray,
  actions,
}: TableViewsProps) => {
  const defaultColumns = columnIds.filter(
    (id) => !hiddenColumnArray.includes(id),
  );
  const [views, setViews] = useState<string[]>(defaultColumns);

  const handleSelected = (event: Event, columnId: string) => {
    event.preventDefault();
    setViews((currentView) => {
      if (currentView.includes(columnId)) {
        return currentView.filter((id) => id !== columnId);
      } else {
        return [...currentView, columnId];
      }
    });
  };

  const applyViews = () => {
    const hideColumns = columnIds.filter((id) => !views.includes(id)).join(',');
    updateViews(hideColumns);
  };

  const clearViews = () => {
    setViews(defaultColumns);
    updateViews();
  };

  const applicationActions: TooltipActionButtonProps[] = [
    {
      title: 'Approve applications',
      icon: <FileCheck2 color="green" className="w-5 h-5" />,
      disabled: isPending,
      tooltipContentClassName: 'text-green-600',
      className: 'mr-2',
    },
    {
      title: 'Reject applications',
      icon: <ShieldX color="red" className="w-5 h-5" />,
      disabled: isPending,
      tooltipContentClassName: 'text-red-600',
      className: 'mr-2',
    },

    {
      title: 'Send mass emails',
      icon: <Send className="w-5 h-5" />,
      disabled: isPending,
    },
  ];

  return (
    <div className="flex items-center">
      {actions &&
        applicationActions.map((action) => (
          <TooltipActionButton key={action.title} {...action} />
        ))}
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={isPending}>
          <Button
            variant="outline"
            size="sm"
            className="hidden h-8 ml-auto lg:flex"
            disabled={isPending}
          >
            <MixerHorizontalIcon className="w-4 h-4 mr-4" />
            View
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
          {columnIds.map((id) => (
            <DropdownMenuCheckboxItem
              key={id}
              className="capitalize"
              checked={views.includes(id)}
              onSelect={(e) => handleSelected(e, id)}
            >
              {id}
            </DropdownMenuCheckboxItem>
          ))}
          <DropdownMenuItem className="items-center space-x-2">
            <Button
              variant="default"
              size="sm"
              disabled={isPending}
              className="flex-grow"
              onClick={applyViews}
            >
              Apply
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              className="flex-grow"
              onClick={clearViews}
            >
              Clear
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default TableViews;
