import {useContext,useEffect} from "react";
import WebLayout from "../layouts/WebLayout";
import { ProfileContext } from "../contexts/profile/ProfileContext";
import Link from "next/link";
import { LanguageContext } from "@/contexts/LanguageContext";

const Dashboard = () => {
  const { dataMenu, getMenu, getKaryawan, dataKaryawan } = useContext(ProfileContext);  
  const dataKaryawans = dataKaryawan?.length ? dataKaryawan[0] : [];
  const { stateLanguage } = useContext(LanguageContext);
  const { listLanguage, lang } = stateLanguage;
  
  useEffect(() => {
    getKaryawan();
    getMenu();
  }, []);

  const profileData = dataKaryawans || {};

  // Icon mapping untuk menu header
  const getIconPath = (menuCode) => {
    const iconMap = {
      "HDR_TRAINER_PORTAL": '/img/website.png',
      "HDR_PROFILE": '/img/profile.png',
      "HDR_COURSE": '/img/learning.png',
      "HDR_CALENDAR": '/img/calendar.png',
      "HDR_LIBRARY": '/img/bookshelf.png',
    };
    return iconMap[menuCode] || '/img/website.png'; // default icon
  };

  // Filter menu yang parent_id = null (header menu saja)
  const menuItems = dataMenu
    ?.filter(menu => menu.parent_id === null && menu.permissions?.can_view)
    .map(menu => ({
      id: menu.id_menu,
      label: menu.menu_name,
      icon: getIconPath(menu.menu_code),
      link: menu.menu_url,
      menuCode: menu.menu_code,
    })) || [];

  return (
    <WebLayout>
      {/* ✅ Hero Section - Solid Blue Background */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-semibold mb-4">
              {profileData.nama || ''}
            </h1>
            {/* Position & Company */}
            <p className="text-sm sm:text-base text-blue-100 mb-2">
              {profileData.position_name || 'Programmer'} - {profileData.company_name || 'PT. Riau Sakti United Plantations (Industry)'}
            </p>
            
            {/* Date & Time */}
            <p className="text-xs sm:text-sm text-blue-200">
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })} | {new Date().toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* ✅ Menu Grid - With Cards */}
      <div className="bg-gray-50 min-h-[60vh] flex items-center">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
          {menuItems.length > 0 ? (
            <div className="grid lg:grid-cols-5 gap-6 sm:gap-8">
              {menuItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.link}
                  className="group"
                >
                  {/* ✅ White Card with Border & Hover */}
                  <div className="bg-white rounded-xl p-6 sm:p-8 text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100">
                    {/* Icon Container */}
                    <div className="mb-4 flex justify-center">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
                        <img 
                          src={item.icon} 
                          alt={item.label}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                    
                    {/* Label */}
                    <p className="text-sm sm:text-base font-semibold text-gray-800 leading-tight">
                      {item.label}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <p>{listLanguage.loading || "Loading menu..."}</p>
            </div>
          )}
        </div>
      </div>
    </WebLayout>
  );
}

export default Dashboard;