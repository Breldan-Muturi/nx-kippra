import { DynamicParticipantOption } from '@/actions/participants/application.participants.actions';
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
import { cn } from '@/lib/utils';
import ApplicationParticipantInfo from './application-participant-info';

type ApplicationParticipantsOrganizationProps =
  React.ComponentPropsWithoutRef<'button'> & {
    onItemSelect: (value: DynamicParticipantOption) => void;
    participantOptions: DynamicParticipantOption[];
    selectedParticipantIds: string[];
  };

const ApplicationParticipantsOrganization = ({
  onItemSelect,
  participantOptions,
  selectedParticipantIds,
  className,
  disabled: isPending,
  ...props
}: ApplicationParticipantsOrganizationProps) => {
  const noParticipants = participantOptions.length < 1;

  const allParticpantsSelected = participantOptions.every(({ id }) =>
    selectedParticipantIds.includes(id),
  );

  const isDisabled = [isPending, noParticipants, allParticpantsSelected].some(
    Boolean,
  );

  let btnText: string = 'Add organization participants';
  if (isPending) {
    btnText = 'Fetching participants info...';
  } else if (noParticipants) {
    btnText = 'No organization participants';
  } else if (allParticpantsSelected) {
    btnText = 'All participants are selected';
  }
  return (
    <Popover>
      <PopoverTrigger asChild disabled={isDisabled}>
        <Button
          variant="outline"
          role="combobox"
          className={cn('justify-between', className)}
          disabled={isDisabled}
          {...props}
        >
          {btnText}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0 popover-width-trigger">
        <Command>
          <CommandInput placeholder="Select organization users" />
          <CommandEmpty>No matching users</CommandEmpty>
          <CommandGroup>
            {participantOptions.map((participantInfo, i) => {
              const isEnrolled = participantInfo._count.applications > 0;
              const isSelected = selectedParticipantIds.includes(
                participantInfo.id,
              );
              return (
                <CommandItem
                  key={`${i}${participantInfo.id}`}
                  value={participantInfo.id}
                  onSelect={() => onItemSelect(participantInfo)}
                  disabled={isSelected}
                >
                  <ApplicationParticipantInfo
                    participantInfo={participantInfo}
                    isSelected={isSelected}
                    isEnrolled={isEnrolled}
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

export default ApplicationParticipantsOrganization;
