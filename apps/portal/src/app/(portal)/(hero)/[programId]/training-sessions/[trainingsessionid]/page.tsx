import { formApplication } from '@/actions/applications/form.applications.actions';
import ApplicationForm from '@/app/(portal)/components/forms/application-form/application-form';

interface ApplicationPageProps {
  params: {
    programId: string;
    trainingsessionid: string;
  };
}

const ApplicationPage = async ({
  params: { trainingsessionid },
}: ApplicationPageProps) => {
  const applicationForm = await formApplication(trainingsessionid);
  if ('error' in applicationForm)
    return (
      <div>
        Failed to load application form due to a server error:
        <br />
        {applicationForm.error}
      </div>
    );

  return <ApplicationForm {...applicationForm} />;
};

export default ApplicationPage;
