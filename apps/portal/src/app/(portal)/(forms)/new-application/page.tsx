import { formApplication } from '@/actions/applications/form.applications.actions';
import ApplicationForm from '../../components/forms/application-form/application-form';

const NewApplicationPage = async () => {
  const adminApplicationForm = await formApplication();
  if ('error' in adminApplicationForm) {
    return (
      <div>
        There was an error in fetching information for this application:
        <br /> {adminApplicationForm.error}
      </div>
    );
  }

  return <ApplicationForm {...adminApplicationForm} />;
};

export default NewApplicationPage;
