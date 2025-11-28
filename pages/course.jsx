import EmployeeCourse from "@/components/Course/EmployeeCourse";
import CourseLayout from "@/layouts/CourseLayout";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

// ... state dan logic tetap sama
export default function CoursePage() {
  const link = "/course-detail/";
  return (
    <CourseLayout>
      <div className="p-6 space-y-2">
        {/* Breadcrumb */}
        <Card className="rounded-lg shadow-md bg-gradient-to-r from-blue-900 to-blue-500 text-white">
          <CardContent className="flex items-center text-base font-semibold text-white space-x-3 p-6">
            <Link href="/" className="">
              Home
            </Link>
            <ChevronRight className="w-5 h-5 text-gray-500" />
            <Link href="/course" className="">
              Courses
            </Link>
          </CardContent>
        </Card>
        <EmployeeCourse link={link} />
      </div>
    </CourseLayout>
  );
  //   return <EmployeeCourse />;
}
