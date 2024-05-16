import { getOnlineCourseOptions } from '@/actions/moodle/moodle-courses.actions';
import ProgramForm from '@/app/(portal)/components/forms/program-form/program-form';
import { getProgramPrerequisiteOptions } from '@/helpers/program.helpers';

const NewProgramPage = async () => {
  const [programOptions, moodleCourseOptions] = await Promise.all([
    getProgramPrerequisiteOptions(),
    getOnlineCourseOptions(),
  ]);

  return <ProgramForm {...{ programOptions, moodleCourseOptions }} />;
};

export default NewProgramPage;
