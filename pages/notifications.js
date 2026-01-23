import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { 
  Bell, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  BookOpen,
  Award,
  Calendar,
  Users,
  FileText,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCheck,
  Info
} from "lucide-react";
import { AuthContext } from "../contexts/AuthContext";
import { LanguageContext } from "../contexts/LanguageContext";
import { useRoles } from "../hooks/useRoles";
import { useSweetAlert } from "../hooks/useSweetAlert";
import WebLayout from "../layouts/WebLayout";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  
  const router = useRouter();
  const { stateAuth } = useContext(AuthContext);
  const { stateLanguage } = useContext(LanguageContext);
  const { listLanguage } = stateLanguage;
  const { fetchNotification, handleNotificationRead } = useRoles();
  const { showSuccess, showError, confirmAction } = useSweetAlert();

  useEffect(() => {
    loadNotifications();
  }, [filter, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: pageSize
      };
      
      if (filter === 'unread') {
        params.is_read = false;
      } else if (filter === 'read') {
        params.is_read = true;
      }
      
      const result = await fetchNotification(params);
      
      // ✅ Handle null/undefined result
      if (!result) {
        console.warn('fetchNotification returned null/undefined');
        setNotifications([]);
        setTotalCount(0);
        return;
      }
      
      // ✅ Handle result.data null/undefined
      if (result.data) {
        setNotifications(Array.isArray(result.data) ? result.data : []);
        setTotalCount(result.pagination?.totalCount || result.data.length || 0);
      } else {
        console.warn('result.data is null/undefined');
        setNotifications([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      showError('Failed to load notifications');
      // ✅ Set empty state on error
      setNotifications([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (category) => {
    // ✅ Handle null/undefined category
    if (!category) return <Bell className="w-6 h-6 text-gray-500" />;
    
    const iconMap = {
      'course': BookOpen,
      'certificate': Award,
      'warning': AlertCircle,
      'success': CheckCircle,
      'training': Calendar,
      'group': Users,
      'test': FileText,
      'expired': XCircle,
      'compliance': AlertCircle
    };
    
    const IconComponent = iconMap[category] || Bell;
    const colorMap = {
      'course': 'text-blue-500',
      'certificate': 'text-amber-500',
      'warning': 'text-orange-500',
      'success': 'text-green-500',
      'training': 'text-purple-500',
      'group': 'text-indigo-500',
      'test': 'text-blue-600',
      'expired': 'text-red-500',
      'compliance': 'text-red-600'
    };
    
    return <IconComponent className={`w-6 h-6 ${colorMap[category] || 'text-gray-500'}`} />;
  };

  const formatTimeAgo = (dateString) => {
    // ✅ Handle null/undefined dateString
    if (!dateString) return 'Unknown';
    
    try {
      const date = new Date(dateString);
      
      // ✅ Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      if (diffInSeconds < 60) return listLanguage.just_now || 'Baru saja';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} ${listLanguage.minutes_ago || 'menit lalu'}`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ${listLanguage.hours_ago || 'jam lalu'}`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ${listLanguage.days_ago || 'hari lalu'}`;
      
      const daysDiff = Math.floor(diffInSeconds / 86400);
      if (daysDiff < 30) return `${daysDiff} hari lalu`;
      if (daysDiff < 90) return `${Math.floor(daysDiff / 30)} bulan lalu`;
      
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const handleNotificationClick = async (notification) => {
    // ✅ Handle null/undefined notification
    if (!notification) return;
    
    try {
      if (!notification.is_read && markNotificationAsRead) {
        await markNotificationAsRead(notification.id_notification);
        
        setNotifications(prev =>
          prev.map(n => n.id_notification === notification.id_notification ? { ...n, is_read: true } : n)
        );
      }
      
      if (notification.redirect_to) {
        router.push(notification.redirect_to);
      } else if (notification.data?.url) {
        router.push(notification.data.url);
      }
      
    } catch (error) {
      console.error('Error handling notification:', error);
      showError('Failed to update notification');
    }
  };

  const handleMarkAllAsRead = async () => {
    const result = await confirmAction({
      title: 'Mark All as Read?',
      text: 'This will mark all unread notifications as read.',
      icon: 'question',
      confirmButtonText: 'Yes, mark all'
    });
    
    if (!result.isConfirmed) return;
    
    try {
      if (handleNotificationRead) {
        await handleNotificationRead();
        await loadNotifications();
        showSuccess('All notifications marked as read');
      } else {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        showSuccess('All notifications marked as read');
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      showError('Failed to mark all as read');
    }
  };

  const handlePageChange = (newPage) => {
    const totalPages = Math.ceil(totalCount / pageSize);
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(Number(newSize));
    setCurrentPage(1);
  };

  // ✅ Safe calculation of unreadCount
  const unreadCount = Array.isArray(notifications) 
    ? notifications.filter(n => n && !n.is_read).length 
    : 0;
    
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startIndex = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endIndex = Math.min(currentPage * pageSize, totalCount);

  return (
    <WebLayout>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Bell className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {listLanguage.all_notifications || 'Semua Notifikasi'}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {totalCount} total{unreadCount > 0 && `, ${unreadCount} ${listLanguage.unread_notifications || 'belum dibaca'}`}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Notifications are automatically cleaned up after 30-90 days
                  </p>
                </div>
              </div>
              
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                >
                  <CheckCheck size={16} />
                  {listLanguage.mark_all_read || 'Tandai semua terbaca'}
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 text-sm rounded-lg transition-colors font-medium ${
                  filter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {listLanguage.all || 'Semua'}
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors font-medium ${
                  filter === "unread"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {listLanguage.unread || 'Belum dibaca'}
                {filter !== "unread" && unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setFilter("read")}
                className={`px-4 py-2 text-sm rounded-lg transition-colors font-medium ${
                  filter === "read"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {listLanguage.read || 'Sudah dibaca'}
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="space-y-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                <p className="text-sm text-gray-600">Loading notifications...</p>
              </div>
            ) : Array.isArray(notifications) && notifications.length > 0 ? (
              notifications.map((notification) => {
                // ✅ Skip null/undefined notifications
                if (!notification) return null;
                
                return (
                  <div
                    key={notification.id_notification || Math.random()}
                    onClick={() => handleNotificationClick(notification)}
                    className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-all group ${
                      !notification.is_read ? "border-l-4 border-l-blue-600 bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          notification.is_read ? 'bg-gray-100' : 'bg-white shadow-sm'
                        }`}>
                          {getNotificationIcon(notification.category)}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className={`font-semibold ${notification.is_read ? 'text-gray-600' : 'text-gray-900'}`}>
                            {notification.title || 'No title'}
                          </h3>
                          <div className="flex items-center gap-2">
                            {!notification.is_read && (
                              <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                            )}
                            
                          </div>
                        </div>
                        <p className={`text-sm mb-2 ${notification.is_read ? 'text-gray-500' : 'text-gray-700'}`}>
                          {notification.message || 'No message'}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{formatTimeAgo(notification.created_at)}</span>
                          </div>
                          {(notification.redirect_to || notification.data?.url) && (
                            <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
                              View details →
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {filter === "all" 
                    ? (listLanguage.no_notifications || 'Tidak ada notifikasi')
                    : `Tidak ada notifikasi ${filter === 'unread' ? 'belum dibaca' : 'yang sudah dibaca'}`
                  }
                </h3>
                <p className="text-sm text-gray-600">
                  {filter === "all" 
                    ? (listLanguage.no_notifications_subtitle || 'Kamu akan menerima notifikasi di sini')
                    : filter === 'unread'
                    ? 'Semua notifikasi sudah dibaca'
                    : 'Belum ada notifikasi yang dibaca'
                  }
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && Array.isArray(notifications) && notifications.length > 0 && totalPages > 1 && (
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Rows per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(e.target.value)}
                    className="py-1.5 px-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{startIndex}</span> to{' '}
                  <span className="font-semibold text-gray-900">{endIndex}</span> of{' '}
                  <span className="font-semibold text-gray-900">{totalCount}</span> notifications
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Previous page"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <span className="px-3 py-1 text-sm font-medium text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Next page"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </WebLayout>
  );
};

export default NotificationsPage;