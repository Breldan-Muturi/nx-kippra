import OrganizationForm from '@/app/(portal)/components/forms/organization-form/organization-form';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';

const organizationPromise = async (id: string) =>
  await db.organization.findUnique({
    where: { id },
    include: {
      image: { select: { fileUrl: true } },
    },
  });
export type OrganizationPromise = NonNullable<
  Awaited<ReturnType<typeof organizationPromise>>
>;

const OrganizationPage = async ({
  params: { organizationId },
}: {
  params: { organizationId: string };
}) => {
  const organization = await organizationPromise(organizationId);
  if (!organization || !organization.id) return redirect('/organizations');

  return <OrganizationForm organization={organization} />;
};

export default OrganizationPage;
