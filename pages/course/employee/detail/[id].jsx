import { useRouter } from "next/router";
import CourseDetail from "@/components/Course/CourseDetail/courseDetail";
import CourseLayout from "@/layouts/CourseLayout";

export default function CourseDetailPage() {
  const { id } = useRouter().query;
  const breadCrumb = "/course/employee/course/";
  const startCourse = "/course/employee/start/";

  if (!id) return null;

  return (
    <CourseDetail id={id} breadCrumb={breadCrumb} startCourse={startCourse} />
  );
}

CourseDetailPage.layout = CourseLayout;
