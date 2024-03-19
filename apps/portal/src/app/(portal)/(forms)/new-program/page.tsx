import { getProgramPrerequisiteOptions } from "@/helpers/program.helpers";
import React from "react";
import AddProgramForm from "../components/add-program-form";
import { getOnlineCourseOptions } from "@/actions/moodle/moodle-courses.actions";

const NewProgramPage = async () => {
  const programOptionsPromise = getProgramPrerequisiteOptions();
  const moodleCoursesPromise = getOnlineCourseOptions();

  const [programOptions, moodleCourses] = await Promise.all([
    programOptionsPromise,
    moodleCoursesPromise,
  ]);
  return (
    <AddProgramForm
      programOptions={programOptions}
      moodleCourseOptions={moodleCourses}
    />
  );
};

export default NewProgramPage;
