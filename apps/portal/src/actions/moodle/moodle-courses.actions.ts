"use server";

import { moodleServices } from "@/constants/moodle.constants";
import { SelectOptions } from "@/types/form-field.types";
// import { env } from "@/validation/env.validation";

const moodleUrl = "https://elearning.kippra.or.ke";
const token = process.env.MOODLE_SERVICE_TOKEN;
const functionName = moodleServices.core_course_get_courses;

export const getOnlineCourseOptions = async (): Promise<SelectOptions[]> => {
  const response = await fetch(
    `${moodleUrl}/webservice/rest/server.php?wstoken=${token}&wsfunction=${functionName}&moodlewsrestformat=json`,
  );
  const courses = await response.json();
  const moodleCourseOptions = courses.map(
    ({ id, displayname }: { id: number; displayname: string }) => ({
      value: id.toString(),
      optionLabel: displayname,
    }),
  );
  return moodleCourseOptions;
};
