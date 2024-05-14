import { getOnlineCourseOptions } from '@/actions/moodle/moodle-courses.actions';
import { getSingleProgram } from '@/actions/programmes/single.program.actions';
import ProgramForm from '@/app/(portal)/components/common/forms/program-form/program-form';
import programFields from '@/app/(portal)/components/common/forms/program-form/program-form-fields';
import { getProgramPrerequisiteOptions } from '@/helpers/program.helpers';

const UpdateProgramPage = async ({
  params: { programId },
}: {
  params: { programId: string };
}) => {
  const [programOptions, moodleCourseOptions, program] = await Promise.all([
    getProgramPrerequisiteOptions(),
    getOnlineCourseOptions(),
    getSingleProgram(programId),
  ]);
  const programForm = programFields(programOptions, moodleCourseOptions);
  return <ProgramForm {...{ programForm, program }} />;
};

export default UpdateProgramPage;
