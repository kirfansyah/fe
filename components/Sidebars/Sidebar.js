import Link from "next/link";
import {
  Home,
  BarChart3,
  BookOpen,
  FileText,
  MessageSquare,
  Library,
  Users,
  GraduationCap,
  Settings,
} from "lucide-react";

// import { Button } from "../components/ui/button";

export default function Sidebar() {
  const sidebarItems = [
    { icon: Home, label: "Home", active: true },
    { icon: BarChart3, label: "Dashboard", link: "/admin/dashboard" },
    { icon: BookOpen, label: "Course Management", link: "/course/management" },
    { icon: FileText, label: "Report", link: "/admin/report" },
    { icon: MessageSquare, label: "Feedback", link: "/course/management" },
    { icon: Library, label: "Library", link: "/course/management" },
    { icon: Users, label: "Employee Course", link: "/course/employee/course" },
    { icon: Users, label: "User Management", link: "/course/management" },
    { icon: GraduationCap, label: "Mastering", link: "/course/management" },
    { icon: Settings, label: "Setting", link: "/course/management" },
  ];

  return (
    <div className="w-64 pt-20 bg-white shadow-lg">
      {/* <div>
        <Button>Click me</Button>
      </div> */}
      <nav className="p-4 mt-6">
        {sidebarItems.map((item, index) => (
          <Link
            href={item.link || "#"}
            key={index}
            className={`w-full flex items-center px-12 py-4 rounded-lg text-left transition-colors duration-200 ${
              item.active
                ? "bg-slate-300 font-medium"
                : "hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <item.icon
              className={`w-5 h-5 mr-3 ${
                item.active ? "text-blue" : "text-gray-600"
              }`}
            />
            <span
              className={`font-medium ${
                item.active ? "text-blue" : "text-gray-600"
              }`}
            >
              {item.label}
            </span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
