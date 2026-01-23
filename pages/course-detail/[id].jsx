import { useRouter } from "next/router";
import CourseDetail from "@/components/Course/CourseDetail/courseDetail";
import CourseLayout from "@/layouts/CourseLayout";
import { decodeId } from "@/lib/id64";

export default function CourseDetailPage() {
  const { id } = useRouter().query;
  const breadCrumb = "/course/";
  const startCourse = "/course-start/";

  if (!id) return null;

  return (
    <CourseDetail
      id={decodeId(id)}
      breadCrumb={breadCrumb}
      startCourse={startCourse}
    />
  );
}

CourseDetailPage.layout = CourseLayout;
