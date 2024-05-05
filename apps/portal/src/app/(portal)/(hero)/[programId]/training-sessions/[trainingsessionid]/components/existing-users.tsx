'use client';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import React from 'react';
import ParticipantDetail from './participant-details';
import { cn } from '@/lib/utils';
import { ParticipantSelectOption } from '@/validation/applications/user.application.validation';

interface ExistingUsersProps extends React.ComponentPropsWithoutRef<'button'> {
  onItemSelect: (value: string) => void;
  participantDetails: ParticipantSelectOption[];
  selectedUserIds?: string[];
}

const ExistingUsers = ({
  onItemSelect,
  selectedUserIds,
  participantDetails,
  className,
  ...btnProps
}: ExistingUsersProps) => {
  const disabled =
    participantDetails.filter(
      ({ userId }) =>
        selectedUserIds && userId && !selectedUserIds?.includes(userId),
    ).length === 0;
  return (
    <Popover>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          role="combobox"
          className={cn('justify-between', className)}
          disabled={disabled}
          {...btnProps}
        >
          {selectedUserIds && selectedUserIds.length > 0
            ? `${selectedUserIds.length} registered participant${selectedUserIds.length > 1 ? 's' : ''} added`
            : 'Add registered participant(s)'}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0 popover-width-trigger">
        <Command>
          <CommandInput placeholder="Select existing users" />
          <CommandEmpty>Matching user not found</CommandEmpty>
          <CommandGroup>
            {participantDetails.map((participantDetail, i) => {
              const { userId } = participantDetail;
              if (!userId) return null;
              const key = `${i}${userId}`;
              const isSelected = selectedUserIds
                ? selectedUserIds?.includes(userId)
                : false;
              return (
                <CommandItem
                  key={key}
                  value={userId}
                  onSelect={() => onItemSelect(userId)}
                >
                  <ParticipantDetail
                    isSelected={isSelected}
                    {...participantDetail}
                  />
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ExistingUsers;
