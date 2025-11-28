import { useState, useContext } from 'react';
import WebLayout from "../layouts/WebLayout";
import { ProfileContext } from "../contexts/profile/ProfileContext";
import { 
    BookOpen, 
    Clock, 
    Award, 
    CheckCircle2, 
    AlertCircle,
    Target,
    BarChart3,
    BookMarked,
    Import,
} from 'lucide-react';
import Link from "next/link";
import { useCourses } from '../hooks/useCourses';
export default function ModernProfile() {
    const { getKaryawan, dataKaryawan } = useContext(ProfileContext);
    const {profileInfo} = useCourses();     
    const dataKaryawans = dataKaryawan?.length ? dataKaryawan[0] : [];
    const [activeTab, setActiveTab] = useState('course-profile');
    
    const apiData = profileInfo || dataKaryawans || {};
    const profileData = {
        // Profile info
        no_ktp: apiData.no_ktp || '',
        nama: apiData.nama || '',
        position_name: apiData.position_name || '',
        dept_abbr: apiData.dept_abbr || '',
        company_name: apiData.company_name || '',
        profile_photo_url : dataKaryawans.profile_photo_url || '',
        
        // Stats
        stats: {
            enrolled: apiData.course_enrolled || 0,
            outstanding: apiData.course_outstanding || 0,
            completed: apiData.course_completed || 0,
            passed: apiData.course_status?.[0]?.passed || 0,
            totalHours: Math.floor(parseInt(apiData.course_total_time?.split(':')[0] || 0)),
            totalMinutes: parseInt(apiData.course_total_time?.split(':')[1] || 0)
        },
        
        // Course Status (untuk donut chart)
        course_status: apiData.course_status?.[0] || {
            passed: 0,
            in_progress: 0,
            failed: 0,
            course_total: 0
        },
        
        courseStatus: {
            passed: apiData.course_status?.[0]?.passed || 0,
            inProgress: apiData.course_status?.[0]?.in_progress || 0,
            failed: apiData.course_status?.[0]?.failed || 0
        },
        
        // Course Results
        courseResults: (apiData.course_results || []).map(course => ({
            name: course.course_name,
            score: course.score
        })),
        
        // Mandatory Courses
        mandatoryCourses: (apiData.course_mandatory_list || []).map((course, index) => ({
            id: index + 1,
            title: course.course_name,
            completed: course.is_completed
        })),
        
        // eBooks
        ebooks: {
            read: apiData.ebook_read || 0,
            completed: apiData.ebook_completed || 0,
            incomplete: apiData.ebook_incomplete || 0,
            readingHours: Math.floor(apiData.ebook_reading_time / 60) || 0,
            readingMinutes: (apiData.ebook_reading_time % 60) || 0
        }
    };

    return (
       <WebLayout>
        <div className="h-full overflow-y-auto bg-gradient-to-br from-blue-200 via-white to-blue-100">
            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-100 text-white text-white py-8 px-6 shadow-lg">
                <div className="max-w-7xl mx-auto">
                    <Link href="/dashboard" className="text-2xl text-blue-100 mb-4 inline-block">Home/Profile</Link>
                    <p className="text-blue-100">Welcome back! Here's your learning journey</p>
                </div>
            </div>
            {/* Tabs */}
            <div className="max-w-7xl mx-auto px-6 -mt-6">
                <div className="bg-white rounded-t-xl shadow-lg p-2 flex gap-2">
                    <button
                        onClick={() => setActiveTab('course-profile')}
                        className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                            activeTab === 'course-profile'
                                ? 'bg-gradient-to-r from-blue-900 to-blue-600 text-white shadow-md'
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        Course Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('competencies')}
                        className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                            activeTab === 'competencies'
                                ? 'bg-gradient-to-r from-blue-900 to-blue-600 text-white shadow-md'
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        Competencies
                    </button>
                </div>
            </div>
            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 pb-8">
                <div className="bg-white rounded-b-xl shadow-lg p-8">
                    {activeTab === 'course-profile' && (
                        <div className="space-y-8">
                            {/* Profile Card with Modern Design */}
                            <div className="bg-gradient-to-r from-blue-900 to-blue-100 rounded-2xl p-8 text-white shadow-xl">
                                <div className="flex items-start gap-6">
                                    {/* Avatar with Glow Effect */}
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-white rounded-full blur-xl opacity-20"></div>
                                        <img
                                            src={`${process.env.BASE_URL}${profileData.profile_photo_url}`}
                                            alt={profileData.name}
                                            className="relative w-32 h-32 rounded-full border-4 border-white shadow-2xl object-cover"
                                        />
                                    </div>

                                    {/* Profile Info */}
                                    <div className="flex-1">
                                        <h2 className="text-3xl font-bold mb-4">{profileData.nama}</h2>
                                        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                                <span className="text-sm text-blue-100">Employee ID:</span>
                                                <span className="font-semibold">{profileData.no_ktp}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                                <span className="text-sm text-blue-100">Position:</span>
                                                <span className="font-semibold">{profileData.position_name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                                <span className="text-sm text-blue-100">Department:</span>
                                                <span className="font-semibold">{profileData.dept_abbr}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                                <span className="text-sm text-blue-100">Company Unit:</span>
                                                <span className="font-semibold">{profileData.company_name}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Cards Grid */}
                            <div className="grid lg:grid-cols-4 gap-6">
                                {/* Enrolled Card */}
                                <div className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-300 hover:-translate-y-1">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="bg-blue-100 p-3 rounded-xl group-hover:bg-blue-600 transition-colors">
                                            <BookOpen className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                                        </div>
                                        <span className="text-3xl font-bold text-gray-900">{profileData.stats.enrolled}</span>
                                    </div>
                                    <h3 className="text-gray-600 font-medium mb-1">Courses Enrolled</h3>
                                    <p className="text-sm text-gray-400">Total course</p>
                                </div>

                                {/* Outstanding Card */}
                                <div className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-orange-300 hover:-translate-y-1">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="bg-orange-100 p-3 rounded-xl group-hover:bg-orange-500 transition-colors">
                                            <AlertCircle className="w-6 h-6 text-orange-500 group-hover:text-white transition-colors" />
                                        </div>
                                        <span className="text-3xl font-bold text-gray-900">{profileData.stats.outstanding}</span>
                                    </div>
                                    <h3 className="text-gray-600 font-medium mb-1">Courses Outstanding</h3>
                                    <p className="text-sm text-gray-400">Total course</p>
                                </div>

                                {/* Completed Card */}
                                <div className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-green-300 hover:-translate-y-1">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="bg-green-100 p-3 rounded-xl group-hover:bg-green-500 transition-colors">
                                            <Award className="w-6 h-6 text-green-500 group-hover:text-white transition-colors" />
                                        </div>
                                        <span className="text-3xl font-bold text-gray-900">{profileData.stats.completed}</span>
                                    </div>
                                    <h3 className="text-gray-600 font-medium mb-1">Courses Completed</h3>
                                    <p className="text-sm text-gray-400">Total course</p>
                                </div>

                                {/* Time Total Card */}
                                <div className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-purple-300 hover:-translate-y-1">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="bg-purple-100 p-3 rounded-xl group-hover:bg-purple-500 transition-colors">
                                            <Clock className="w-6 h-6 text-purple-500 group-hover:text-white transition-colors" />
                                        </div>
                                        <div className="text-right">
                                            <span className="text-3xl font-bold text-gray-900">{profileData.stats.totalHours}</span>
                                            <span className="text-lg text-gray-500">h</span>
                                            <span className="text-2xl font-bold text-gray-900 ml-1">{profileData.stats.totalMinutes}</span>
                                            <span className="text-lg text-gray-500">m</span>
                                        </div>
                                    </div>
                                    <h3 className="text-gray-600 font-medium mb-1">Time Total</h3>
                                    <p className="text-sm text-gray-400">Learning hours</p>
                                </div>
                            </div>

                            {/* Main Content Grid */}
                            <div className="grid lg:grid-cols-3 gap-6">
                                {/* Course Status - Modern Circular Progress */}
                                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                        <Target className="w-5 h-5 text-blue-600" />
                                        Courses Status
                                    </h3>
                                    
                                    <div className="flex items-center justify-center mb-6">
                                        <div className="relative w-48 h-48">
                                            {/* Circular Progress */}
                                            <svg className="w-full h-full transform -rotate-90">
                                                <circle
                                                    cx="96"
                                                    cy="96"
                                                    r="80"
                                                    stroke="#e5e7eb"
                                                    strokeWidth="16"
                                                    fill="none"
                                                />
                                                <circle
                                                    cx="96"
                                                    cy="96"
                                                    r="80"
                                                    stroke="url(#gradient)"
                                                    strokeWidth="16"
                                                    fill="none"
                                                    strokeDasharray={2 * Math.PI * 80}
                                                    strokeDashoffset={
                                                        2 * Math.PI * 80 * (1 - (profileData.course_status.course_total > 0 ? profileData.course_status.passed / profileData.course_status.course_total : 0))
                                                    }
                                                    strokeLinecap="round"
                                                    className="transition-all duration-1000"
                                                />
                                                <defs>
                                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                        <stop offset="0%" stopColor="#10b981" />
                                                        <stop offset="100%" stopColor="#059669" />
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                                <span className="text-4xl font-bold text-gray-900">{profileData.courseStatus.passed}</span>
                                                <span className="text-sm text-gray-500">Courses</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                                <span className="text-sm font-medium text-gray-700">Passed</span>
                                            </div>
                                            <span className="text-sm font-bold text-green-600">
                                                {profileData.courseStatus.passed}%
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                                <span className="text-sm font-medium text-gray-700">In Progress</span>
                                            </div>
                                            <span className="text-sm font-bold text-blue-600">0%</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                                <span className="text-sm font-medium text-gray-700">Failed</span>
                                            </div>
                                            <span className="text-sm font-bold text-red-600">0%</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Course Results - Modern Chart */}
                                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5 text-purple-600" />
                                        Courses Result
                                    </h3>

                                    <div className="space-y-4">
                                        {profileData.courseResults.map((course, index) => (
                                            <div key={index} className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-medium text-gray-600 truncate">
                                                        {course.name}
                                                    </span>
                                                    <span className="text-sm font-bold text-gray-900">{course.score}</span>
                                                </div>
                                                <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000"
                                                        style={{
                                                            width: `${course.score}%`,
                                                            background: course.score >= 90 
                                                                ? 'linear-gradient(90deg, #10b981, #059669)'
                                                                : course.score >= 75
                                                                ? 'linear-gradient(90deg, #3b82f6, #2563eb)'
                                                                : 'linear-gradient(90deg, #f59e0b, #d97706)'
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Score Legend */}
                                    <div className="mt-6 pt-4 border-t border-gray-100 flex gap-4 text-xs">
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            <span className="text-gray-600">90-100</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                            <span className="text-gray-600">75-89</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                            <span className="text-gray-600">&lt;75</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Mandatory Course List - Modern Checklist */}
                                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                                        Mandatory Course List
                                    </h3>

                                    <div className="space-y-3">
                                        {profileData.mandatoryCourses.map((course) => (
                                            <div
                                                key={course.id}
                                                className={`flex items-start gap-3 p-4 rounded-xl transition-all duration-200 ${
                                                    course.completed
                                                        ? 'bg-green-50 border-2 border-green-200'
                                                        : 'bg-gray-50 border-2 border-gray-200 hover:border-blue-300'
                                                }`}
                                            >
                                                <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                                                    course.completed
                                                        ? 'bg-green-500'
                                                        : 'bg-white border-2 border-gray-300'
                                                }`}>
                                                    {course.completed && (
                                                        <CheckCircle2 className="w-4 h-4 text-white" />
                                                    )}
                                                </div>
                                                <span className={`text-sm font-medium flex-1 ${
                                                    course.completed
                                                        ? 'text-green-800'
                                                        : 'text-gray-700'
                                                }`}>
                                                    {course.title}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* eBook Stats Grid */}
                            <div className="grid lg:grid-cols-4 gap-6">
                                {/* eBook Read */}
                                <div className="group bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 text-white">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                                            <BookMarked className="w-6 h-6 text-white" />
                                        </div>
                                        <span className="text-4xl font-bold">{profileData.ebooks.read}</span>
                                    </div>
                                    <h3 className="font-semibold mb-1">eBook Read</h3>
                                    <p className="text-sm text-blue-100">Total eBook</p>
                                </div>

                                {/* eBook Completed */}
                                <div className="group bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 text-white">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                                            <CheckCircle2 className="w-6 h-6 text-white" />
                                        </div>
                                        <span className="text-4xl font-bold">{profileData.ebooks.completed}</span>
                                    </div>
                                    <h3 className="font-semibold mb-1">eBook Completed</h3>
                                    <p className="text-sm text-green-100">Total eBook</p>
                                </div>

                                {/* eBook Incomplete */}
                                <div className="group bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 text-white">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                                            <AlertCircle className="w-6 h-6 text-white" />
                                        </div>
                                        <span className="text-4xl font-bold">{profileData.ebooks.incomplete}</span>
                                    </div>
                                    <h3 className="font-semibold mb-1">eBook Incomplete</h3>
                                    <p className="text-sm text-orange-100">Total eBook</p>
                                </div>

                                {/* Reading Hours */}
                                <div className="group bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 text-white">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                                            <Clock className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="text-right">
                                            <span className="text-4xl font-bold">{profileData.ebooks.readingHours}</span>
                                            <span className="text-lg">h</span>
                                            <span className="text-3xl font-bold ml-1">{profileData.ebooks.readingMinutes}</span>
                                            <span className="text-lg">m</span>
                                        </div>
                                    </div>
                                    <h3 className="font-semibold mb-1">Reading Hours</h3>
                                    <p className="text-sm text-purple-100">Total time</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'competencies' && (
                        <div className="text-center py-20">
                            <Award className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Competencies</h3>
                            <p className="text-gray-500">This section is under development</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
        </WebLayout>
    );
}