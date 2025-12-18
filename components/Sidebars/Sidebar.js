import { useContext, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import * as LucideIcons from "lucide-react";
import { LanguageContext } from "@/contexts/LanguageContext";
import { ProfileContext } from "@/contexts/profile/ProfileContext";

const { Menu, X, ChevronDown, ChevronRight } = LucideIcons;

export default function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const router = useRouter();
  const { stateLanguage } = useContext(LanguageContext);
  const { listLanguage } = stateLanguage;
  const { dataMenu, getMenu, isLoading } = useContext(ProfileContext);

  useEffect(() => {
    getMenu();
  }, []);

  console.log("Sidebar - dataMenu:", dataMenu);

  // Language mapping berdasarkan menu_code dari API
  const getMenuLabel = (menuCode, defaultLabel) => {
    const languageMap = {
      // Main Menus
      "MENU_HOME": listLanguage.home || "Home",
      "MENU_DASHBOARD": listLanguage.dashboard || "Dashboard",
      "MENU_COURSE_MGMT": listLanguage.course_management || "Course Management",
      "MENU_REPORT": listLanguage.report || "Report",
      "MENU_FEEDBACK": listLanguage.feedback || "Feedback",
      "MENU_LIBRARY_TP": listLanguage.library || "Library",
      "MENU_EMPLOYEE_COURSE": listLanguage.employee_course || "Employee Course",
      "MENU_USER_MGMT": listLanguage.user_management || "User Management",
      "MENU_MASTERING": listLanguage.mastering || "Mastering",
      
      // Submenu items (jika ada)
      "MENU_GROUPING": listLanguage.grouping || "Grouping",
      "MENU_CATEGORY_EBOOK": listLanguage.category_ebook || "Category Ebook",
      "MENU_ROLE_MGMT": listLanguage.role_management || "Role Management",
      "MENU_MENU_MGMT": listLanguage.menu_management || "Menu Management",
    };
    
    return languageMap[menuCode] || defaultLabel;
  };

  // Ambil hanya children dari menu "Trainer Portal"
  const getTrainerPortalMenu = () => {
    if (!dataMenu || dataMenu.length === 0) return [];
    
    const trainerPortal = dataMenu.find(
      menu => menu.menu_code === "HDR_TRAINER_PORTAL"
    );
    
    return trainerPortal?.children || [];
  };

  // Convert API data to sidebar structure
  const sidebarItems = getTrainerPortalMenu().map((item) => {
    const menuItem = {
      id: item.id_menu,
      icon: LucideIcons[item.menu_icon] || LucideIcons.BookOpen, // Langsung akses dari LucideIcons
      label: getMenuLabel(item.menu_code, item.menu_name),
      link: item.menu_url,
      permissions: item.permissions,
      menuCode: item.menu_code,
    };

    if (item.children && item.children.length > 0) {
      menuItem.submenu = item.children.map((child) => ({
        id: child.id_menu,
        icon: LucideIcons[child.menu_icon] || LucideIcons.BookOpen, // Langsung akses dari LucideIcons
        label: getMenuLabel(child.menu_code, child.menu_name),
        link: child.menu_url,
        permissions: child.permissions,
        menuCode: child.menu_code,
      }));
    }

    return menuItem;
  });

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

  // Auto-expand menu if current route matches submenu
  useEffect(() => {
    const currentPath = router.pathname;
    const newExpandedMenus = {};
    
    sidebarItems.forEach((item, index) => {
      if (item.submenu) {
        const hasActiveSubmenu = item.submenu.some(sub => currentPath === sub.link);
        if (hasActiveSubmenu) {
          newExpandedMenus[index] = true;
        }
      }
    });
    
    setExpandedMenus(prev => ({ ...prev, ...newExpandedMenus }));
  }, [router.pathname, dataMenu]);

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

  const toggleSubmenu = (index) => {
    setExpandedMenus(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const SidebarContent = () => {
    if (isLoading) {
      return (
        <div className="p-4 text-center text-gray-500">
          <div className="animate-pulse">
            {listLanguage.loading_menu || "Loading menu..."}
          </div>
        </div>
      );
    }

    if (!sidebarItems || sidebarItems.length === 0) {
      return (
        <div className="p-4 text-center text-gray-500">
          {listLanguage.no_menu_available || "No menu available"}
        </div>
      );
    }

    return (
      <nav className="p-2 space-y-1">
        {sidebarItems.map((item, index) => {
          const isActive = router.pathname === item.link;
          const hasSubmenu = item.submenu && item.submenu.length > 0;
          const isExpanded = expandedMenus[index];
          const hasActiveSubmenu = hasSubmenu && item.submenu.some(sub => router.pathname === sub.link);

          if (!item.permissions?.can_view) {
            return null;
          }

          return (
            <div key={item.id}>
              {/* Main Menu Item */}
              {hasSubmenu ? (
                <button
                  onClick={() => toggleSubmenu(index)}
                  className={`w-full flex items-center px-3 py-3 rounded-lg text-left transition-all duration-200 group ${
                    hasActiveSubmenu
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-700 hover:bg-blue-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 mr-3 flex-shrink-0 transition-transform duration-200 ${
                      hasActiveSubmenu 
                        ? "text-white" 
                        : "text-gray-500 group-hover:text-blue-600"
                    }`}
                  />
                  <span className={`font-normal text-sm flex-1 ${
                    hasActiveSubmenu ? "text-white font-medium" : ""
                  }`}>
                    {item.label}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                      hasActiveSubmenu ? "text-white" : "text-gray-500"
                    }`} />
                  ) : (
                    <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${
                      hasActiveSubmenu ? "text-white" : "text-gray-500"
                    }`} />
                  )}
                </button>
              ) : (
                <Link
                  href={item.link || "#"}
                  className={`w-full flex items-center px-3 py-3 rounded-lg text-left transition-all duration-200 group ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-700 hover:bg-blue-50 hover:text-gray-900"
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
              )}

              {/* Submenu Items */}
              {hasSubmenu && isExpanded && (
                <div className="mt-1 ml-4 space-y-1 pl-2">
                  {item.submenu.map((subItem) => {
                    const isSubActive = router.pathname === subItem.link;
                    
                    if (!subItem.permissions?.can_view) {
                      return null;
                    }

                    return (
                      <Link
                        href={subItem.link || "#"}
                        key={subItem.id}
                        className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-all duration-200 group ${
                          isSubActive
                            ? "bg-blue-100 text-blue-700 font-medium"
                            : "text-gray-600 hover:bg-blue-50 hover:text-gray-900"
                        }`}
                      >
                        <subItem.icon
                          className={`w-4 h-4 mr-2.5 flex-shrink-0 transition-transform duration-200 ${
                            isSubActive 
                              ? "text-blue-600" 
                              : "text-gray-400 group-hover:text-gray-600"
                          }`}
                        />
                        <span className="font-normal text-sm">
                          {subItem.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    );
  };

  return (
    <>
      {/* Mobile Toggle Button */}
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

      {/* Overlay for mobile - Below header */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
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
        {/* Sidebar Header - Mobile only */}
        {isMobile && isMobileMenuOpen && (
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
            <h2 className="text-base font-semibold text-gray-900">
              {listLanguage.menu || "Menu"}
            </h2>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        )}

        {/* Sidebar Content with desktop padding */}
        <div className="lg:pt-24 lg:px-4">
          <SidebarContent />
        </div>

        {/* Sidebar Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3 mt-4">
          <div className="text-xs text-gray-500 text-center">
            © 2025 {listLanguage.lms_system || "LMS System"}
          </div>
        </div>
      </aside>
    </>
  );
}