import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { 
  Bell, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Trash2,
  BookOpen,
  Award,
  Calendar,
  Users,
  FileText,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { AuthContext } from "../contexts/AuthContext";
import { LanguageContext } from "../contexts/LanguageContext";
import { useRoles } from "../hooks/useRoles";
import WebLayout from "../layouts/WebLayout";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all"); // all, unread, read
  const [loading, setLoading] = useState(false);
  
  // ✅ Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20); // 20 per page
  const [totalCount, setTotalCount] = useState(0);
  
  const router = useRouter();
  const { stateAuth } = useContext(AuthContext);
  const { stateLanguage } = useContext(LanguageContext);
  const { listLanguage } = stateLanguage;
  const { fetchNotification } = useRoles();

  // ✅ Redirect jika belum login
  useEffect(() => {
    if (!stateAuth.isAuthenticated) {
      router.push('/login');
    }
  }, [stateAuth.isAuthenticated]);

  // ✅ Load notifications when filter or page changes
  useEffect(() => {
    loadNotifications();
  }, [filter, currentPage, pageSize]);

  // ✅ Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      // ✅ Call API dengan pagination
      const result = await fetchNotification({
        page: currentPage,
        limit: pageSize,
        status: filter === 'all' ? undefined : filter
      });
      
      if (result?.data) {
        setNotifications(result.data);
        setTotalCount(result.pagination?.totalCount || result.data.length);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (category) => {
    const iconMap = {
      'course': BookOpen,
      'certificate': Award,
      'warning': AlertCircle,
      'success': CheckCircle,
      'training': Calendar,
      'group': Users,
      'test': FileText,
      'expired': XCircle
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
      'expired': 'text-red-500'
    };
    
    return <IconComponent className={`w-6 h-6 ${colorMap[category] || 'text-gray-500'}`} />;
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return listLanguage.just_now || 'Baru saja';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} ${listLanguage.minutes_ago || 'menit lalu'}`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ${listLanguage.hours_ago || 'jam lalu'}`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ${listLanguage.days_ago || 'hari lalu'}`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read jika belum dibaca
      if (!notification.is_read) {
        // TODO: Call API to mark as read
        // await markNotificationRead(notification.id_notification);
        setNotifications(prev =>
          prev.map(n => n.id_notification === notification.id_notification ? { ...n, is_read: true } : n)
        );
      }
      
      // ✅ Navigate berdasarkan kategori/redirect_to
    //   if (notification.redirect_to) {
    //     router.push(notification.redirect_to);
    //   } else {
    //     // Fallback routing based on role
    //     const userRole = stateAuth.user?.role;
        
    //     if (userRole === 'admin' || userRole === 'hr') {
    //       // Admin routing
    //       switch (notification.category) {
    //         case 'approval':
    //           router.push('/admin/courses?status=pending');
    //           break;
    //         case 'user':
    //           router.push('/admin/users?status=pending');
    //           break;
    //         case 'certificate':
    //           router.push('/admin/reports/offline-learning?filter=expiring');
    //           break;
    //         case 'compliance':
    //           router.push('/admin/compliance?status=expired');
    //           break;
    //         default:
    //           router.push('/admin/dashboard');
    //       }
    //     } else {
    //       // User routing
    //       switch (notification.category) {
    //         case 'course':
    //           router.push(`/courses/${notification.data?.course_id}`);
    //           break;
    //         case 'certificate':
    //           router.push('/my-learning/certificates');
    //           break;
    //         case 'test':
    //           router.push(`/courses/${notification.data?.course_id}/test`);
    //           break;
    //         case 'training':
    //           router.push('/trainings');
    //           break;
    //         default:
    //           // Stay on page
    //           break;
    //       }
    //     }
    //   }
    } catch (error) {
      console.error('Error handling notification:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // TODO: Call API to mark all as read
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation();
    
    if (confirm(listLanguage.confirm_delete_notification || 'Hapus notifikasi ini?')) {
      try {
        // TODO: Call API to delete
        setNotifications(prev => prev.filter(n => n.id_notification !== notificationId));
        setTotalCount(prev => prev - 1);
      } catch (error) {
        console.error('Error deleting notification:', error);
      }
    }
  };

  // ✅ Pagination handlers
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

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
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
                    {totalCount} total, {unreadCount} {listLanguage.unread_notifications || 'belum dibaca'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                  >
                    {listLanguage.mark_all_read || 'Tandai semua terbaca'}
                  </button>
                )}
              </div>
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
                {listLanguage.all || 'Semua'} ({totalCount})
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-4 py-2 text-sm rounded-lg transition-colors font-medium ${
                  filter === "unread"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {listLanguage.unread || 'Belum dibaca'}
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
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id_notification}
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
                          {notification.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          {!notification.is_read && (
                            <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full"></span>
                          )}
                          <button
                            onClick={(e) => handleDeleteNotification(e, notification.id_notification)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-all"
                          >
                            <Trash2 size={14} className="text-red-600" />
                          </button>
                        </div>
                      </div>
                      <p className={`text-sm mb-2 ${notification.is_read ? 'text-gray-500' : 'text-gray-700'}`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(notification.created_at)}
                        </span>
                        {notification.action && (
                          <span className="text-xs text-blue-600 font-medium">
                            {notification.action} →
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {listLanguage.no_notifications || 'Tidak ada notifikasi'}
                </h3>
                <p className="text-sm text-gray-600">
                  {filter === "all" 
                    ? (listLanguage.no_notifications_subtitle || 'Kamu akan menerima notifikasi di sini')
                    : `Tidak ada notifikasi ${filter === 'unread' ? 'belum dibaca' : 'yang sudah dibaca'}`
                  }
                </p>
              </div>
            )}
          </div>

          {/* ✅ Pagination */}
          {!loading && notifications.length > 0 && totalPages > 1 && (
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Page Size Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Rows per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(e.target.value)}
                    className="py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:outline-none"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                {/* Info */}
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{startIndex}</span> to{' '}
                  <span className="font-semibold text-gray-900">{endIndex}</span> of{' '}
                  <span className="font-semibold text-gray-900">{totalCount}</span> notifications
                </div>

                {/* Page Navigation */}
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