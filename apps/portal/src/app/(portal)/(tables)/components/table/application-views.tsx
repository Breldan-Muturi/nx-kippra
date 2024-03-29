"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";
import { FileCheck2, Send, ShieldX } from "lucide-react";
import React, { useState } from "react";
import ApplicantAction, { TableActionProps } from "./table-action";

interface ApplicationViewsProps {
  columnIds: string[];
  hiddenColumnArray: string[];
  isPending: boolean;
  isSomeSelected: boolean;
  updateViews: (hideColumns?: string) => void;
}

const ApplicationViews = ({
  isPending,
  isSomeSelected,
  updateViews,
  columnIds,
  hiddenColumnArray,
}: ApplicationViewsProps) => {
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
    const hideColumns = columnIds.filter((id) => !views.includes(id)).join(",");
    updateViews(hideColumns);
  };

  const clearViews = () => {
    setViews(defaultColumns);
    updateViews();
  };

  const applicationActions: TableActionProps[] = [
    {
      content: "Approve applications",
      icon: <FileCheck2 color="green" className="h-5 w-5" />,
      isPending,
      tooltipContentClassName: "text-green-600",
      className: "mr-2",
    },
    {
      content: "Reject applications",
      icon: <ShieldX color="red" className="h-5 w-5" />,
      isPending,
      tooltipContentClassName: "text-red-600",
      className: "mr-2",
    },

    {
      content: "Send mass emails",
      icon: <Send className="h-5 w-5" />,
      isPending,
    },
  ];

  return (
    <div className="flex items-center">
      {isSomeSelected &&
        applicationActions.map((action) => (
          <ApplicantAction key={action.content} {...action} />
        ))}
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={isPending}>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto hidden h-8 lg:flex"
            disabled={isPending}
          >
            <MixerHorizontalIcon className="mr-4 h-4 w-4" />
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

export default ApplicationViews;
