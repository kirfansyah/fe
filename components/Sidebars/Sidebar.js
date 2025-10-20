import { useState } from "react";
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
} from "lucide-react";

// import { Button } from "../components/ui/button";

export default function Sidebar() {
  const [currentPage, setCurrentPage] = useState('Home');
  const sidebarItems = [ 
    { icon: Home, label: 'Home' },
    { icon: BarChart3, label: 'Dashboard' , link :'/admin/dashboard'},
    { icon: BookOpen, label: 'Course Management', link :'/course/management' },
    { icon: FileText, label: 'Report', link :'/course/1' },
    { icon: MessageSquare, label: 'Feedback', link :'/course/2' },
    { icon: Library, label: 'Library', link :'/course/3' },
    { icon: Users, label: 'Employee Course', link :'/course/employee/course' },
    { icon: Users, label: 'User Management', link :'/course/5' },
    { icon: GraduationCap, label: 'Mastering', link :'/course/6' },
    { icon: Settings, label: 'Setting', link :'/course/7' },
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
              className={`w-full flex items-center px-12 py-4 rounded-lg text-left transition-colors duration-1000 ${
                    isActive
                      ? 'bg-slate-300 font-medium'
                      : 'hover:bg-gray-100 hover:text-gray-900'
                  }`}
            >
              <item.icon className={`w-5 h-5 mr-3 ${ isActive ? 'text-blue' : 'text-gray-600'}`} />
              <span className={`font-medium ${ isActive ? 'text-blue' : 'text-gray-600'}`}>{item.label}</span>
            </Link>
            );  
          })}
        </nav>
      </aside> 
  );
}
