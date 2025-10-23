<<<<<<< Updated upstream
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
=======
import { useContext, useState } from "react";
import Link from "next/link"; 
import { useRouter } from "next/router";
import { 
  Home, 
  BarChart3, 
  BookOpen, 
  FileText, 
  MessageSquare, 
  Library, 
  Users, 
  GraduationCap, 
  Settings 
>>>>>>> Stashed changes
} from "lucide-react";
import { LanguageContext } from "@/contexts/LanguageContext";

// import { Button } from "../components/ui/button";

export default function Sidebar() {
<<<<<<< Updated upstream
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
=======
  const [currentPage, setCurrentPage] = useState('Home');
  const { stateLanguage } = useContext(LanguageContext);
  const { listLanguage, lang } = stateLanguage;
  const sidebarItems = [ 
    { icon: Home, label: listLanguage.home, link :'/admin/home' },
    { icon: BarChart3, label: listLanguage.dashboard, link :'/admin/dashboard'},
    { icon: BookOpen, label: listLanguage.course_management, link :'/course/management' },
    { icon: FileText, label: listLanguage.report, link :'/course/1' },
    { icon: MessageSquare, label: listLanguage.feedback, link :'/course/2' },
    { icon: Library, label: listLanguage.library, link :'/course/3' },
    { icon: Users, label: listLanguage.employee_course, link :'/course/employee/course' },
    { icon: Users, label: listLanguage.user_management, link :'/course/5' },
    { icon: GraduationCap, label: listLanguage.mastering, link :'/course/6' },
    { icon: Settings, label: listLanguage.setting, link :'/course/7' },
  ];

  return (
      <aside className="w-64 bg-white shadow-sm min-h-screen rounded-lg">
        <nav className="p-4 space-y-1">
          {sidebarItems.map((item, index) => {
            const router = useRouter();
            const isActive = router.pathname === item.link; // berdasarkan URL
            return(
              <Link
              href={item.link || '#'}
              key={index}
              onClick={() => setCurrentPage(item.label)}
              className={`w-full flex items-center px-1 py-4 rounded-lg text-left transition-colors duration-1000 ${
                    isActive
                      ? 'bg-slate-300 font-medium'
                      : 'hover:bg-gray-100 hover:text-gray-900'
                  }`}
>>>>>>> Stashed changes
            >
              {item.label}
            </span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
