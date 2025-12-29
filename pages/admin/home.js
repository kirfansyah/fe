import { useState, useEffect, useContext  } from 'react';
import { 
    Bell, 
    Calendar, 
    BookOpen, 
    Clock,
    ChevronLeft,
    ChevronRight,
    Award,
    Users,
    AlertCircle,
    CheckCircle2,
    Info,
    Loader2,
    MapPin,
    Building2
} from 'lucide-react';
import Admin from "layouts/Admin.js";
import { useRoles } from "@/hooks/useRoles";
import { useCourses } from "@/hooks/useCourses";
import { ProfileContext } from "@/contexts/profile/ProfileContext";
export default function HomeAdmin() {
    const { fetchNotification, fetchSchedule, fetchCalenderHome } = useRoles();
    const { courses, fetchCourses } = useCourses();
    const { dataKaryawan } = useContext(ProfileContext);
    // Current date info
    const [currentDate] = useState(new Date());
    const [calendarDate, setCalendarDate] = useState(new Date());
    
    // Data states
    const [notifications, setNotifications] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [calendarData, setCalendarData] = useState(null);
    const [coursesList, setCoursesList] = useState([]);
    
    // Loading states
    const [loadingNotifications, setLoadingNotifications] = useState(true);
    const [loadingSchedules, setLoadingSchedules] = useState(true);
    const [loadingCalendar, setLoadingCalendar] = useState(true);
    const [loadingCourses, setLoadingCourses] = useState(true);
    
    // Pagination states
    const [notificationPage, setNotificationPage] = useState(1);
    const [schedulePage, setSchedulePage] = useState(1);
    const [coursePage, setCoursePage] = useState(1);
    const itemsPerPage = 3;

    // Format date helper
    const formatDate = (date) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
        return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    };


    // Load notifications
    useEffect(() => {
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
    }, []);

    // Load schedules
    useEffect(() => {
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
    }, []);

    // Load calendar data
    useEffect(() => {
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
    }, [calendarDate]);

    // Load courses
    useEffect(() => {
        const loadCourses = async () => {
            try {
                setLoadingCourses(true);
                await fetchCourses();
            } catch (error) {
                console.error('Error loading courses:', error);
            } finally {
                setLoadingCourses(false);
            }
        };
        loadCourses();
    }, []);

    useEffect(() => {
        if (courses && courses.length > 0) {
            setCoursesList(courses);
        }
    }, [courses]);

    // Calendar navigation
    const handlePrevMonth = () => {
        setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    // Get calendar month name
    const getMonthName = (date) => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
        return `${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    // Generate calendar days
    const generateCalendarDays = () => {
        const year = calendarDate.getFullYear();
        const month = calendarDate.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        
        // Get starting day (0 = Sunday, convert to Monday start)
        let startingDay = firstDay.getDay() - 1;
        if (startingDay < 0) startingDay = 6;
        
        const days = [];
        
        // Previous month days
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startingDay - 1; i >= 0; i--) {
            days.push({
                date: prevMonthLastDay - i,
                isCurrentMonth: false,
                fullDate: null
            });
        }
        
        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            const fullDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            days.push({
                date: i,
                isCurrentMonth: true,
                fullDate
            });
        }
        
        // Next month days
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

    // Check if date has events
    const getEventsForDate = (dateStr) => {
        if (!calendarData?.events || !dateStr) return [];
        
        return calendarData.events.filter(event => {
            const eventDate = new Date(event.date);
            const eventDateStr = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`;
            return eventDateStr === dateStr;
        });
    };

    // Check if date is today
    const isToday = (dateStr) => {
        if (!dateStr) return false;
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        return dateStr === todayStr;
    };

    // Pagination helpers
    const paginateData = (data, page, perPage) => {
        const start = (page - 1) * perPage;
        return data.slice(start, start + perPage);
    };

    const getTotalPages = (data, perPage) => {
        return Math.ceil(data.length / perPage);
    };

    // Get notification type/color
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

    // Format schedule date
    const formatScheduleDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <div className="bg-gray-50">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-[#5577B5] via-[#6B8BC5] to-[#7B9DD8] text-white px-8 py-6 rounded-2xl shadow-xl mx-8 mt-6 mb-8">
                <div>
                    <h1 className="text-2xl font-bold mb-1">
                        Welcome {dataKaryawan?.nama}
                    </h1>
                    <p className="text-blue-100">
                        {dataKaryawan?.company_name}
                    </p>
                    <p className="text-blue-100 text-sm text-right mt-2">
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
                </div>
            </div>

            {/* Main Content */}
            <div className="px-8 pb-8">
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-8">
                        {/* Notifications Card */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-500 p-2 rounded-lg">
                                            <Bell className="w-5 h-5 text-white" />
                                        </div>
                                        <h2 className="text-lg font-bold text-gray-900">NOTIFICATION</h2>
                                    </div>
                                    {notifications.length > 0 && (
                                        <span className="px-2 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
                                            {notifications.filter(n => !n.is_read).length} new
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 space-y-4 min-h-[300px] max-h-96 overflow-y-auto">
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
                                                className={`p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${style.bg} ${style.border} ${!notif.is_read ? 'ring-2 ring-blue-300' : ''}`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${style.dot}`}></div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-semibold text-gray-900 text-sm">{notif.title}</span>
                                                            {!notif.is_read && (
                                                                <span className="px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded">NEW</span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-700 leading-relaxed">
                                                            {notif.message}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-2">
                                                            {new Date(notif.created_at).toLocaleString('id-ID')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-48 text-center">
                                        <Bell className="w-12 h-12 text-gray-300 mb-3" />
                                        <p className="text-gray-400">No notifications</p>
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
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
                                                key={i}
                                                onClick={() => setNotificationPage(i + 1)}
                                                className={`w-2 h-2 rounded-full transition-colors ${notificationPage === i + 1 ? 'bg-blue-500' : 'bg-gray-300 hover:bg-gray-400'}`}
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

                        {/* Courses List Card */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="bg-purple-500 p-2 rounded-lg">
                                        <BookOpen className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-900">COURSES LIST</h2>
                                </div>
                            </div>

                            <div className="p-6 space-y-4 min-h-[300px] max-h-96 overflow-y-auto">
                                {loadingCourses ? (
                                    <div className="flex items-center justify-center h-48">
                                        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                                    </div>
                                ) : coursesList.length > 0 ? (
                                    paginateData(coursesList, coursePage, itemsPerPage).map((course) => (
                                        <div
                                            key={course.id || course.course_id}
                                            className="flex gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-purple-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                                        >
                                            <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0">
                                                <BookOpen className="w-8 h-8 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2">
                                                    {course.course_title || course.title}
                                                </h3>
                                                <p className="text-xs text-purple-600 mb-2">
                                                    Release: {formatScheduleDate(course.publish_date || course.created_at)}
                                                </p>
                                                <p className="text-xs text-gray-600 mb-3">
                                                    {course.enroll_type_name || 'General'} | {course.course_status_name || 'Mandatory'}
                                                </p>
                                                <div className="flex items-center gap-4 text-xs">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-900 text-lg">{course.enrolled_count || 0}</span>
                                                        <span className="text-gray-500">Enrolled</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-900 text-lg">{course.finished_count || 0}</span>
                                                        <span className="text-gray-500">Finished</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-48 text-center">
                                        <BookOpen className="w-12 h-12 text-gray-300 mb-3" />
                                        <p className="text-gray-400">No courses available</p>
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            {coursesList.length > itemsPerPage && (
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
                                        {Array.from({ length: getTotalPages(coursesList, itemsPerPage) }, (_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setCoursePage(i + 1)}
                                                className={`w-2 h-2 rounded-full transition-colors ${coursePage === i + 1 ? 'bg-purple-500' : 'bg-gray-300 hover:bg-gray-400'}`}
                                            />
                                        ))}
                                    </div>
                                    <button 
                                        onClick={() => setCoursePage(prev => Math.min(getTotalPages(coursesList, itemsPerPage), prev + 1))}
                                        disabled={coursePage === getTotalPages(coursesList, itemsPerPage)}
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
                        {/* Training Schedule Card */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-500 p-2 rounded-lg">
                                        <Calendar className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-900">TRAINING SCHEDULED</h2>
                                </div>
                            </div>

                            <div className="p-6 min-h-[200px]">
                                {loadingSchedules ? (
                                    <div className="flex items-center justify-center h-48">
                                        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                                    </div>
                                ) : schedules.length > 0 ? (
                                    <div className="space-y-4">
                                        {paginateData(schedules, schedulePage, 2).map((schedule, index) => (
                                            <div 
                                                key={index}
                                                className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-5 text-white"
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-white/20 p-2.5 rounded-lg">
                                                            <Calendar className="w-6 h-6 text-white" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-bold mb-1 line-clamp-1">
                                                                {schedule.course_title}
                                                            </h3>
                                                            <p className="text-blue-100 text-xs">
                                                                {schedule.enroll_type_name} | {schedule.course_status_name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className="px-3 py-1.5 bg-green-400 text-white rounded-lg font-semibold text-xs shadow-lg flex-shrink-0">
                                                        Online
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-blue-100">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        <span>Start: {formatScheduleDate(schedule.publish_date)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        <span>End: {formatScheduleDate(schedule.end_date)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Info className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className="text-gray-400">No scheduled training</p>
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
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
                                                key={i}
                                                onClick={() => setSchedulePage(i + 1)}
                                                className={`w-2 h-2 rounded-full transition-colors ${schedulePage === i + 1 ? 'bg-green-500' : 'bg-gray-300 hover:bg-gray-400'}`}
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

                        {/* Calendar Card */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-4 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-orange-500 p-2 rounded-lg">
                                            <Calendar className="w-5 h-5 text-white" />
                                        </div>
                                        <h2 className="text-lg font-bold text-gray-900">{getMonthName(calendarDate)}</h2>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={handlePrevMonth}
                                            className="p-2 hover:bg-white rounded-lg transition-colors"
                                        >
                                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                                        </button>
                                        <button 
                                            onClick={handleNextMonth}
                                            className="p-2 hover:bg-white rounded-lg transition-colors"
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
                                        {/* Calendar Grid Header */}
                                        <div className="grid grid-cols-7 gap-1 mb-2">
                                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                                                <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
                                                    {day}
                                                </div>
                                            ))}
                                        </div>
                                        
                                        {/* Calendar Grid */}
                                        <div className="grid grid-cols-7 gap-1">
                                            {generateCalendarDays().map((day, index) => {
                                                const events = getEventsForDate(day.fullDate);
                                                const hasEvents = events.length > 0;
                                                const isTodayDate = isToday(day.fullDate);
                                                
                                                // Determine tooltip position based on column
                                                const colIndex = index % 7;
                                                const isLeftEdge = colIndex <= 1; // First 2 columns
                                                const isRightEdge = colIndex >= 5; // Last 2 columns
                                                
                                                return (
                                                    <div
                                                        key={index}
                                                        className={`aspect-square flex flex-col items-center justify-center text-sm rounded-lg transition-all cursor-pointer relative group ${
                                                            !day.isCurrentMonth
                                                                ? 'text-gray-300'
                                                                : isTodayDate
                                                                ? 'bg-blue-500 text-white font-bold shadow-lg'
                                                                : hasEvents
                                                                ? 'bg-orange-100 text-orange-700 font-semibold border-2 border-orange-400 hover:bg-orange-200'
                                                                : 'hover:bg-gray-100 text-gray-700'
                                                        }`}
                                                    >
                                                        <span>{day.date}</span>
                                                        {hasEvents && !isTodayDate && (
                                                            <div className="absolute bottom-1 flex gap-0.5">
                                                                {events.slice(0, 3).map((_, i) => (
                                                                    <div key={i} className="w-1 h-1 rounded-full bg-orange-500" />
                                                                ))}
                                                            </div>
                                                        )}
                                                        
                                                        {/* Tooltip for events - Smart positioning */}
                                                        {hasEvents && (
                                                            <div 
                                                                className={`absolute bottom-full mb-2 hidden group-hover:block z-50
                                                                    ${isLeftEdge ? 'left-0' : isRightEdge ? 'right-0' : 'left-1/2 -translate-x-1/2'}
                                                                `}
                                                            >
                                                                <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl min-w-[220px] max-w-[280px]">
                                                                    <p className="font-semibold mb-2 pb-1">
                                                                        {events.length} Event(s)
                                                                    </p>
                                                                    {events.slice(0, 3).map((event, i) => (
                                                                        <div key={i} className="mb-2 last:mb-0">
                                                                            <p className="font-medium text-orange-300 leading-tight">
                                                                                {event.title}
                                                                            </p>
                                                                            <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5">
                                                                                <Building2 className="w-3 h-3 flex-shrink-0" />
                                                                                <span className="truncate">{event.company}</span>
                                                                            </p>
                                                                        </div>
                                                                    ))}
                                                                    {events.length > 3 && (
                                                                        <p className="text-gray-400 text-xs mt-2 pt-2 border-t border-gray-700">
                                                                            +{events.length - 3} more event(s)...
                                                                        </p>
                                                                    )}
                                                                    {/* Arrow */}
                                                                    <div 
                                                                        className={`absolute bottom-0 translate-y-full
                                                                            ${isLeftEdge ? 'left-3' : isRightEdge ? 'right-3' : 'left-1/2 -translate-x-1/2'}
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

                                        {/* Legend */}
                                        <div className="mt-4 pt-4  flex items-center justify-center gap-6 text-xs">
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded bg-blue-500"></div>
                                                <span className="text-gray-600">Today</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded bg-orange-100 border-2 border-orange-400"></div>
                                                <span className="text-gray-600">Has Events</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

HomeAdmin.layout = Admin;