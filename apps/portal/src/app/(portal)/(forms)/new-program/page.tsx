import { getOnlineCourseOptions } from '@/actions/moodle/moodle-courses.actions';
import ProgramForm from '@/app/(portal)/components/common/forms/program-form/program-form';
import { getProgramPrerequisiteOptions } from '@/helpers/program.helpers';
import programFields from '../../components/common/forms/program-form/program-form-fields';

const NewProgramPage = async () => {
  const [programOptions, moodleCourses] = await Promise.all([
    getProgramPrerequisiteOptions(),
    getOnlineCourseOptions(),
  ]);

  const programForm = programFields(programOptions, moodleCourses);

  return <ProgramForm programForm={programForm} />;
};

export default NewProgramPage;
