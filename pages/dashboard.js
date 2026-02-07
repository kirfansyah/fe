import { useContext, useEffect } from "react";
import WebLayout from "../layouts/WebLayout";
import { ProfileContext } from "../contexts/profile/ProfileContext";
import Link from "next/link";
import { LanguageContext } from "@/contexts/LanguageContext";

const Dashboard = () => {
  const { dataMenu, getMenu, getKaryawan, dataKaryawan } = useContext(ProfileContext); 
  const { stateLanguage } = useContext(LanguageContext);
  const { listLanguage } = stateLanguage;
  
  useEffect(() => {
    getKaryawan();
    getMenu();
  }, []);
  
  const profileData = dataKaryawan || {};
  
  const getMenuLabel = (menuCode, defaultLabel) => {
    const languageMap = {
      "HDR_TRAINER_PORTAL": listLanguage.training_portal || "Training Portal",
      "HDR_PROFILE": listLanguage.profile || "Profile",
      "HDR_COURSE": listLanguage.course || "Course",
      "HDR_CALENDAR": listLanguage.calendar || "Calendar",
      "HDR_LIBRARY": listLanguage.library || "Library"
    };
    return languageMap[menuCode] || defaultLabel;
  };

  const getIconEmoji = (menuCode) => {
    const emojiMap = {
      "HDR_TRAINER_PORTAL": "🎓",
      "HDR_PROFILE": "👤",
      "HDR_COURSE": "📚",
      "HDR_CALENDAR": "📅",
      "HDR_LIBRARY": "📖",
    };
    return emojiMap[menuCode] || "🏢";
  };

  const getPortalColor = (index) => {
    const colors = [
      { bg: 'bg-[#41afaa]', hover: 'hover:shadow-[#41afaa]/40' }, // Teal
      { bg: 'bg-[#466eb4]', hover: 'hover:shadow-[#466eb4]/40' }, // Blue
      { bg: 'bg-[#00a0e1]', hover: 'hover:shadow-[#00a0e1]/40' }, // Sky Blue
      { bg: 'bg-[#e6a532]', hover: 'hover:shadow-[#e6a532]/40' }, // Gold
      { bg: 'bg-[#d7642c]', hover: 'hover:shadow-[#d7642c]/40' }, // Orange
      { bg: 'bg-[#af4b92]', hover: 'hover:shadow-[#af4b92]/40' }, // Purple
    ];
    return colors[index % colors.length];
  };

  const getMenuDescription = (menuCode) => {
    const descriptionMap = {
      "HDR_TRAINER_PORTAL": "Course Management for Trainers.",
      "HDR_PROFILE": "Track your personal development progress.",
      "HDR_COURSE": "Access your course materials.",
      "HDR_CALENDAR": "View your training schedule.",
      "HDR_LIBRARY": "A collection of eBooks for your personal growth."
    };
    return descriptionMap[menuCode] || "Access your workspace and enhance your skills";
  };

  const menuItems = dataMenu
    ?.filter(menu => menu.parent_id === null && menu.permissions?.can_view)
    .map(menu => ({
      id: menu.id_menu,
      label: getMenuLabel(menu.menu_code, menu.menu_name),
      emoji: getIconEmoji(menu.menu_code),
      link: menu.menu_url,
      menuCode: menu.menu_code,
      description: getMenuDescription(menu.menu_code)
    })) || [];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good Morning', emoji: '☀️' };
    if (hour < 18) return { text: 'Good Afternoon', emoji: '🌤️' };
    return { text: 'Good Evening', emoji: '🌙' };
  };

  const greeting = getGreeting();

  return (
    <WebLayout>
      {/* Custom animations dan pattern yang gak ada di Tailwind */}
      <style jsx>{`
        @keyframes slideRight {
          0% { transform: translateX(0); }
          100% { transform: translateX(200%); }
        }
        
        @keyframes slideLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-200%); }
        }

        .animate-slide-right {
          animation: slideRight 15s linear infinite;
        }

        .animate-slide-left {
          animation: slideLeft 12s linear infinite;
        }

        /* Blue gradient text yang lebih smooth */
        .text-gradient-sambu {
          background: linear-gradient(135deg, #0047AB 0%, #3399FF 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* Pattern S background */
        .sambu-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 20 Q70 30 70 50 Q70 70 50 80 Q30 70 30 50 Q30 30 50 20' fill='%230066CC' opacity='0.5'/%3E%3C/svg%3E");
          background-size: 200px 200px;
        }
      `}</style>

      <div className="min-h-screen bg-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="fixed inset-0 sambu-pattern opacity-[0.03] pointer-events-none" />

        {/* Blue Wave Decoration */}
        <div 
          className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-br from-blue-800 to-blue-600 pointer-events-none z-0"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 0 100%)' }}
        />

        {/* Animated Accent Lines */}
        <div className="absolute top-[20%] -left-[20%] w-1/2 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-slide-right" />
        <div className="absolute top-[60%] -right-[20%] w-2/5 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-slide-left" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* Sambu Branding Header */}
          <div className="flex items-center gap-4 mb-12">
            <div className="relative">
              {/* Logo with double glow */}
              <div className="w-[60px] h-[60px] bg-gradient-to-br from-blue-800 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-500/30">
                S
              </div>
              {/* Outer glow */}
              <div className="absolute inset-[-4px] bg-gradient-to-br from-blue-400 to-blue-800 rounded-[18px] -z-10 opacity-50 blur-md" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-black text-white tracking-tight">Sambu Learning Management System</h2>
              <p className="text-sm text-white font-semibold">Empowering Growth Through Knowledge</p>
            </div>
          </div>

          {/* Hero Section */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 mb-12 shadow-xl border-2 border-blue-100 relative overflow-hidden">
            {/* Top gradient line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-800 via-blue-400 to-blue-800" />
            
            <div className="relative">
              {/* Greeting Badge */}
              <div className="inline-flex items-center gap-2 px-5 py-2 bg-blue-50 border-2 border-blue-300 rounded-full text-blue-900 font-bold text-sm mb-6">
                <span>{greeting.emoji}</span>
                <span>{greeting.text}</span>
              </div>

              {/* Title with gradient */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 leading-tight text-gradient-sambu">
                Welcome, {profileData.nama || "User"}
              </h1>

              <p className="text-xl text-gray-600 mb-2">
                {profileData.position_name || "Position"}
              </p>
              <p className="text-base text-gray-500 font-semibold">
                {profileData.company_name || "Sambu Group"}
              </p>
            </div>
          </div>

          {/* Portal Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-blue-900 mb-2">Your Learning Portals</h2>
            <p className="text-lg text-gray-600">Select a portal to continue your journey</p>
          </div>

          {/* Portal Grid */}
          {menuItems.length > 0 ? (
            <div className="grid lg:grid-cols-3 gap-8">
              {menuItems.map((item, index) => {
                const colorScheme = getPortalColor(index);
                return (
                  <Link
                    key={item.id}
                    href={item.link}
                    className={`group relative ${colorScheme.bg} rounded-3xl p-10 transition-all duration-500 hover:shadow-2xl ${colorScheme.hover} hover:-translate-y-2 text-white`}
                  >
                    {/* Content */}
                    <div className="relative z-10 text-center">
                      {/* Icon */}
                      <div className="w-20 h-20 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-2xl flex items-center justify-center text-5xl mb-6 mx-auto transition-all duration-500 group-hover:bg-white/30 group-hover:scale-110 group-hover:rotate-3">
                        {item.emoji}
                      </div>

                      {/* Title */}
                      <h3 className="text-2xl font-black text-white mb-3">
                        {item.label}
                      </h3>

                      {/* Description */}
                      <p className="text-white/90 leading-relaxed mb-6 text-sm">
                        {item.description}
                      </p>

                      {/* Action Button */}
                      <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/40 text-white rounded-xl font-bold text-sm transition-all duration-300 group-hover:bg-white/30 group-hover:gap-4 group-hover:scale-105">
                        <span>Learn More</span>
                        <span>→</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <p>{listLanguage.loading || "Loading..."}</p>
            </div>
          )}

          {/* Sambu Badge Footer */}
          <div className="text-center mt-16 py-8">
            <div className="inline-flex items-center gap-3 px-8 py-4 bg-blue-50 border-2 border-blue-300 rounded-full text-blue-900 font-bold">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-800 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-black">
                S
              </div>
              <span>Powered by Sambu Group Learning Management System</span>
            </div>
          </div>

        </div>
      </div>
    </WebLayout>
  );
}

export default Dashboard;