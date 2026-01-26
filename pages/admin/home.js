import { useState, useEffect, useContext  } from 'react';
import { 
    Bell, 
    Calendar, 
    BookOpen, 
    Clock,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Building2,
    CheckCircle2,
    Award,
    Users,
    Target,
    Lock
} from 'lucide-react';
import Admin from "layouts/Admin.js";
import { useRoles } from "@/hooks/useRoles";
import { useCourses } from "@/hooks/useCourses";
import { ProfileContext } from "@/contexts/profile/ProfileContext";
import { useMenuPermissions } from "@/hooks/useMenuPermissions";

export default function HomeAdmin() {
    const permissions = useMenuPermissions();
    
    const { fetchNotification, fetchSchedule, fetchCalenderHome } = useRoles();
    const { coursesList, fetchCoursesList } = useCourses(); // ✅ Ganti ke coursesList
    const { dataKaryawan } = useContext(ProfileContext);
    
    const [currentDate] = useState(new Date());
    const [calendarDate, setCalendarDate] = useState(new Date());
    
    const [notifications, setNotifications] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [calendarData, setCalendarData] = useState(null);
    const [coursesListData, setCoursesListData] = useState([]);
    
    const [loadingNotifications, setLoadingNotifications] = useState(true);
    const [loadingSchedules, setLoadingSchedules] = useState(true);
    const [loadingCalendar, setLoadingCalendar] = useState(true);
    const [loadingCourses, setLoadingCourses] = useState(true);
    
    const [notificationPage, setNotificationPage] = useState(1);
    const [schedulePage, setSchedulePage] = useState(1);
    const [coursePage, setCoursePage] = useState(1);
    const itemsPerPage = 3;

    const formatDate = (date) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
        return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    };

    useEffect(() => {
        if (!permissions.can_view) return;
        
        const loadNotifications = async () => {
            try {
                setLoadingNotifications(true);
                const result = await fetchNotification();
                if (result?.data) {
                    setNotifications(result.data);
                }
            } catch (error) {
                console.error('Error loading notifications:', error);
            } finally {
                setLoadingNotifications(false);
            }
        };
        loadNotifications();
    }, [permissions.can_view]);

    useEffect(() => {
        if (!permissions.can_view) return;
        
        const loadSchedules = async () => {
            try {
                setLoadingSchedules(true);
                const result = await fetchSchedule();
                if (result?.data) {
                    setSchedules(result.data);
                }
            } catch (error) {
                console.error('Error loading schedules:', error);
            } finally {
                setLoadingSchedules(false);
            }
        };
        loadSchedules();
    }, [permissions.can_view]);

    useEffect(() => {
        if (!permissions.can_view) return;
        
        const loadCalendar = async () => {
            try {
                setLoadingCalendar(true);
                const year = calendarDate.getFullYear();
                const month = calendarDate.getMonth() + 1;
                const result = await fetchCalenderHome({ year, month });
                if (result?.data) {
                    setCalendarData(result.data);
                }
            } catch (error) {
                console.error('Error loading calendar:', error);
            } finally {
                setLoadingCalendar(false);
            }
        };
        loadCalendar();
    }, [calendarDate, permissions.can_view]);

    // ✅ GANTI: Load courses dari coursesList
    useEffect(() => {
        if (!permissions.can_view) return;
        
        const loadCourses = async () => {
            try {
                setLoadingCourses(true);
                await fetchCoursesList(); // ✅ Ganti dari fetchEnrollData
            } catch (error) {
                console.error('Error loading courses:', error);
            } finally {
                setLoadingCourses(false);
            }
        };
        loadCourses();
    }, [permissions.can_view]);

    // ✅ HAPUS: useEffect yang flatten enrollData, langsung pakai coursesList
    useEffect(() => {
        if (coursesList && coursesList.length > 0) {
            setCoursesListData(coursesList); // ✅ Langsung set, sudah flat dari backend
            console.log('Courses from API:', coursesList);
        }
    }, [coursesList]);

    const handlePrevMonth = () => {
        setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const getMonthName = (date) => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
        return `${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    const generateCalendarDays = () => {
        const year = calendarDate.getFullYear();
        const month = calendarDate.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        
        let startingDay = firstDay.getDay() - 1;
        if (startingDay < 0) startingDay = 6;
        
        const days = [];
        
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startingDay - 1; i >= 0; i--) {
            days.push({
                date: prevMonthLastDay - i,
                isCurrentMonth: false,
                fullDate: null
            });
        }
        
        for (let i = 1; i <= daysInMonth; i++) {
            const fullDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            days.push({
                date: i,
                isCurrentMonth: true,
                fullDate
            });
        }
        
        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            days.push({
                date: i,
                isCurrentMonth: false,
                fullDate: null
            });
        }
        
        return days;
    };

    const getEventsForDate = (dateStr) => {
        if (!calendarData?.events || !dateStr) return [];
        
        return calendarData.events.filter(event => {
            try {
                const [startDatePart] = event.date.split(' ');
                const [startMonth, startDay, startYear] = startDatePart.split('/');
                const eventStartStr = `${startYear}-${startMonth.padStart(2, '0')}-${startDay.padStart(2, '0')}`;
                
                const [endDatePart] = event.end_date.split(' ');
                const [endMonth, endDay, endYear] = endDatePart.split('/');
                const eventEndStr = `${endYear}-${endMonth.padStart(2, '0')}-${endDay.padStart(2, '0')}`;
                
                return dateStr >= eventStartStr && dateStr <= eventEndStr;
            } catch (error) {
                console.error('Error parsing event date:', event.date, error);
                return false;
            }
        });
    };

    const getEventPosition = (dateStr, event) => {
        try {
            const [startDatePart] = event.date.split(' ');
            const [startMonth, startDay, startYear] = startDatePart.split('/');
            const eventStartStr = `${startYear}-${startMonth.padStart(2, '0')}-${startDay.padStart(2, '0')}`;
            
            const [endDatePart] = event.end_date.split(' ');
            const [endMonth, endDay, endYear] = endDatePart.split('/');
            const eventEndStr = `${endYear}-${endMonth.padStart(2, '0')}-${endDay.padStart(2, '0')}`;
            
            const isStart = dateStr === eventStartStr;
            const isEnd = dateStr === eventEndStr;
            const isMiddle = dateStr > eventStartStr && dateStr < eventEndStr;
            
            return { isStart, isEnd, isMiddle };
        } catch (error) {
            return { isStart: false, isEnd: false, isMiddle: false };
        }
    };

    const isToday = (dateStr) => {
        if (!dateStr) return false;
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        return dateStr === todayStr;
    };

    const paginateData = (data, page, perPage) => {
        const start = (page - 1) * perPage;
        return data.slice(start, start + perPage);
    };

    const getTotalPages = (data, perPage) => {
        return Math.ceil(data.length / perPage);
    };

    const getNotificationStyle = (category) => {
        switch (category) {
            case 'course':
                return { bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-500' };
            case 'certificate':
                return { bg: 'bg-orange-50', border: 'border-orange-200', dot: 'bg-orange-500' };
            case 'success':
                return { bg: 'bg-green-50', border: 'border-green-200', dot: 'bg-green-500' };
            default:
                return { bg: 'bg-gray-50', border: 'border-gray-200', dot: 'bg-gray-500' };
        }
    };

    const formatScheduleDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    // ✅ UPDATE: Gunakan field dari API
    const calculateStats = () => {
        const totalCourses = coursesListData.length;
        const totalEnrolled = coursesListData.reduce((sum, c) => sum + (c.enrolled || 0), 0); // ✅ enrolled dari API
        const totalFinished = coursesListData.reduce((sum, c) => sum + (c.finished || 0), 0); // ✅ finished dari API
        const completionRate = totalEnrolled > 0 ? Math.round((totalFinished / totalEnrolled) * 100) : 0;
        
        return { totalCourses, totalEnrolled, totalFinished, completionRate };
    };

    const stats = calculateStats();

    if (!permissions.can_view) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
                    <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h3>
                    <p className="text-gray-600 mb-4">
                        This page is only accessible to administrators. Please contact your system administrator if you believe you should have access.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Enhanced Welcome Banner with Stats */}
            <div className="bg-gradient-to-r from-[#5577B5] via-[#6B8BC5] to-[#7B9DD8] text-white px-8 py-6 rounded-2xl shadow-xl mx-8 mt-6 mb-8">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                            Welcome back, {dataKaryawan?.nama}! <span className="wave">👋</span>
                        </h1>
                        <p className="text-blue-100 flex items-center gap-2 text-lg">
                            <Building2 className="w-5 h-5" />
                            {dataKaryawan?.company_name}
                        </p>
                    </div>
                    
                    {/* Quick Stats Dashboard */}
                    <div className="grid grid-cols-4 gap-3">
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 text-center hover:bg-white/30 transition-all">
                            <Bell className="w-5 h-5 mx-auto mb-1 text-yellow-200" />
                            <p className="text-2xl font-bold">{notifications.filter(n => !n.is_read).length}</p>
                            <p className="text-xs text-blue-100">New Alerts</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 text-center hover:bg-white/30 transition-all">
                            <Calendar className="w-5 h-5 mx-auto mb-1 text-green-200" />
                            <p className="text-2xl font-bold">{schedules.length}</p>
                            <p className="text-xs text-blue-100">Scheduled</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 text-center hover:bg-white/30 transition-all">
                            <BookOpen className="w-5 h-5 mx-auto mb-1 text-purple-200" />
                            <p className="text-2xl font-bold">{stats.totalCourses}</p>
                            <p className="text-xs text-blue-100">Courses</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 text-center hover:bg-white/30 transition-all">
                            <Award className="w-5 h-5 mx-auto mb-1 text-amber-200" />
                            <p className="text-2xl font-bold">{stats.completionRate}%</p>
                            <p className="text-xs text-blue-100">Complete</p>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/20">
                    <p className="text-blue-100 text-sm flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {new Date().toLocaleDateString("id-ID", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                        })} | {new Date().toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                        })} WIB
                    </p>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                            <Users className="w-4 h-4" />
                            <span className="text-sm">{stats.totalEnrolled} enrolled</span>
                        </div>
                        <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-sm">{stats.totalFinished} finished</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-8 pb-8">
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-8">
                        {/* Enhanced Notifications Card */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-500 p-2.5 rounded-xl shadow-lg">
                                            <Bell className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-gray-900">NOTIFICATIONS</h2>
                                            <p className="text-xs text-gray-500">Stay updated with latest activities</p>
                                        </div>
                                    </div>
                                    {notifications.length > 0 && (
                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded-full shadow-md animate-pulse">
                                                {notifications.filter(n => !n.is_read).length} new
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 space-y-4 min-h-[300px] max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                {loadingNotifications ? (
                                    <div className="flex items-center justify-center h-48">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                    </div>
                                ) : notifications.length > 0 ? (
                                    paginateData(notifications, notificationPage, itemsPerPage).map((notif) => {
                                        const style = getNotificationStyle(notif.category);
                                        return (
                                            <div
                                                key={notif.id_notification}
                                                className={`p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer ${style.bg} ${style.border} ${!notif.is_read ? 'ring-2 ring-blue-300' : ''}`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`w-2.5 h-2.5 rounded-full mt-2 flex-shrink-0 ${style.dot} ${!notif.is_read ? 'animate-pulse' : ''}`}></div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold text-gray-900 text-sm">{notif.title}</span>
                                                                {!notif.is_read && (
                                                                    <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-md font-medium">NEW</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-gray-700 leading-relaxed mb-2">
                                                            {notif.message}
                                                        </p>
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {new Date(notif.created_at).toLocaleString('id-ID')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-48 text-center">
                                        <div className="bg-gray-100 p-4 rounded-full mb-3">
                                            <Bell className="w-8 h-8 text-gray-300" />
                                        </div>
                                        <p className="text-gray-400 font-medium">No notifications</p>
                                        <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
                                    </div>
                                )}
                            </div>

                            {notifications.length > itemsPerPage && (
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                    <button 
                                        onClick={() => setNotificationPage(prev => Math.max(1, prev - 1))}
                                        disabled={notificationPage === 1}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Previous
                                    </button>
                                    <div className="flex gap-2">
                                        {Array.from({ length: getTotalPages(notifications, itemsPerPage) }, (_, i) => (
                                            <button
                                                key={`notif-page-${i}`}
                                                onClick={() => setNotificationPage(i + 1)}
                                                className={`w-8 h-2 rounded-full transition-all ${notificationPage === i + 1 ? 'bg-blue-500 w-12' : 'bg-gray-300 hover:bg-gray-400'}`}
                                            />
                                        ))}
                                    </div>
                                    <button 
                                        onClick={() => setNotificationPage(prev => Math.min(getTotalPages(notifications, itemsPerPage), prev + 1))}
                                        disabled={notificationPage === getTotalPages(notifications, itemsPerPage)}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Enhanced Courses List Card */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-purple-500 p-2.5 rounded-xl shadow-lg">
                                            <BookOpen className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-gray-900">COURSES</h2>
                                            <p className="text-xs text-gray-500">Available learning programs</p>
                                        </div>
                                    </div>
                                    <div className="bg-purple-100 px-3 py-1.5 rounded-lg">
                                        <span className="text-sm font-bold text-purple-700">{coursesListData.length} Total</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 space-y-4 min-h-[300px] max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-gray-100">
                                {loadingCourses ? (
                                    <div className="flex items-center justify-center h-48">
                                        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                                    </div>
                                ) : coursesListData.length > 0 ? (
                                    paginateData(coursesListData, coursePage, itemsPerPage).map((course) => {
                                        // ✅ UPDATE: Gunakan field dari API
                                        const completionRate = course.enrolled > 0 
                                            ? Math.round((course.finished / course.enrolled) * 100) 
                                            : 0;
                                        
                                        return (
                                            <div
                                                key={course.id_course_enrollment}
                                                className="group flex gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-purple-300 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.02]"
                                            >
                                                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                                                    <BookOpen className="w-8 h-8 text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    {course.company_name && (
                                                        <div className="mb-2">
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold border border-blue-200">
                                                                <Building2 className="w-3 h-3" />
                                                                {course.company_name}
                                                            </span>
                                                        </div>
                                                    )}
                                                    
                                                    <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2 group-hover:text-purple-600 transition-colors">
                                                        {course.course_title}
                                                    </h3>
                                                    
                                                    {course.publish_date && (
                                                        <p className="text-xs text-purple-600 mb-2 flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            Release: {new Date(course.publish_date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                        </p>
                                                    )}
                                                    
                                                    <p className="text-xs text-gray-600 mb-3 flex items-center gap-2">
                                                        {course.enroll_type_name && (
                                                            <span className="px-2 py-0.5 bg-gray-100 rounded">{course.enroll_type_name}</span>
                                                        )}
                                                        {course.course_status_name && (
                                                            <span className="px-2 py-0.5 bg-gray-100 rounded">{course.course_status_name}</span>
                                                        )}
                                                    </p>
                                                    
                                                    <div className="flex items-center gap-4 text-xs mb-3">
                                                        <div className="flex items-center gap-1">
                                                            <Users className="w-4 h-4 text-blue-500" />
                                                            <span className="font-bold text-gray-900">{course.enrolled || 0}</span>
                                                            <span className="text-gray-500">Enrolled</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                            <span className="font-bold text-gray-900">{course.finished || 0}</span>
                                                            <span className="text-gray-500">Finished</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="w-4 h-4 text-orange-500" />
                                                            <span className="font-bold text-gray-900">{course.in_progress || 0}</span>
                                                            <span className="text-gray-500">In Progress</span>
                                                        </div>
                                                    </div>

                                                    {course.enrolled > 0 && (
                                                        <div>
                                                            <div className="flex items-center justify-between text-xs mb-1">
                                                                <span className="text-gray-600 flex items-center gap-1">
                                                                    <Target className="w-3 h-3" />
                                                                    Completion Rate
                                                                </span>
                                                                <span className="font-bold text-purple-600">{completionRate}%</span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                                <div 
                                                                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500 shadow-inner"
                                                                    style={{ width: `${completionRate}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-48 text-center">
                                        <div className="bg-purple-50 p-4 rounded-full mb-3">
                                            <BookOpen className="w-8 h-8 text-purple-300" />
                                        </div>
                                        <p className="text-gray-400 font-medium">No courses available</p>
                                        <p className="text-xs text-gray-400 mt-1">Check back later for new content</p>
                                    </div>
                                )}
                            </div>

                            {coursesListData.length > itemsPerPage && (
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                    <button 
                                        onClick={() => setCoursePage(prev => Math.max(1, prev - 1))}
                                        disabled={coursePage === 1}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Previous
                                    </button>
                                    <div className="flex gap-2">
                                        {Array.from({ length: getTotalPages(coursesListData, itemsPerPage) }, (_, i) => (
                                            <button
                                                key={`course-page-${i}`}
                                                onClick={() => setCoursePage(i + 1)}
                                                className={`w-8 h-2 rounded-full transition-all ${coursePage === i + 1 ? 'bg-purple-500 w-12' : 'bg-gray-300 hover:bg-gray-400'}`}
                                            />
                                        ))}
                                    </div>
                                    <button 
                                        onClick={() => setCoursePage(prev => Math.min(getTotalPages(coursesListData, itemsPerPage), prev + 1))}
                                        disabled={coursePage === getTotalPages(coursesListData, itemsPerPage)}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-8">
                        {/* Enhanced Training Schedule Card */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-green-500 p-2.5 rounded-xl shadow-lg">
                                            <Calendar className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-gray-900">TRAINING SCHEDULE</h2>
                                            <p className="text-xs text-gray-500">Upcoming training sessions</p>
                                        </div>
                                    </div>
                                    {schedules.length > 0 && (
                                        <div className="bg-green-100 px-3 py-1.5 rounded-lg">
                                            <span className="text-sm font-bold text-green-700">{schedules.length} Active</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 min-h-[200px]">
                                {loadingSchedules ? (
                                    <div className="flex items-center justify-center h-48">
                                        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                                    </div>
                                ) : schedules.length > 0 ? (
                                    <div className="space-y-4">
                                        {paginateData(schedules, schedulePage, 2).map((schedule, index) => {
                                            const startDate = new Date(schedule.publish_date);
                                            const endDate = new Date(schedule.end_date);
                                            const today = new Date();
                                            const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
                                            const isUrgent = daysRemaining > 0 && daysRemaining <= 7;
                                            
                                            return (
                                                <div 
                                                    key={schedule.id || schedule.course_id || `schedule-${schedulePage}-${index}`}
                                                    className="relative bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] overflow-hidden group"
                                                >
                                                    {/* Animated Background Pattern */}
                                                    <div className="absolute inset-0 opacity-10">
                                                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                                                    </div>
                                                    
                                                    {isUrgent && (
                                                        <div className="absolute top-3 right-3 z-10">
                                                            <div className="bg-yellow-400 text-yellow-900 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg flex items-center gap-1 animate-pulse">
                                                                <Clock className="w-3 h-3" />
                                                                {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left!
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    <div className="relative z-10">
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className="flex items-center gap-3 flex-1">
                                                                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                                                                    <Calendar className="w-6 h-6 text-white" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h3 className="text-lg font-bold mb-1 line-clamp-2">
                                                                        {schedule.course_title}
                                                                    </h3>
                                                                    {/* ✅ Company di bawah title */}
                                                                    {schedule.company_name && (
                                                                        <p className="text-blue-100 text-xs mb-2 flex items-center gap-1 truncate">
                                                                            <Building2 className="w-3 h-3 flex-shrink-0" />
                                                                            {schedule.company_name}
                                                                        </p>
                                                                    )}
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <span className="px-2 py-0.5 bg-white/20 rounded text-xs">{schedule.enroll_type_name}</span>
                                                                        <span className="px-2 py-0.5 bg-white/20 rounded text-xs">{schedule.course_status_name}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="absolute top-6 right-3 z-10">
                                                            <span className="px-3 py-1.5 bg-green-400 text-green-900 rounded-lg font-bold text-xs shadow-lg flex items-center gap-1 flex-shrink-0 ml-2">
                                                                <div className="w-2 h-2 bg-green-900 rounded-full animate-pulse" />
                                                                Online
                                                            </span>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="grid grid-cols-2 gap-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                                                            <div className="flex items-center gap-2">
                                                                <div className="bg-white/20 p-1.5 rounded">
                                                                    <Clock className="w-3.5 h-3.5" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-blue-100">Start Date</p>
                                                                    <p className="text-sm font-semibold">{formatScheduleDate(schedule.publish_date)}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <div className="bg-white/20 p-1.5 rounded">
                                                                    <Clock className="w-3.5 h-3.5" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-blue-100">End Date</p>
                                                                    <p className="text-sm font-semibold">{formatScheduleDate(schedule.end_date)}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Calendar className="w-8 h-8 text-gray-300" />
                                        </div>
                                        <p className="text-gray-400 font-medium">No scheduled training</p>
                                        <p className="text-xs text-gray-400 mt-1">New schedules will appear here</p>
                                    </div>
                                )}
                            </div>

                            {schedules.length > 2 && (
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                    <button 
                                        onClick={() => setSchedulePage(prev => Math.max(1, prev - 1))}
                                        disabled={schedulePage === 1}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Previous
                                    </button>
                                    <div className="flex gap-2">
                                        {Array.from({ length: getTotalPages(schedules, 2) }, (_, i) => (
                                            <button
                                                key={`schedule-page-${i}`}
                                                onClick={() => setSchedulePage(i + 1)}
                                                className={`w-8 h-2 rounded-full transition-all ${schedulePage === i + 1 ? 'bg-green-500 w-12' : 'bg-gray-300 hover:bg-gray-400'}`}
                                            />
                                        ))}
                                    </div>
                                    <button 
                                        onClick={() => setSchedulePage(prev => Math.min(getTotalPages(schedules, 2), prev + 1))}
                                        disabled={schedulePage === getTotalPages(schedules, 2)}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Enhanced Calendar Card */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
                            <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-4 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-orange-500 p-2.5 rounded-xl shadow-lg">
                                            <Calendar className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-gray-900">{getMonthName(calendarDate)}</h2>
                                            <p className="text-xs text-gray-500">Event calendar</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={handlePrevMonth}
                                            className="p-2 hover:bg-white rounded-lg transition-all hover:scale-110 active:scale-95"
                                        >
                                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                                        </button>
                                        <button 
                                            onClick={handleNextMonth}
                                            className="p-2 hover:bg-white rounded-lg transition-all hover:scale-110 active:scale-95"
                                        >
                                            <ChevronRight className="w-5 h-5 text-gray-600" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                {loadingCalendar ? (
                                    <div className="flex items-center justify-center h-64">
                                        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-7 gap-1 mb-2">
                                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                                                <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2"> 
                                                    {day}
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <div className="grid grid-cols-7 gap-1">
                                            {generateCalendarDays().map((day, index) => {
                                                const events = getEventsForDate(day.fullDate);
                                                const hasEvents = events.length > 0;
                                                const isTodayDate = isToday(day.fullDate);
                                                
                                                let isEventStart = false;
                                                let isEventEnd = false;
                                                let isEventMiddle = false;
                                                
                                                if (hasEvents && events.length > 0) {
                                                    const position = getEventPosition(day.fullDate, events[0]);
                                                    isEventStart = position.isStart;
                                                    isEventEnd = position.isEnd;
                                                    isEventMiddle = position.isMiddle;
                                                }
                                                
                                                const colIndex = index % 7;
                                                const isLeftEdge = colIndex <= 1;
                                                const isRightEdge = colIndex >= 5;
                                                
                                                return (
                                                    <div
                                                        key={`day-${day.fullDate || index}`}
                                                        className={`
                                                            aspect-square flex flex-col items-center justify-center text-sm 
                                                            rounded-lg transition-all duration-200 cursor-pointer relative group
                                                            ${!day.isCurrentMonth
                                                                ? 'text-gray-300 opacity-50'
                                                                : isTodayDate
                                                                ? 'bg-blue-500 text-white font-bold shadow-lg scale-105 ring-2 ring-blue-300'
                                                                : isEventStart
                                                                ? 'bg-gradient-to-br from-orange-500 to-orange-400 text-white font-bold shadow-lg ring-2 ring-orange-600 hover:scale-110'
                                                                : isEventEnd
                                                                ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white font-bold shadow-lg ring-2 ring-orange-600 hover:scale-110'
                                                                : isEventMiddle
                                                                ? 'bg-orange-50 text-orange-800 border-2 border-orange-200 hover:bg-orange-100 hover:scale-105'
                                                                : hasEvents
                                                                ? 'bg-orange-100 text-orange-700 font-semibold border-2 border-orange-300 hover:bg-orange-200 hover:scale-105'
                                                                : 'hover:bg-gray-100 text-gray-700 hover:scale-105'
                                                            }
                                                        `}
                                                    >
                                                        <span className="relative z-10">{day.date}</span>
                                                        
                                                        {/* Badge START/END - UX: Clear labeling */}
                                                        {day.isCurrentMonth && (
                                                            <>
                                                                {isEventStart && (
                                                                    <div className="absolute -top-1 -right-1 z-10">
                                                                        <div className="bg-green-500 text-white px-1.5 py-0.5 rounded-md text-[9px] font-bold shadow-md">
                                                                            START
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {isEventEnd && (
                                                                    <div className="absolute -top-1 -right-1 z-10">
                                                                        <div className="bg-red-500 text-white px-1.5 py-0.5 rounded-md text-[9px] font-bold shadow-md">
                                                                            END
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                        
                                                        {/* Event indicator dots */}
                                                        {isEventStart && !isTodayDate && day.isCurrentMonth && (
                                                            <div className="absolute bottom-1 flex gap-0.5 z-10">
                                                                {events.slice(0, 3).map((event, i) => (
                                                                    <div 
                                                                        key={`dot-${day.fullDate}-${i}`}
                                                                        className="w-1.5 h-1.5 rounded-full bg-white shadow-md" 
                                                                    />
                                                                ))}
                                                            </div>
                                                        )}
                                                        
                                                        {/* Tooltip - Enhanced UX */}
                                                        {hasEvents && day.isCurrentMonth && (
                                                            <div 
                                                                className={`absolute bottom-full mb-2 hidden group-hover:block z-50 animate-in fade-in slide-in-from-bottom-2 duration-200
                                                                    ${isLeftEdge ? 'left-0' : isRightEdge ? 'right-0' : 'left-1/2 -translate-x-1/2'}
                                                                `}
                                                            >
                                                                <div className="bg-gray-900 text-white text-xs rounded-xl p-4 shadow-2xl min-w-[240px] max-w-[300px] border border-gray-700">
                                                                    <div className="flex items-center justify-between mb-3 pb-2 ">
                                                                        <p className="font-bold text-sm flex items-center gap-2">
                                                                            <Calendar className="w-4 h-4 text-orange-400" />
                                                                            {events.length} Event{events.length > 1 ? 's' : ''}
                                                                        </p>
                                                                        {isEventStart && (
                                                                            <span className="px-2 py-1 bg-green-500 text-white text-[10px] font-bold rounded-md shadow-md">
                                                                                START
                                                                            </span>
                                                                        )}
                                                                        {isEventEnd && (
                                                                            <span className="px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded-md shadow-md">
                                                                                END
                                                                            </span>
                                                                        )}
                                                                        {isEventMiddle && (
                                                                            <span className="px-2 py-1 bg-blue-500 text-white text-[10px] font-bold rounded-md shadow-md">
                                                                                ONGOING
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="space-y-3 max-h-60 overflow-y-auto">
                                                                        {events.map((event, i) => {
                                                                            const [startDatePart] = event.date.split(' ');
                                                                            const [endDatePart] = event.end_date.split(' ');
                                                                            
                                                                            return (
                                                                                <div key={`event-${day.fullDate}-${i}`} className="pb-3 last:pb-0 last:border-0">
                                                                                    <p className="font-semibold text-orange-300 leading-tight mb-2">
                                                                                        {event.title}
                                                                                    </p>
                                                                                    <div className="space-y-1">
                                                                                        <p className="text-gray-400 text-xs flex items-center gap-1.5">
                                                                                            <Building2 className="w-3 h-3 flex-shrink-0" />
                                                                                            <span className="truncate">{event.company}</span>
                                                                                        </p>
                                                                                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 bg-gray-800 rounded px-2 py-1">
                                                                                            <Clock className="w-3 h-3 flex-shrink-0" />
                                                                                            <span className="font-mono">{startDatePart} → {endDatePart}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                    <div 
                                                                        className={`absolute bottom-0 translate-y-full
                                                                            ${isLeftEdge ? 'left-4' : isRightEdge ? 'right-4' : 'left-1/2 -translate-x-1/2'}
                                                                        `}
                                                                    >
                                                                        <div className="border-8 border-transparent border-t-gray-900" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="mt-6 pt-4  flex items-center justify-center gap-6 text-xs">
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded-lg bg-blue-500 shadow-md"></div>
                                                <span className="text-gray-600 font-medium">Today</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded-lg bg-orange-100 border-2 border-orange-400"></div>
                                                <span className="text-gray-600 font-medium">Has Events</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes wave {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(20deg); }
                    75% { transform: rotate(-20deg); }
                }
                .wave {
                    display: inline-block;
                    animation: wave 1.5s ease-in-out infinite;
                }
                .scrollbar-thin::-webkit-scrollbar {
                    width: 6px;
                }
                .scrollbar-thin::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
                .scrollbar-thumb-purple-300::-webkit-scrollbar-thumb {
                    background: #d8b4fe;
                }
                .scrollbar-thumb-purple-300::-webkit-scrollbar-thumb:hover {
                    background: #c084fc;
                }
            `}</style>
        </div>
    );
}

HomeAdmin.layout = Admin;