import { useState, useContext } from "react";
import WebLayout from "@/layouts/WebLayout";
import { ProfileContext } from "@/contexts/profile/ProfileContext";
import {
  BookOpen,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  Target,
  BarChart3,
  BookMarked,
  ChevronLeft,
  TrendingUp,
  Calendar,
  GraduationCap,
  Trophy,
  Zap,
  BookText,
  Timer,
  CheckCheck,
  XCircle,
  Play,
  Building2,
  Briefcase,
  IdCard,
  RefreshCw,
  TrendingDown,
  FileCheck,
  FileX
} from "lucide-react";
import Link from "next/link";
import { useCourses } from "@/hooks/useCourses";

export default function ModernProfile() {
  const { dataKaryawan } = useContext(ProfileContext);
  const { profileInfo } = useCourses();
  const [activeTab, setActiveTab] = useState("overview");

  const apiData = profileInfo || dataKaryawan || {};
  
  const profileData = {
    no_ktp: apiData.no_ktp || "",
    nama: apiData.nama || "",
    position_name: apiData.position_name || "",
    dept_abbr: apiData.dept_abbr || "",
    company_name: apiData.company_name || "",
    profile_photo_url: dataKaryawan?.profile_photo_url || "/img/user.png",

    stats: {
      enrolled: apiData.course_enrolled || 0,
      outstanding: apiData.course_outstanding || 0,
      completed: apiData.course_completed || 0,
      totalHours: Math.floor(parseInt(apiData.course_total_time?.split(":")[0] || 0)),
      totalMinutes: parseInt(apiData.course_total_time?.split(":")[1] || 0),
    },

    courseStatus: {
      passed: apiData.course_status?.[0]?.passed || 0,
      inProgress: apiData.course_status?.[0]?.in_progress || 0,
      failed: apiData.course_status?.[0]?.failed || 0,
      total: apiData.course_status?.[0]?.course_total || 0,
    },

    courseResults: (apiData.course_results || []).map((course) => ({
      name: course.course_name,
      score: course.score,
    })),

    mandatoryCourses: (apiData.course_mandatory_list || []).map((course, index) => ({
      id: index + 1,
      title: course.course_name,
      completed: course.is_completed,
    })),

    ebooks: {
      read: apiData.ebook_read || 0,
      completed: apiData.ebook_completed || 0,
      incomplete: apiData.ebook_incomplete || 0,
      readingHours: Math.floor((apiData.ebook_reading_time || 0) / 60),
      readingMinutes: (apiData.ebook_reading_time || 0) % 60,
    },
  };

  const totalCourses = profileData.courseStatus.total || 
    (profileData.courseStatus.passed + profileData.courseStatus.inProgress + profileData.courseStatus.failed);

  const completionRate = profileData.stats.enrolled > 0 
    ? Math.round((profileData.stats.completed / profileData.stats.enrolled) * 100) 
    : 0;

  const passRate = totalCourses > 0
    ? Math.round((profileData.courseStatus.passed / totalCourses) * 100)
    : 0;

  return (
    <WebLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          
          {/* Breadcrumb */}
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center group-hover:bg-gray-50 group-hover:border-gray-300 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </div>
              <span className="font-medium">Back to Dashboard</span>
            </Link>
            
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>Last updated: Today</span>
            </div>
          </div>

          {/* Profile Card - Clean Simple Style */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile</h2>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-gray-100">
                    <img
                      src={
                        profileData.profile_photo_url?.startsWith('http') 
                          ? profileData.profile_photo_url 
                          : `${process.env.BASE_URL || ''}${profileData.profile_photo_url}`
                      }
                      alt={profileData.nama || "Profile"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/img/user.png';
                      }}
                    />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                    {profileData.nama || "User"}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-2 text-sm text-gray-500 mt-1">
                    <span>{profileData.position_name || "-"}</span>
                    <span className="text-gray-300">|</span>
                    <span>{profileData.company_name || "-"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1.5 mb-6">
            <div className="flex gap-1 overflow-x-auto">
              {[
                { id: 'overview', label: 'Course Profile', icon: BarChart3 },
                { id: 'competencies', label: 'Competencies', icon: Award },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-slate-800 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="pb-8">
            {activeTab === "overview" && (
              <div className="space-y-6">
                
                {/* Course Stats Cards */}
                <div className="grid lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <RefreshCw className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        Total
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {profileData.stats.enrolled}
                    </div>
                    <div className="text-sm text-gray-500">Courses Enrolled</div>
                  </div>

                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                        <TrendingDown className="w-5 h-5 text-amber-600" />
                      </div>
                      <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                        Pending
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {profileData.stats.outstanding}
                    </div>
                    <div className="text-sm text-gray-500">Outstanding</div>
                  </div>

                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                        <FileCheck className="w-5 h-5 text-green-600" />
                      </div>
                      <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        Done
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {profileData.stats.completed}
                    </div>
                    <div className="text-sm text-gray-500">Completed</div>
                  </div>

                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                        <Timer className="w-5 h-5 text-purple-600" />
                      </div>
                      <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                        Time
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {profileData.stats.totalHours}h {profileData.stats.totalMinutes}m
                    </div>
                    <div className="text-sm text-gray-500">Learning Time</div>
                  </div>
                </div>

                {/* Charts Row - 3 Columns */}
                <div className="grid lg:grid-cols-3 gap-6">
                  
                  {/* Course Status - Donut Chart */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-900 text-center mb-6">Courses Status</h3>

                    <div className="flex items-center justify-center mb-6">
                      <div className="relative w-40 h-40">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="38" stroke="#f3f4f6" strokeWidth="10" fill="none" />
                          
                          {totalCourses > 0 && (
                            <>
                              {profileData.courseStatus.failed > 0 && (
                                <circle
                                  cx="50" cy="50" r="38"
                                  stroke="#ef4444"
                                  strokeWidth="10"
                                  fill="none"
                                  strokeDasharray={`${(profileData.courseStatus.failed / totalCourses) * 238.76} 238.76`}
                                  strokeLinecap="round"
                                />
                              )}
                              
                              {profileData.courseStatus.inProgress > 0 && (
                                <circle
                                  cx="50" cy="50" r="38"
                                  stroke="#3b82f6"
                                  strokeWidth="10"
                                  fill="none"
                                  strokeDasharray={`${(profileData.courseStatus.inProgress / totalCourses) * 238.76} 238.76`}
                                  strokeDashoffset={`${-(profileData.courseStatus.failed / totalCourses) * 238.76}`}
                                  strokeLinecap="round"
                                />
                              )}
                              
                              {profileData.courseStatus.passed > 0 && (
                                <circle
                                  cx="50" cy="50" r="38"
                                  stroke="#22c55e"
                                  strokeWidth="10"
                                  fill="none"
                                  strokeDasharray={`${(profileData.courseStatus.passed / totalCourses) * 238.76} 238.76`}
                                  strokeDashoffset={`${-((profileData.courseStatus.failed + profileData.courseStatus.inProgress) / totalCourses) * 238.76}`}
                                  strokeLinecap="round"
                                />
                              )}
                            </>
                          )}
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                          <span className="text-3xl font-bold text-gray-900">{totalCourses}</span>
                          <span className="text-xs text-gray-500">Courses</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="text-sm text-gray-600">Passed</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {totalCourses > 0 ? Math.round((profileData.courseStatus.passed / totalCourses) * 100) : 0}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <span className="text-sm text-gray-600">In Progress</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {totalCourses > 0 ? Math.round((profileData.courseStatus.inProgress / totalCourses) * 100) : 0}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <span className="text-sm text-gray-600">Failed</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {totalCourses > 0 ? Math.round((profileData.courseStatus.failed / totalCourses) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Course Results - Line Chart */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-900 text-center mb-6">Courses Result</h3>
                    
                    {profileData.courseResults.length > 0 ? (
                      <>
                        <div className="relative h-48">
                          <svg className="w-full h-full" viewBox="0 0 280 140" preserveAspectRatio="xMidYMid meet">
                            {/* Y-axis */}
                            <text x="12" y="15" fontSize="9" fill="#9ca3af">100</text>
                            <text x="17" y="40" fontSize="9" fill="#9ca3af">75</text>
                            <text x="17" y="65" fontSize="9" fill="#9ca3af">50</text>
                            <text x="17" y="90" fontSize="9" fill="#9ca3af">25</text>
                            <text x="22" y="115" fontSize="9" fill="#9ca3af">0</text>
                            
                            {/* Grid */}
                            {[10, 35, 60, 85, 110].map((y, i) => (
                              <line key={i} x1="35" y1={y} x2="270" y2={y} stroke="#f3f4f6" strokeWidth="1" strokeDasharray={i === 4 ? "0" : "3,3"} />
                            ))}
                            
                            {/* Line */}
                            {profileData.courseResults.length > 1 && (
                              <path
                                d={profileData.courseResults.slice(0, 5).map((r, i) => {
                                  const spacing = 200 / Math.max(profileData.courseResults.slice(0, 5).length - 1, 1);
                                  const x = 50 + (i * spacing);
                                  const y = 110 - (r.score * 1);
                                  return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
                                }).join(' ')}
                                fill="none"
                                stroke="#a78bfa"
                                strokeWidth="2"
                              />
                            )}
                            
                            {/* Points */}
                            {profileData.courseResults.slice(0, 5).map((r, i) => {
                              const spacing = profileData.courseResults.slice(0, 5).length > 1 ? 200 / (profileData.courseResults.slice(0, 5).length - 1) : 0;
                              const x = profileData.courseResults.slice(0, 5).length === 1 ? 150 : 50 + (i * spacing);
                              const y = 110 - (r.score * 1);
                              const colors = ['#a78bfa', '#22c55e', '#f59e0b', '#3b82f6', '#ec4899'];
                              
                              return (
                                <g key={i}>
                                  <circle cx={x} cy={y} r="5" fill={colors[i % colors.length]} stroke="white" strokeWidth="2" />
                                  <text x={x} y={y - 10} fontSize="9" fill="#6b7280" textAnchor="middle">{r.score}</text>
                                </g>
                              );
                            })}
                          </svg>
                        </div>

                        <div className="flex flex-wrap justify-center gap-3 mt-2">
                          {profileData.courseResults.slice(0, 3).map((r, i) => {
                            const colors = ['bg-purple-400', 'bg-green-500', 'bg-amber-500'];
                            return (
                              <div key={i} className="flex items-center gap-1.5">
                                <div className={`w-2.5 h-2.5 rounded-full ${colors[i]}`}></div>
                                <span className="text-xs text-gray-600 max-w-[80px] truncate">{r.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-48">
                        <BookOpen className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-gray-500 text-sm">No results yet</p>
                      </div>
                    )}
                  </div>

                  {/* Mandatory Courses */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-semibold text-gray-900">Mandatory Course List</h3>
                      <span className="text-xs text-gray-500">
                        <span className="font-semibold text-green-600">
                          {profileData.mandatoryCourses.filter(c => c.completed).length}
                        </span>
                        /{profileData.mandatoryCourses.length}
                      </span>
                    </div>

                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      {profileData.mandatoryCourses.length > 0 ? (
                        profileData.mandatoryCourses.map((course) => (
                          <div
                            key={course.id}
                            className={`flex items-center gap-3 p-3 rounded-lg ${
                              course.completed ? "bg-green-50" : "bg-gray-50"
                            }`}
                          >
                            <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
                              course.completed ? "bg-green-500" : "border-2 border-gray-300 bg-white"
                            }`}>
                              {course.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                            </div>
                            <span className={`text-sm line-clamp-2 ${
                              course.completed ? "text-green-800" : "text-gray-700"
                            }`}>
                              {course.title}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8">
                          <CheckCheck className="w-12 h-12 text-gray-300 mb-3" />
                          <p className="text-gray-500 text-sm">No mandatory courses</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* E-Book Stats */}
                <div className="grid lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <BookMarked className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{profileData.ebooks.read}</div>
                    <div className="text-sm text-gray-500">eBook Read</div>
                  </div>

                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                        <FileCheck className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{profileData.ebooks.completed}</div>
                    <div className="text-sm text-gray-500">eBook Completed</div>
                  </div>

                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                        <FileX className="w-5 h-5 text-amber-600" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{profileData.ebooks.incomplete}</div>
                    <div className="text-sm text-gray-500">eBook Incomplete</div>
                  </div>

                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-purple-600" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {profileData.ebooks.readingHours}h {profileData.ebooks.readingMinutes}m
                    </div>
                    <div className="text-sm text-gray-500">Reading Hours</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "competencies" && (
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Zap className="w-10 h-10 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Competencies Coming Soon</h3>
                  <p className="text-gray-500 mb-6">
                    We're working on bringing you a comprehensive view of your skills and competencies. 
                    Stay tuned for updates!
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium">
                    <Clock className="w-4 h-4" />
                    Under Development
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </WebLayout>
  );
}