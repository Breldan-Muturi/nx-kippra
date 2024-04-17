import { getProgramPrerequisiteOptions } from '@/helpers/program.helpers';
import React from 'react';
import ProgramForm from '@/app/(portal)/components/common/program-form/program-form';
import { getOnlineCourseOptions } from '@/actions/moodle/moodle-courses.actions';

const NewProgramPage = async () => {
  const [programOptions, moodleCourses] = await Promise.all([
    getProgramPrerequisiteOptions(),
    getOnlineCourseOptions(),
  ]);

  return (
    <ProgramForm
      programOptions={programOptions}
      moodleCourseOptions={moodleCourses}
    />
  );
};

export default NewProgramPage;
