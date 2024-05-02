import TooltipIconButton from '@/components/buttons/tooltip-icon-button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertTriangle, ShieldAlert, Trash2 } from 'lucide-react';
import { ApplicationModalProps } from './application-modal-steps';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type ApplicationWarningProps = Pick<
  ApplicationModalProps,
  | 'participantWarnings'
  | 'organizationError'
  | 'handleWarning'
  | 'hasWarning'
  | 'formParticipants'
  | 'handleParticipants'
>;
const ApplicationWarnings = ({
  participantWarnings,
  organizationError,
  handleWarning,
  hasWarning,
  formParticipants,
  handleParticipants,
}: ApplicationWarningProps) => {
  const warningParticipants = participantWarnings?.filter(
    ({ email: participantEmail }) =>
      formParticipants?.map(({ email }) => email).includes(participantEmail),
  );

  return (
    <>
      {warningParticipants && warningParticipants.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 pb-2">
              <AlertTriangle className="size-5 text-yellow-600" />
              <CardTitle className="text-yellow-600">
                Participant Warning
              </CardTitle>
            </div>
            <CardDescription>
              We found the following participants in different applications for
              the same training session based on the provided emails
            </CardDescription>
            <CardContent className="p-0">
              <Table>
                <TableCaption>
                  Optionally remove the participants, your slots will remain
                  unchanged
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Participant Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Remove</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {warningParticipants.map(({ email, name }, i) => {
                    return (
                      <TableRow key={`${i}${name}`}>
                        <TableCell>{name}</TableCell>
                        <TableCell>{email}</TableCell>
                        <TableCell>
                          <TooltipIconButton
                            icon={<Trash2 className="size-4" />}
                            tooltipLabel={`Remove ${email}`}
                            className="bg-red-600/80 hover:bg-red-600 size-6"
                            onClick={() => handleParticipants(email)}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </CardHeader>
        </Card>
      )}
      {organizationError && (
        <Card className="flex items-center gap-4">
          <CardHeader>
            <div className="flex items-center gap-2 pb-2">
              <ShieldAlert className="size-5" color="red" />
              <CardTitle className="text-red-600">
                {organizationError.existingOrgName}
              </CardTitle>
            </div>
            <CardDescription>{`${organizationError.errorMessage}, proceed with this organization, or dismiss the popup, and submit
              the application with a different organization`}</CardDescription>
          </CardHeader>
          <Tooltip>
            <TooltipTrigger>
              <Switch
                className="mr-6 "
                checked={!hasWarning}
                disabled={!hasWarning}
                onCheckedChange={() => handleWarning(false)}
              />
            </TooltipTrigger>
            <TooltipContent>
              {hasWarning
                ? `Continue the application with ${organizationError.existingOrgName}`
                : 'To change this organization dismiss the popup, and apply with a different organization'}
            </TooltipContent>
          </Tooltip>
        </Card>
      )}
    </>
  );
};

export default ApplicationWarnings;
