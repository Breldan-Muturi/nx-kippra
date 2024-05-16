import OrganizationForm from '@/app/(portal)/components/forms/organization-form/organization-form';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';

const OrganizationPage = async ({
  params: { organizationId },
}: {
  params: { organizationId: string };
}) => {
  const organization = await db.organization.findUnique({
    where: { id: organizationId },
  });
  if (!organization || !organization.id) return redirect('/organizations');

  return <OrganizationForm organization={organization} />;
};

export default OrganizationPage;
