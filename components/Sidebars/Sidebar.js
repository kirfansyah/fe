import { useContext, useState, useEffect } from "react";
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
  Settings,
  UserLock,
  BrickWall,
  Menu,
  X
} from "lucide-react";
import { LanguageContext } from "@/contexts/LanguageContext";

export default function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const { stateLanguage } = useContext(LanguageContext);
  const { listLanguage } = stateLanguage;

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [router.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const sidebarItems = [
    { icon: Home, label: listLanguage.home || "Beranda", link: "/admin/home" },
    {
      icon: BarChart3,
      label: listLanguage.dashboard || "Dasbor",
      link: "/admin/dashboard",
    },
    {
      icon: BookOpen,
      label: listLanguage.course_management || "Manajemen Kursus",
      link: "/course/management",
    },
    { icon: FileText, label: listLanguage.report || "Laporan", link: "/admin/report" },
    { icon: MessageSquare, label: listLanguage.feedback || "Umpan Balik", link: "/feedback/feedback" },
    { icon: Library, label: listLanguage.library || "Perpustakaan", link: "/library/ebook" },
    {
      icon: Users,
      label: listLanguage.employee_course || "Kursus Karyawan",
      link: "/course/employee/course",
    },
    { icon: Users, label: listLanguage.user_management || "Manajemen Pengguna", link: "/master/user" },
    { icon: UserLock, label: listLanguage.role_management || "Manajemen Akses", link: "/master/role" },
    { icon: BrickWall, label: listLanguage.menu_management || "Manajemen Menu", link: "/master/role-menu" },
    { icon: GraduationCap, label: listLanguage.mastering || "Penguasaan", link: "/course/6" },
    { icon: Settings, label: listLanguage.setting || "Pengaturan", link: "/course/7" },
  ];

  const SidebarContent = () => (
    <nav className="p-2 space-y-1">
      {sidebarItems.map((item, index) => {
        const isActive = router.pathname === item.link;
        return (
          <Link
            href={item.link || "#"}
            key={index}
            className={`w-full flex items-center px-3 py-3 rounded-lg text-left transition-all duration-200 group ${
              isActive
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <item.icon
              className={`w-5 h-5 mr-3 flex-shrink-0 transition-transform duration-200 ${
                isActive 
                  ? "text-white" 
                  : "text-gray-500 group-hover:text-blue-600"
              }`}
            />
            <span className={`font-normal text-sm ${
              isActive ? "text-white font-medium" : ""
            }`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* ✅ Mobile Toggle Button */}
      {isMobile && (
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden fixed top-20 right-4 z-30 p-2.5 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      )}

      {/* ✅ Overlay for mobile - Below header */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ✅ Sidebar - Fixed on mobile, relative in flex on desktop */}
      <aside
        className={`
          ${isMobile ? 'fixed' : 'relative'}
          lg:relative
          ${isMobile ? 'top-[72px]' : 'top-0'}
          lg:top-0
          left-0
          w-64 
          ${isMobile ? 'h-[calc(100vh-72px)]' : 'h-auto'}
          lg:h-auto
          bg-white 
          shadow-md
          transition-transform duration-300 ease-in-out
          ${isMobile ? 'z-20' : 'z-auto'}
          lg:z-auto
          overflow-y-auto
          flex-shrink-0
          ${isMobile && !isMobileMenuOpen ? '-translate-x-full' : 'translate-x-0'}
        `}
      >
        {/* ✅ Sidebar Header - Mobile only */}
        {isMobile && isMobileMenuOpen && (
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
            <h2 className="text-base font-semibold text-gray-900">Menu</h2>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        )}

        {/* ✅ Sidebar Content with desktop padding */}
        <div className="lg:pt-24 lg:px-4">
          <SidebarContent />
        </div>

        {/* ✅ Sidebar Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3 mt-4">
          <div className="text-xs text-gray-500 text-center">
            © 2025 LMS System
          </div>
        </div>
      </aside>
    </>
  );
}