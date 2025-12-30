import { Menu, Transition } from "@headlessui/react";
import { React, Fragment, useEffect, useContext, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { AuthContext } from "../contexts/AuthContext";
import ToggleSwitch from "components/ToggleSwitch/ToggleSwitch";
import { LanguageContext } from "contexts/LanguageContext";
import { ProfileContext } from "../contexts/profile/ProfileContext";
import { 
    Bell, 
    BookOpen, 
    Award, 
    AlertCircle, 
    CheckCircle,
    Loader2,
    ChevronRight,
    X
} from "lucide-react";
import ChangePasswordModal from "components/ChangePasswordModal";
import { useRoles } from "@/hooks/useRoles";

const Header = () => {
    const { stateLanguage, changeLanguage } = useContext(LanguageContext); 
    const { getSession, stateAuth, Logout } = useContext(AuthContext);
    const { isAuthenticated } = stateAuth;
    const router = useRouter();
    const { pathname } = router;
    const { listLanguage } = stateLanguage;
    const { fetchNotification } = useRoles();

    const onLanguageChange = (checked) => {
        changeLanguage(checked ? "id" : "en");
    };

    const { getKaryawan, dataKaryawan } = useContext(ProfileContext);

    // Notification states
    const [notifications, setNotifications] = useState([]);
    const [loadingNotifications, setLoadingNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
    
    // Mobile detection state
    const [isMobile, setIsMobile] = useState(false);
    
    useEffect(() => {
        getSession();
        getKaryawan();
    }, []);
    
    // Detect mobile screen
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    
    // Fetch notifications
    const loadNotifications = useCallback(async () => {
        try {
          setLoadingNotifications(true);
          const result = await fetchNotification();
          if (result?.data) {
            setNotifications(result.data);
            setUnreadCount(result.data.filter(n => !n.is_read).length);
          }
        } catch (error) {
          console.error('Error loading notifications:', error);
        } finally {
          setLoadingNotifications(false);
        }
    }, [fetchNotification]);
    
    // Load notifications on mount and set interval
    useEffect(() => {
        if (isAuthenticated) {
          loadNotifications();
          
          // Refresh notifications every 30 seconds
          const interval = setInterval(loadNotifications, 30000);
          return () => clearInterval(interval);
        }
    }, [isAuthenticated, loadNotifications]);
    
    // Get notification icon based on category
    const getNotificationIcon = (category) => {
        switch (category) {
          case 'course':
            return <BookOpen className="w-4 h-4 text-blue-500" />;
          case 'certificate':
            return <Award className="w-4 h-4 text-amber-500" />;
          case 'warning':
            return <AlertCircle className="w-4 h-4 text-orange-500" />;
          case 'success':
            return <CheckCircle className="w-4 h-4 text-green-500" />;
          default:
            return <Bell className="w-4 h-4 text-gray-500" />;
        }
    };
    
    // Get notification background color
    const getNotificationBg = (category, isRead) => {
        if (isRead) return 'bg-white';
        switch (category) {
          case 'course':
            return 'bg-blue-50';
          case 'certificate':
            return 'bg-amber-50';
          case 'warning':
            return 'bg-orange-50';
          case 'success':
            return 'bg-green-50';
          default:
            return 'bg-gray-50';
        }
    };
    
    // Format time ago
    const formatTimeAgo = (dateString) => {
          const date = new Date(dateString);
          const now = new Date();
          const diffInSeconds = Math.floor((now - date) / 1000);
          
          if (diffInSeconds < 60) return listLanguage.just_now || 'Baru saja';
          if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} ${listLanguage.minutes_ago || 'menit lalu'}`;
          if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ${listLanguage.hours_ago || 'jam lalu'}`;
          if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ${listLanguage.days_ago || 'hari lalu'}`;
          return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    };
    
    // Handle mark as read
    const handleMarkAsRead = async (notificationId) => {
        try {
          // Uncomment when API is ready
          // if (markNotificationRead) {
          //   await markNotificationRead(notificationId);
          // }
          setNotifications(prev => 
            prev.map(n => n.id_notification === notificationId ? { ...n, is_read: true } : n)
          );
          setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
          console.error('Error marking notification as read:', error);
        }
    };
    
    // Handle mark all as read
    const handleMarkAllAsRead = async () => {
        try {
          // Call API to mark all as read if available
          setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
          setUnreadCount(0);
        } catch (error) {
          console.error('Error marking all notifications as read:', error);
        }
    };

    const [showChangePassword, setShowChangePassword] = useState(false);

    return ( 
        <>
            <header className='flex items-center w-full h-16 bg-transparent sticky top-0 left-0 z-99 backdrop-blur backdrop-filter'>
                <div className='relative w-full container mx-auto flex items-center justify-between h-full px-4'>
                    <div className='flex items-center'>
                        <a href='/'>
                            <img src='/img/logo-small.png' width={70} />
                        </a>
                    </div>
                    <div className='flex items-center'>
                        <ul className='flex justify-between items-center space-x-3 select-none'>
                            
                            {/* Notification Bell */}
                            {isAuthenticated && (
                              <li className='flex items-center relative'>
                                <Menu as='div' className="relative">
                                  <Menu.Button 
                                    className='w-10 h-10 rounded-full cursor-pointer flex items-center justify-center relative hover:bg-gray-100 transition-colors'
                                    onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                                  >
                                    <Bell className="w-6 h-6 text-blue-900" />
                                    {unreadCount > 0 && (
                                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                      </span>
                                    )}
                                  </Menu.Button>
            
                                  <Transition
                                    as={Fragment}
                                    enter='transition ease-out duration-200'
                                    enterFrom='transform opacity-0 scale-95 -translate-y-2'
                                    enterTo='transform opacity-100 scale-100 translate-y-0'
                                    leave='transition ease-in duration-150'
                                    leaveFrom='transform opacity-100 scale-100 translate-y-0'
                                    leaveTo='transform opacity-0 scale-95 -translate-y-2'
                                  >
                                    <Menu.Items 
                                      className={`${
                                        isMobile 
                                          ? 'fixed left-4 right-4 top-16' 
                                          : 'absolute right-0 mt-2 w-96'
                                      } origin-top-right rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden z-[100]`}
                                    >
                                      {/* Header */}
                                      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                                        <div className="flex items-center justify-between gap-2">
                                          <div className="flex items-center gap-2 min-w-0 flex-1">
                                            <Bell className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                            <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                                              {listLanguage.notifications || 'Notifikasi'}
                                            </h3>
                                            {unreadCount > 0 && (
                                              <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-semibold rounded-full">
                                                {unreadCount}
                                              </span>
                                            )}
                                          </div>
                                          {unreadCount > 0 && (
                                            <button
                                              onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleMarkAllAsRead();
                                              }}
                                              className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline whitespace-nowrap flex-shrink-0"
                                            >
                                                {listLanguage.mark_all_read || 'Tandai semua'}
                                            </button>
                                          )}
                                        </div>
                                      </div>
                
                                      {/* Notification List */}
                                      <div className="max-h-[60vh] sm:max-h-96 overflow-y-auto">
                                        {loadingNotifications ? (
                                          <div className="flex items-center justify-center py-8">
                                            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                                          </div>
                                        ) : notifications.length > 0 ? (
                                          notifications.slice(0, 5).map((notif) => (
                                            <Menu.Item key={notif.id_notification}>
                                              {({ active }) => (
                                                <div
                                                  className={`px-4 py-3 border-b border-gray-50 cursor-pointer transition-all ${
                                                    getNotificationBg(notif.category, notif.is_read)
                                                  } ${active ? 'bg-gray-100' : ''}`}
                                                  onClick={() => !notif.is_read && handleMarkAsRead(notif.id_notification)}
                                                >
                                                  <div className="flex gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                      notif.is_read ? 'bg-gray-100' : 'bg-white shadow-sm'
                                                    }`}>
                                                      {getNotificationIcon(notif.category)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                      <div className="flex items-start justify-between gap-2">
                                                        <p className={`text-sm font-semibold ${notif.is_read ? 'text-gray-600' : 'text-gray-900'}`}>
                                                          {notif.title}
                                                        </p>
                                                        {!notif.is_read && (
                                                          <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5"></span>
                                                        )}
                                                      </div>
                                                      <p className={`text-xs mt-1 line-clamp-2 ${notif.is_read ? 'text-gray-500' : 'text-gray-700'}`}>
                                                        {notif.message}
                                                      </p>
                                                      <p className="text-xs text-gray-400 mt-1.5">
                                                        {formatTimeAgo(notif.created_at)}
                                                      </p>
                                                    </div>
                                                  </div>
                                                </div>
                                              )}
                                            </Menu.Item>
                                          ))
                                        ) : (
                                          <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                              <Bell className="w-6 h-6 text-gray-400" />
                                            </div>
                                            <p className="text-sm text-gray-500">{listLanguage.no_notifications || 'Tidak ada notifikasi'}</p>
                                            <p className="text-xs text-gray-400 mt-1">{listLanguage.no_notifications_subtitle || 'Kamu akan menerima notifikasi di sini'}</p>
                                          </div>
                                        )}
                                      </div>
                
                                      {/* Footer */}
                                      {notifications.length > 0 && (
                                        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                                          <button
                                            onClick={() => router.push('/notifications')}
                                            className="w-full flex items-center justify-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                                          >
                                            {listLanguage.view_all_notifications || 'Lihat semua notifikasi'}
                                            <ChevronRight className="w-4 h-4" />
                                          </button>
                                        </div>
                                      )}
                                    </Menu.Items>
                                  </Transition>
                                </Menu>
                              </li>
                            )}

                            {isAuthenticated ? (
                                <li className='flex items-center px-1 border-l'>
                                    <label className='pl-2 text-blue-900 font-normal mr-2 lg:block hidden'>
                                        {dataKaryawan?.nama}
                                    </label>
                                    <Menu as='div' className="relative">
                                        <div> 
                                            <Menu.Button className='w-10 h-10 rounded-full cursor-pointer flex items-center relative border-none overflow-hidden'>
                                                <img
                                                    src='/img/user.png'
                                                    style={{ objectFit: "cover" }}
                                                    className='absolute top-0 left-0'
                                                />
                                            </Menu.Button>
                                            <Transition
                                                as={Fragment}
                                                enter='transition ease-out duration-100'
                                                enterFrom='transform opacity-0 scale-95'
                                                enterTo='transform opacity-100 scale-100'
                                                leave='transition ease-in duration-75'
                                                leaveFrom='transform opacity-100 scale-100'
                                                leaveTo='transform opacity-0 scale-95'
                                            >
                                                <Menu.Items className='absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50'>
                                                    <div className='px-1 py-1'>
                                                        <label className='p-2 text-blue-900 lg:hidden block'>
                                                            {dataKaryawan?.nama}
                                                        </label>
                                                        <Menu.Item>
                                                            {({ active }) => (
                                                                <button
                                                                    onClick={() =>
                                                                        router.push("/profile", null, {
                                                                            shallow: true,
                                                                        })
                                                                    }
                                                                    className={`${
                                                                        active
                                                                            ? "bg-blue-900 text-white"
                                                                            : "text-blue-900"
                                                                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                                                >
                                                                    Profile
                                                                </button>
                                                            )}
                                                        </Menu.Item>
                                                        
                                                        <Menu.Item>
                                                            {({ active }) => (
                                                                <button
                                                                    onClick={() => setShowChangePassword(true)}
                                                                    className={`${
                                                                        active
                                                                            ? "bg-blue-900 text-white"
                                                                            : "text-blue-900"
                                                                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                                                >
                                                                    {listLanguage.password_setting || 'Ubah Password'}
                                                                </button>
                                                            )}
                                                        </Menu.Item>
                                                        
                                                        <Menu.Item>
                                                            {({ active }) => (
                                                                <button
                                                                    onClick={Logout}
                                                                    className={`${
                                                                        active
                                                                            ? "bg-red-600 text-white"
                                                                            : "text-blue-900"
                                                                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                                                >
                                                                    {listLanguage.logout || 'Keluar'}
                                                                </button>
                                                            )}
                                                        </Menu.Item>
                                                    </div>
                                                </Menu.Items>
                                            </Transition>
                                        </div>
                                    </Menu>
                                </li>
                            ) : (
                                <>
                                    <li className='block lg:hidden'>
                                        <Link href='/login'>
                                            <svg
                                                className='w-6 h-6 text-blue-900 hover:text-blue-900/95 hover:scale-110'
                                                fill='none'
                                                stroke='currentColor'
                                                viewBox='0 0 24 24'
                                                xmlns='http://www.w3.org/2000/svg'
                                            >
                                                <path
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                    strokeWidth={2}
                                                    d='M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                                                />
                                            </svg>
                                        </Link>
                                    </li>
                                    <li
                                        className={`hidden lg:block font-roboto font-semibold text-blue-900 subpixel-antialiased hover:text-blue-900/75 hover:underline cursor-pointer ${
                                            pathname == "/login" ? "underline" : ""
                                        }`}
                                    >
                                        <Link href='/login'>{listLanguage.login || 'Masuk'}</Link>
                                    </li>
                                </>
                            )}
                            
                            <li className='block px-3 font-roboto font-semibold text-blue-900 transition duration-700 ease-out hover:text-blue-900/95 hover:ease-in cursor-pointer group'>
                                <span className='flex items-center'>
                                    <ToggleSwitch
                                        id='bahasa'
                                        checked={stateLanguage.lang == "id" ? true : false}
                                        onChange={onLanguageChange}
                                    />
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
            </header>
            <ChangePasswordModal 
                isOpen={showChangePassword}
                onClose={() => setShowChangePassword(false)}
            />
        </>
    );
};

export default Header;