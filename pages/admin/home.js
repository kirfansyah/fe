import { useState } from 'react';
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
    Info
} from 'lucide-react';
import Admin from "layouts/Admin.js";
export default function HomeAdmin() {
    const [currentDate] = useState(new Date());

    // Mock data
    const dashboardData = {
        user: {
            name: 'Annisa Karim',
            position: 'People Development Officer',
            company: 'Sambu Group',
            date: 'Monday, October 17, 2025',
            time: '09:32 WIB'
        },
        notifications: [
            {
                id: 1,
                name: 'Bury Illenia',
                department: 'Human Resources',
                company: 'Pulau Sambu Jakarta',
                course: 'Teknik Dasar Pengelasan',
                date: '21 September 2025',
                status: 'Passed',
                type: 'success'
            },
            {
                id: 2,
                name: 'Alfin Simatupang',
                department: 'Human Resources',
                company: 'Pulau Sambu Jakarta',
                course: 'Teknik Dasar Pengelasan',
                date: '20 September 2025',
                status: 'Passed',
                type: 'success'
            },
            {
                id: 3,
                name: 'Adit Donarich',
                department: 'Human Resources',
                company: 'Pulau Sambu Jakarta',
                certificate: 'HACCP',
                expireDate: '20-11-2025',
                type: 'warning'
            }
        ],
        trainingSchedule: {
            date: '27-10-2025',
            title: 'SERTIFIKASI HALAL',
            subtitle: 'Specific | Enrolled | Mandatory',
            status: 'Online',
            isEmpty: false
        },
        courses: [
            {
                id: 1,
                title: 'PENGENALAN LINGKUNGAN KERJA',
                releaseDate: '10-01-2025',
                type: 'General | All Employee | Mandatory',
                enrolled: 423,
                finished: 411,
                image: '/api/placeholder/80/80'
            },
            {
                id: 2,
                title: 'KESELAMATAN KERJA TINGKAT DASAR',
                releaseDate: '10-02-2025',
                type: 'General | All Employee | Mandatory',
                enrolled: 226,
                finished: 223,
                image: '/api/placeholder/80/80'
            },
            {
                id: 3,
                title: 'TEKNIK DASAR PENGELASAN',
                releaseDate: '21-10-2025',
                type: 'Specific | Enrolled | Mandatory',
                enrolled: 2,
                finished: 2,
                image: '/api/placeholder/80/80'
            },
            {
                id: 4,
                title: 'SERTIFIKASI HALAL',
                releaseDate: '20-10-2025',
                type: 'Specific | Enrolled | Mandatory',
                enrolled: 12,
                finished: 0,
                image: '/api/placeholder/80/80'
            }
        ]
    };

    return (
        // ✅ REMOVE min-h-screen, biarkan Admin layout yang handle
        <div className="bg-gray-50">
            {/* Welcome Banner - Disesuaikan untuk di dalam layout */}
            <div className="bg-gradient-to-r from-[#5577B5] via-[#6B8BC5] to-[#7B9DD8] text-white px-8 py-6 rounded-2xl shadow-xl mx-8 mt-6 mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-1">
                            Welcome {dashboardData.user.name}
                        </h1>
                        <p className="text-blue-100">
                            {dashboardData.user.position} - {dashboardData.user.company}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-blue-100 text-sm">{dashboardData.user.date}</p>
                        <p className="text-xl font-semibold">{dashboardData.user.time}</p>
                    </div>
                </div>
            </div>

            {/* Main Content - Tambah padding horizontal dan bottom */}
            <div className="px-8 pb-8">
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-8">
                        {/* Notifications Card */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-500 p-2 rounded-lg">
                                        <Bell className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-900">NOTIFICATION</h2>
                                </div>
                            </div>

                            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                                {dashboardData.notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className={`p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                                            notif.type === 'success'
                                                ? 'bg-green-50 border-green-200 hover:border-green-300'
                                                : 'bg-orange-50 border-orange-200 hover:border-orange-300'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                                notif.type === 'success' ? 'bg-green-500' : 'bg-orange-500'
                                            }`}></div>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-700 leading-relaxed">
                                                    <span className="font-semibold text-gray-900">[{notif.name}]</span>{' '}
                                                    <span className="text-gray-600">[{notif.department}]</span>{' '}
                                                    <span className="text-gray-600">[{notif.company}]</span>{' '}
                                                    {notif.course && (
                                                        <>
                                                            telah menyelesaikan course{' '}
                                                            <span className="font-semibold text-gray-900">[{notif.course}]</span>{' '}
                                                            <span className="text-gray-600">[{notif.date}]</span>{' '}
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                                notif.type === 'success'
                                                                    ? 'bg-green-500 text-white'
                                                                    : 'bg-orange-500 text-white'
                                                            }`}>
                                                                [{notif.status}]
                                                            </span>
                                                        </>
                                                    )}
                                                    {notif.certificate && (
                                                        <>
                                                            Sertifikat{' '}
                                                            <span className="font-semibold text-gray-900">[{notif.certificate}]</span>{' '}
                                                            akan Expire{' '}
                                                            <span className="font-semibold text-orange-600">[{notif.expireDate}]</span>
                                                        </>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors">
                                    <ChevronLeft className="w-4 h-4" />
                                    Previous
                                </button>
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                                    <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                                </div>
                                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors">
                                    Next
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
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

                            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                                {dashboardData.courses.map((course) => (
                                    <div
                                        key={course.id}
                                        className="flex gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                                    >
                                        <img
                                            src={course.image}
                                            alt={course.title}
                                            className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 text-sm mb-1">
                                                {course.title}
                                            </h3>
                                            <p className="text-xs text-blue-600 mb-2">
                                                Release: {course.releaseDate}
                                            </p>
                                            <p className="text-xs text-gray-600 mb-3">
                                                {course.type}
                                            </p>
                                            <div className="flex items-center gap-4 text-xs">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900 text-lg">{course.enrolled}</span>
                                                    <span className="text-gray-500">Enrolled</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900 text-lg">{course.finished}</span>
                                                    <span className="text-gray-500">Finished</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors">
                                    <ChevronLeft className="w-4 h-4" />
                                    Previous
                                </button>
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                    <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                                    <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                                </div>
                                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors">
                                    Next
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
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

                            <div className="p-6">
                                {!dashboardData.trainingSchedule.isEmpty ? (
                                    <div className="space-y-4">
                                        <div className="text-center mb-4">
                                            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold">
                                                {dashboardData.trainingSchedule.date}
                                            </span>
                                        </div>
                                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-white/20 p-3 rounded-lg">
                                                        <Calendar className="w-8 h-8 text-white" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold mb-1">
                                                            {dashboardData.trainingSchedule.title}
                                                        </h3>
                                                        <p className="text-blue-100 text-sm">
                                                            {dashboardData.trainingSchedule.subtitle}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="px-4 py-2 bg-green-400 text-white rounded-lg font-semibold text-sm shadow-lg">
                                                    [{dashboardData.trainingSchedule.status}]
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Info className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className="text-gray-400">empty schedule</p>
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors">
                                    <ChevronLeft className="w-4 h-4" />
                                    Previous
                                </button>
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                                    <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                                </div>
                                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors">
                                    Next
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Calendar Card */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-4 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-orange-500 p-2 rounded-lg">
                                            <Calendar className="w-5 h-5 text-white" />
                                        </div>
                                        <h2 className="text-lg font-bold text-gray-900">October 2025</h2>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2 hover:bg-white rounded-lg transition-colors">
                                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                                        </button>
                                        <button className="p-2 hover:bg-white rounded-lg transition-colors">
                                            <ChevronRight className="w-5 h-5 text-gray-600" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                {/* Calendar Grid */}
                                <div className="grid grid-cols-7 gap-2 mb-2">
                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                                        <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
                                            {day.slice(0, 3)}
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 gap-2">
                                    {/* Calendar dates - simplified */}
                                    {Array.from({ length: 35 }, (_, i) => {
                                        const date = i - 2; // Start from -2 to show previous month
                                        const isCurrentMonth = date > 0 && date <= 31;
                                        const isToday = date === 17;
                                        const hasEvent = [27].includes(date);
                                        
                                        return (
                                            <div
                                                key={i}
                                                className={`aspect-square flex items-center justify-center text-sm rounded-lg transition-all cursor-pointer ${
                                                    !isCurrentMonth
                                                        ? 'text-gray-300'
                                                        : isToday
                                                        ? 'bg-blue-500 text-white font-bold shadow-lg'
                                                        : hasEvent
                                                        ? 'bg-blue-100 text-blue-700 font-semibold border-2 border-blue-500'
                                                        : 'hover:bg-gray-100 text-gray-700'
                                                }`}
                                            >
                                                {date > 0 && date <= 31 ? date : ''}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
HomeAdmin.layout = Admin;