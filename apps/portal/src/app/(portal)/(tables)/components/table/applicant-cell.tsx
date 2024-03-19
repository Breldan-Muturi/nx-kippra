import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { avatarFallbackName } from "@/helpers/user.helper";
import { cn } from "@/lib/utils";

interface ApplicantCellProps extends React.ComponentPropsWithoutRef<"div"> {
  applicantName: string;
  applicantImage?: string;
  applicationOrganization?: string | null;
}

const ApplicantCell = ({
  applicantName,
  applicantImage,
  applicationOrganization,
  className,
  ...props
}: ApplicantCellProps) => {
  let applicationOrganizationLabel: string | undefined | null;
  if (applicationOrganization) {
    if (applicationOrganization.length > 15) {
      applicationOrganizationLabel = `${applicationOrganization.slice(0, 14)}...`;
    } else {
      applicationOrganizationLabel = applicationOrganization;
    }
  }
  return (
    <div className={cn("flex items-center space-x-4", className)} {...props}>
      <Avatar>
        <AvatarImage
          src={applicantImage}
          alt={`${applicantName}'s profile image`}
          title={`${applicantName}'s profile image`}
        />
        <AvatarFallback>{avatarFallbackName(applicantName)}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col items-start justify-start">
        <p>{applicantName}</p>
        {applicationOrganizationLabel && (
          <p className="truncate font-semibold text-green-600">
            {applicationOrganization}
          </p>
        )}
      </div>
    </div>
  );
};

export default ApplicantCell;
