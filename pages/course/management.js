"use client";
import { useState, useContext } from "react";
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
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [selectedContentId, setSelectedContentId] = useState(null);
    const [activeEnrollmentTab, setActiveEnrollmentTab] = useState('courses-list-sub');
    
    const { 
        courses, 
        contentTypes, 
        groupEnroll, 
        companies, 
        addCourse, 
        deleteCourse, 
        deleteContent,
        enrollData,
        isLoading,    // ✅ Loading states
        isSaving, 
        isDeleting 
    } = useCourses();
    
    const router = useRouter();
    const { dataKaryawan } = useContext(ProfileContext);
    const dataKaryawans = dataKaryawan?.[0] || { nama: '' };
    
    const CONTENT_TYPE_ROUTES = {
        3: '/course/content/pre-test-edit',
        7: '/course/content/pre-test-edit',
        8: '/course/content/pre-test-edit',
        4: '/course/upload/edit-content',
        5: '/course/upload/edit-content',
        6: '/course/upload/edit-content'
    };

    const handleAddContent = (courseId) => {
        setSelectedCourseId(courseId);
        setCurrentPage('addContent');
    };

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
            return;
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

    // ✅ Dynamic Breadcrumb
    const getBreadcrumbs = () => {
        const breadcrumbs = {
            main: ['Home', 'Course Management'],
            addContent: ['Home', 'Course Management', 'Add Content'],
            editContent: ['Home', 'Course Management', 'Edit Content']
        };
        return breadcrumbs[currentPage] || breadcrumbs.main;
    };

    const MainPage = () => ( 
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* ✅ FIXED: Minimalis Header (consistent dengan design system) */}
            <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">Course Management</h1>
                        <p className="text-gray-600 text-sm">Manage your courses and enrollments</p>
                    </div>
                    
                    {/* ✅ FIXED: Minimalis Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm">
                        <Home className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">Home</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900 font-medium">Course Management</span>
                    </div>
                </div>
            </div>

            {/* ✅ Modern Tabs Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex border-b border-gray-200">
                    <button 
                        onClick={() => setActiveTab('courses-list')}
                        className={`flex items-center gap-3 px-6 py-4 font-medium text-sm transition-all duration-200 relative ${
                            activeTab === 'courses-list'
                                ? 'text-blue-600 bg-blue-50'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                        <BookOpen className="w-5 h-5" />
                        <span>Course List</span>
                        {activeTab === 'courses-list' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                        )}
                    </button>
                    
                    <button 
                        onClick={() => setActiveTab('enrollment')}
                        className={`flex items-center gap-3 px-6 py-4 font-medium text-sm transition-all duration-200 relative ${
                            activeTab === 'enrollment'
                                ? 'text-blue-600 bg-blue-50'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                        <Users className="w-5 h-5" />
                        <span>Enrollment</span>
                        {activeTab === 'enrollment' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                        )}
                    </button>
                </div>

                {/* Content Section */}
                <div className="p-6">
                    {activeTab === 'courses-list' && (
                        <CoursesListView 
                            courses={courses} 
                            onAddContent={handleAddContent} 
                            onEditContent={handleEditContent}
                            onSave={addCourse}
                            onDelete={deleteCourse}
                            onDeleteContent={deleteContent} 
                            isLoading={isLoading}    
                            isSaving={isSaving}   
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
                            isLoading={isLoading}    // ✅ ADDED
                            isSaving={isSaving}      // ✅ ADDED
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

    const EditContentPage = () => (
        <ContentAdditionView 
            onBack={() => setCurrentPage('main')}
            onSuccess={handleSaveSuccess}
            courseId={selectedCourseId}   
            contentTypes={contentTypes}
            mode="edit"
            contentId={selectedContentId}
        />
    );

    return (
        <div>
            {currentPage === "main" && <MainPage />}
            {currentPage === "addContent" && <AddContentPage />}
            {currentPage === 'editContent' && <EditContentPage />}
        </div>
    );
}

Management.layout = Admin;
