import { getOnlineCourseOptions } from '@/actions/moodle/moodle-courses.actions';
import { getSingleProgram } from '@/actions/programmes/single.program.actions';
import ProgramForm from '@/app/(portal)/components/forms/program-form/program-form';
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
  return <ProgramForm {...{ programOptions, moodleCourseOptions, program }} />;
};

export default UpdateProgramPage;
