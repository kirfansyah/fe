import EmployeeCourse from "@/components/Course/EmployeeCourse";
import Admin from "@/layouts/Admin";

// ... state dan logic tetap sama
export default function CoursePage() {
  const link = "/course/employee/detail/";
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <EmployeeCourse link={link} />
    </div>
  );
}

CoursePage.layout = Admin;
