"use client";
import { useState,useContext } from "react";
import Admin from "layouts/Admin.js";
import CoursesListView from "../../components/Course/Course";
import EnrollmentView from "../../components/Course/Enrollment/Enroll";
import ContentAdditionView from "../../components/Course/AddContent";
import { useCourses } from "../../hooks/useCourses";
import { ChevronRight, BookOpen, Users, Home } from 'lucide-react';
import { useRouter } from "next/router";
import { ProfileContext } from "../../contexts/profile/ProfileContext";
export default function Management() {
    const [activeTab, setActiveTab] = useState('courses-list');
    const [currentPage, setCurrentPage] = useState('main');
    const [selectedCourseId, setSelectedCourseId]= useState('');
    const [selectedContentId, setSelectedContentId] = useState(null);
    const {courses, contentTypes, groupEnroll,companies, addCourse, deleteCourse,enrollData } = useCourses();
    const [editData, setEditData] = useState(null);
    const [activeEnrollmentTab, setActiveEnrollmentTab] = useState('courses-list-sub');
    const router = useRouter();
    console.log("Companies Units:", companies);
    const handleAddContent = (courseId) => {
        setSelectedCourseId(courseId);
        setCurrentPage('addContent');
        setEditData(null);
    }
    
    const CONTENT_TYPE_ROUTES = {
        3: '/course/content/pre-test-edit',
        8: '/course/content/pre-test-edit',
        4: '/course/upload/edit-content',
        5: '/course/upload/edit-content',
        6: '/course/upload/edit-content'
    };

    const { getKaryawan, dataKaryawan } = useContext(ProfileContext);
                      
    const dataKaryawans = dataKaryawan?.length ? dataKaryawan[0] : [];

    const handleEditContent = (courseId, contentId, contentTypeId) => {
        const specialRoute = CONTENT_TYPE_ROUTES[contentTypeId];
        if (specialRoute) {
            router.push({
                pathname: specialRoute,
                query: { 
                    courseId: courseId, 
                    contentId: contentId,
                    contentTypeId: contentTypeId
                }
            });
            return
        }
        setSelectedCourseId(courseId);
        setCurrentPage('editContent');
        setSelectedContentId(contentId); 
    };

    const handleSaveSuccess = () => {
        setCurrentPage('main');
        setSelectedContentId(null);
        setSelectedCourseId('');
    };

    const MainPage = () => ( 
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Modern Header with Gradient Background */}
            <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-[#5577B5] via-[#6B8BC5] to-[#7B9DD8] shadow-lg">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Course Management</h1>
                        <p className="text-blue-100">Manage your courses and enrollments</p>
                    </div>
                    
                    {/* Modern Breadcrumb */}
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                        <Home className="w-4 h-4 text-blue-100" />
                        <span className="text-blue-100 text-sm">Home</span>
                        <ChevronRight className="w-4 h-4 text-blue-100" />
                        <span className="text-white text-sm font-medium">Course Management</span>
                    </div>
                </div>
            </div>

            {/* Modern Tabs Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
                <div className="flex border-b border-gray-200">
                    <button 
                        onClick={() => setActiveTab('courses-list')}
                        className={`flex items-center gap-3 px-8 py-4 font-medium text-sm transition-all duration-200 relative ${
                            activeTab === 'courses-list'
                                ? 'text-blue-600 bg-blue-50'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                        <BookOpen className="w-5 h-5" />
                        <span>Course List</span>
                        {activeTab === 'courses-list' && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600"></div>
                        )}
                    </button>
                    
                    <button 
                        onClick={() => setActiveTab('enrollment')}
                        className={`flex items-center gap-3 px-8 py-4 font-medium text-sm transition-all duration-200 relative ${
                            activeTab === 'enrollment'
                                ? 'text-blue-600 bg-blue-50'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                        <Users className="w-5 h-5" />
                        <span>Enrollment</span>
                        {activeTab === 'enrollment' && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600"></div>
                        )}
                    </button>
                </div>

                {/* Content Section with Padding */}
                <div className="p-6">
                    {activeTab === 'courses-list' && (
                        <CoursesListView 
                            courses={courses} 
                            onAddContent={handleAddContent} 
                            onEditContent={handleEditContent}
                            onSave={addCourse}
                            onDelete={deleteCourse}
                            createdBy={dataKaryawans.nama}
                        />
                    )}
                    
                    {activeTab === 'enrollment' && (
                        <EnrollmentView 
                            courses={courses} 
                            groupEnroll={groupEnroll} 
                            companyUnits={companies}
                            enrollData={enrollData}
                            activeEnrollmentTab={activeEnrollmentTab} 
                            setActiveEnrollmentTab={setActiveEnrollmentTab}
                            onSuccess={handleSaveSuccess}
                        />
                    )}
                </div>
            </div>
        </div>   
    );

    const AddContentPage = () => (
        <ContentAdditionView 
            onBack={() => setCurrentPage('main')}
            onSuccess={handleSaveSuccess}
            courseId={selectedCourseId}   
            contentTypes={contentTypes}
            mode="add"
            contentId={null}
        />
    );

  return (
    <div>
      {currentPage === "main" && <MainPage />}
      {currentPage === "addContent" && <AddContentPage />}
    </div>
  );
}
Management.layout = Admin;
