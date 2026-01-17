import { useState, useContext, useRef } from "react";
import WebLayout from "../layouts/WebLayout";
import { ProfileContext } from "../contexts/profile/ProfileContext";
import { AuthContext } from "../contexts/AuthContext";
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
  Camera,
  Edit3,
  Save,
  X,
  Lock,
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  MapPin,
  Settings,
  Shield,
  Bell
} from "lucide-react";
import Link from "next/link";
import { useCourses } from "../hooks/useCourses";
import ChangePasswordModal from "components/ChangePasswordModal";
import { LanguageContext } from "contexts/LanguageContext";
export default function CompleteModernProfile() {
  const { getKaryawan, dataKaryawan, updateProfile, uploadProfilePhoto } = useContext(ProfileContext);
  const { stateLanguage, changeLanguage } = useContext(LanguageContext); 
  const { profileInfo } = useCourses();
  const [activeTab, setActiveTab] = useState("overview");
  const { listLanguage } = stateLanguage;
  const { changePassword } = useContext(AuthContext);
  // Photo upload states
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);
  
  // Edit profile states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);
  
  const apiData = profileInfo || {};
  
  const profileData = {
    no_ktp: apiData.no_ktp || "",
    nama: apiData.nama || "",
    position_name: apiData.position_name || "",
    dept_abbr: apiData.dept_abbr || "",
    company_name: apiData.company_name || "",
    email: dataKaryawan.email || "",
    phone: dataKaryawan.phone_number || "",
    address: apiData.address || "",
    nik : dataKaryawan.nik || "",
    profile_photo_url: dataKaryawan.profile_photo_url,

    stats: {
      enrolled: apiData.course_enrolled || 0,
      outstanding: apiData.course_outstanding || 0,
      completed: apiData.course_completed || 0,
      passed: apiData.course_status?.[0]?.passed || 0,
      totalHours: Math.floor(parseInt(apiData.course_total_time?.split(":")[0] || 0)),
      totalMinutes: parseInt(apiData.course_total_time?.split(":")[1] || 0),
    },

    course_status: apiData.course_status?.[0] || {
      passed: 0,
      in_progress: 0,
      failed: 0,
      course_total: 0,
    },

    courseStatus: {
      passed: apiData.course_status?.[0]?.passed || 0,
      inProgress: apiData.course_status?.[0]?.in_progress || 0,
      failed: apiData.course_status?.[0]?.failed || 0,
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
      readingHours: Math.floor(apiData.ebook_reading_time / 60) || 0,
      readingMinutes: apiData.ebook_reading_time % 60 || 0,
    },
  };

  const completionRate = profileData.stats.enrolled > 0 
    ? Math.round((profileData.stats.completed / profileData.stats.enrolled) * 100) 
    : 0;

  const passRate = profileData.course_status.course_total > 0
    ? Math.round((profileData.course_status.passed / profileData.course_status.course_total) * 100)
    : 0;

  const handlePhotoChange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);

      try {
        setUploadingPhoto(true);
        
        // ✅ Kirim object dengan semua parameter (password kosong)
        await changePassword({
          current_password: '', // Kosong
          new_password: '', // Kosong
          confirm_new_password: '', // Kosong
          profile_photo: file // ✅ File foto
        });
        
        await getKaryawan();
      } catch (error) {
        console.error('Error uploading photo:', error);
        setPhotoPreview(null);
      } finally {
        setUploadingPhoto(false);
      }
  };

  // Handle profile edit
  const startEditProfile = () => {
    setProfileForm({
      nama: profileData.nama,
      email: profileData.email,
      phone: profileData.phone,
      address: profileData.address,
    });
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      if (updateProfile) {
        await updateProfile(profileForm);
        await getKaryawan();
      }
      setIsEditingProfile(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  
  const [showChangePassword, setShowChangePassword] = useState(false);
  return (
    <WebLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Back Button */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group mb-6"
          >
            <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-200 flex items-center justify-center group-hover:bg-gray-50 transition-all">
              <ChevronLeft className="w-5 h-5" />
            </div>
            <span className="font-semibold">Back</span>
          </Link>

          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* LEFT SIDEBAR */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Main Profile Card */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                {/* Header Pattern */}
                <div className="h-32 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 relative">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
                </div>

                <div className="relative px-6 pb-6">
                  {/* Avatar */}
                  <div className="flex justify-center -mt-16 mb-4">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 p-1 shadow-2xl">
                        <img
                          src={photoPreview || (
                             `${process.env.NEXT_PUBLIC_API_BASE || ''}${profileData.profile_photo_url}`
                          )}
                          alt={profileData.nama || "Profile"}
                          className="w-full h-full rounded-full object-cover bg-white"
                          
                        />
                      </div>
                      
                      {/* Upload Button */}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingPhoto}
                        className="absolute bottom-1 right-1 w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all group-hover:scale-110 disabled:opacity-50"
                      >
                        {uploadingPhoto ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Camera className="w-5 h-5" />
                        )}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Name & Position */}
                  <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                      {profileData.nama || "User"}
                    </h1>
                    <p className="text-sm text-gray-500">
                      {profileData.dept_abbr} • {profileData.company_name}
                    </p>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                      <div className="text-2xl font-bold text-blue-600">{profileData.stats.enrolled}</div>
                      <div className="text-xs text-gray-600 font-medium">Courses</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                      <div className="text-2xl font-bold text-green-600">{completionRate}%</div>
                      <div className="text-xs text-gray-600 font-medium">Complete</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                      <div className="text-2xl font-bold text-purple-600">{profileData.stats.totalHours}h</div>
                      <div className="text-xs text-gray-600 font-medium">Learning</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {/* <button
                      onClick={startEditProfile}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit Profile
                    </button> */}
                    <button
                      onClick={() => setShowChangePassword(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                    >
                      <Lock className="w-4 h-4" />
                      {listLanguage.password_setting || 'Ubah Password'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Contact Info Card */}
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Contact Information
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500 mb-1">Email</div>
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {profileData.email || '-'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500 mb-1">Phone</div>
                      <div className="text-sm font-medium text-gray-900">
                        {profileData.phone || '-'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <IdCard className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500 mb-1">ID Karyawan</div>
                      <div className="text-sm font-medium text-gray-900">
                        {profileData.nik || '-'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT CONTENT - SEMUA CARDS ORIGINAL */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Tab Navigation */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5">
                <div className="flex gap-1 overflow-x-auto">
                  {[
                    { id: 'overview', label: 'Overview', icon: BarChart3 },
                    { id: 'courses', label: 'Courses', icon: BookOpen },
                    { id: 'ebooks', label: 'E-Books', icon: BookText },
                    { id: 'competencies', label: 'Competencies', icon: Award },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                        activeTab === tab.id
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* OVERVIEW TAB - ALL ORIGINAL CARDS */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  
                  {/* Stats Grid */}
                  <div className="grid lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-blue-600" />
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
                          <AlertCircle className="w-5 h-5 text-amber-600" />
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
                          <CheckCheck className="w-5 h-5 text-green-600" />
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
                      <div className="text-sm text-gray-500">Learning Hours</div>
                    </div>
                  </div>

                  {/* Main Content Grid - 3 CARDS UTAMA */}
                  <div className="grid lg:grid-cols-3 gap-6">
                    
                    {/* Course Status - DONUT CHART */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold text-gray-900">Course Status</h3>
                        <Target className="w-5 h-5 text-gray-400" />
                      </div>

                      <div className="flex items-center justify-center mb-6">
                        <div className="relative w-36 h-36 sm:w-40 sm:h-40">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" stroke="#f3f4f6" strokeWidth="8" fill="none" />
                            
                            <circle
                              cx="50" cy="50" r="40"
                              stroke="#ef4444"
                              strokeWidth="8"
                              fill="none"
                              strokeDasharray={`${(profileData.courseStatus.failed / 100) * 251.2} 251.2`}
                              strokeDashoffset="0"
                              className="transition-all duration-1000"
                            />
                            
                            <circle
                              cx="50" cy="50" r="40"
                              stroke="#3b82f6"
                              strokeWidth="8"
                              fill="none"
                              strokeDasharray={`${(profileData.courseStatus.inProgress / 100) * 251.2} 251.2`}
                              strokeDashoffset={`${-(profileData.courseStatus.failed / 100) * 251.2}`}
                              className="transition-all duration-1000"
                            />
                            
                            <circle
                              cx="50" cy="50" r="40"
                              stroke="#22c55e"
                              strokeWidth="8"
                              fill="none"
                              strokeDasharray={`${(profileData.courseStatus.passed / 100) * 251.2} 251.2`}
                              strokeDashoffset={`${-((profileData.courseStatus.failed + profileData.courseStatus.inProgress) / 100) * 251.2}`}
                              className="transition-all duration-1000"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-3xl font-bold text-gray-900">{passRate}%</span>
                            <span className="text-xs text-gray-500">Pass Rate</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="text-sm text-gray-600">Passed</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            {profileData.courseStatus.passed}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="text-sm text-gray-600">In Progress</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            {profileData.courseStatus.inProgress}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span className="text-sm text-gray-600">Failed</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            {profileData.courseStatus.failed}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Course Results - RECENT SCORES */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold text-gray-900">Recent Scores</h3>
                        <TrendingUp className="w-5 h-5 text-gray-400" />
                      </div>

                      <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                        {profileData.courseResults.length > 0 ? (
                          profileData.courseResults.slice(0, 5).map((course, index) => (
                            <div key={index}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-700 truncate pr-3 max-w-[160px]">
                                  {course.name}
                                </span>
                                <span className={`text-sm font-bold px-2 py-0.5 rounded ${
                                  course.score >= 80 
                                    ? 'text-green-700 bg-green-50' 
                                    : course.score >= 60 
                                    ? 'text-amber-700 bg-amber-50' 
                                    : 'text-red-700 bg-red-50'
                                }`}>
                                  {course.score}
                                </span>
                              </div>
                              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-700 ${
                                    course.score >= 80 
                                      ? 'bg-green-500' 
                                      : course.score >= 60 
                                      ? 'bg-amber-500' 
                                      : 'bg-red-500'
                                  }`}
                                  style={{ width: `${course.score}%` }}
                                />
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">No course results yet</p>
                          </div>
                        )}
                      </div>

                      {profileData.courseResults.length > 5 && (
                        <button 
                          onClick={() => setActiveTab('courses')}
                          className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          View all {profileData.courseResults.length} courses →
                        </button>
                      )}
                    </div>

                    {/* Mandatory Courses - CHECKLIST */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold text-gray-900">Mandatory Courses</h3>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <span className="font-semibold text-green-600">
                            {profileData.mandatoryCourses.filter(c => c.completed).length}
                          </span>
                          <span>/</span>
                          <span>{profileData.mandatoryCourses.length}</span>
                        </div>
                      </div>

                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {profileData.mandatoryCourses.length > 0 ? (
                          profileData.mandatoryCourses.map((course) => (
                            <div
                              key={course.id}
                              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                                course.completed
                                  ? "bg-green-50"
                                  : "bg-gray-50 hover:bg-gray-100"
                              }`}
                            >
                              <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                                course.completed
                                  ? "bg-green-500"
                                  : "border-2 border-gray-300 bg-white"
                              }`}>
                                {course.completed && (
                                  <CheckCircle2 className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <span className={`text-sm flex-1 line-clamp-2 ${
                                course.completed
                                  ? "text-green-800"
                                  : "text-gray-700"
                              }`}>
                                {course.title}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <CheckCheck className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">No mandatory courses</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* E-Book Stats - FULL WIDTH */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-semibold text-gray-900">E-Book Progress</h3>
                      <BookMarked className="w-5 h-5 text-gray-400" />
                    </div>

                    <div className="grid lg:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-xl">
                        <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">
                          {profileData.ebooks.read}
                        </div>
                        <div className="text-sm text-blue-700">Books Read</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-xl">
                        <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">
                          {profileData.ebooks.completed}
                        </div>
                        <div className="text-sm text-green-700">Completed</div>
                      </div>
                      <div className="text-center p-4 bg-amber-50 rounded-xl">
                        <div className="text-2xl sm:text-3xl font-bold text-amber-600 mb-1">
                          {profileData.ebooks.incomplete}
                        </div>
                        <div className="text-sm text-amber-700">In Progress</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-xl">
                        <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1">
                          {profileData.ebooks.readingHours}h {profileData.ebooks.readingMinutes}m
                        </div>
                        <div className="text-sm text-purple-700">Reading Time</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* COURSES TAB */}
              {activeTab === "courses" && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">All Course Results</h3>
                    <div className="text-sm text-gray-500">
                      {profileData.courseResults.length} courses
                    </div>
                  </div>

                  {profileData.courseResults.length > 0 ? (
                    <div className="space-y-3">
                      {profileData.courseResults.map((course, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              course.score >= 80 
                                ? 'bg-green-100' 
                                : course.score >= 60 
                                ? 'bg-amber-100' 
                                : 'bg-red-100'
                            }`}>
                              {course.score >= 80 ? (
                                <Trophy className="w-5 h-5 text-green-600" />
                              ) : course.score >= 60 ? (
                                <Target className="w-5 h-5 text-amber-600" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-600" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{course.name}</h4>
                              <p className="text-sm text-gray-500">
                                {course.score >= 80 ? 'Excellent' : course.score >= 60 ? 'Good' : 'Needs Improvement'}
                              </p>
                            </div>
                          </div>
                          <div className={`text-xl font-bold ${
                            course.score >= 80 
                              ? 'text-green-600' 
                              : course.score >= 60 
                              ? 'text-amber-600' 
                              : 'text-red-600'
                          }`}>
                            {course.score}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No Courses Yet</h4>
                      <p className="text-gray-500 mb-4">Start learning to see your progress here</p>
                      <Link 
                        href="/courses" 
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        Browse Courses
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* EBOOKS TAB */}
              {activeTab === "ebooks" && (
                <div className="space-y-6">
                  <div className="grid lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
                      <BookMarked className="w-8 h-8 mb-3 opacity-80" />
                      <div className="text-3xl font-bold mb-1">{profileData.ebooks.read}</div>
                      <div className="text-sm text-blue-100">Books Read</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
                      <CheckCircle2 className="w-8 h-8 mb-3 opacity-80" />
                      <div className="text-3xl font-bold mb-1">{profileData.ebooks.completed}</div>
                      <div className="text-sm text-green-100">Completed</div>
                    </div>
                    <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white">
                      <AlertCircle className="w-8 h-8 mb-3 opacity-80" />
                      <div className="text-3xl font-bold mb-1">{profileData.ebooks.incomplete}</div>
                      <div className="text-sm text-amber-100">In Progress</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
                      <Clock className="w-8 h-8 mb-3 opacity-80" />
                      <div className="text-2xl font-bold mb-1">
                        {profileData.ebooks.readingHours}h {profileData.ebooks.readingMinutes}m
                      </div>
                      <div className="text-sm text-purple-100">Reading Time</div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                    <BookText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Your E-Book Library</h4>
                    <p className="text-gray-500 mb-4">Access your reading materials and track progress</p>
                    <Link 
                      href="/library" 
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <BookOpen className="w-4 h-4" />
                      Go to Library
                    </Link>
                  </div>
                </div>
              )}

              {/* COMPETENCIES TAB */}
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
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Edit Profile</h3>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={profileForm.nama || ''}
                  onChange={(e) => setProfileForm({...profileForm, nama: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={profileForm.email || ''}
                  onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={profileForm.phone || ''}
                  onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+62 xxx xxxx xxxx"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  value={profileForm.address || ''}
                  onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your address"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      <ChangePasswordModal 
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        isForced={false}   // ✅ Voluntary
        canClose={true}    // ✅ Can close
      />
    </WebLayout>
  );
}