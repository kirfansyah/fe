"use client";
import { useState, useContext } from "react";
import Admin from "layouts/Admin.js";
import CoursesListView from "../../components/Course/Course";
import EnrollmentView from "../../components/Course/Enrollment/Enroll";
import ContentAdditionView from "../../components/Course/AddContent";
import { useCourses } from "../../hooks/useCourses";
import { ChevronRight, BookOpen, Users, Home } from 'lucide-react';
import { useRouter } from "next/router";
import { useMenuPermissions } from '@/hooks/useMenuPermissions';

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
        fetchCourses,
        fetchEnrollData,
        deleteCourse, 
        deleteContent,
        enrollData,
        isLoading,  
        isSaving
    } = useCourses();
    
    const router = useRouter();

    const permissions = useMenuPermissions();
    
    const CONTENT_TYPE_ROUTES = {
        3: '/course/content/pre-test-edit',
        7: '/course/content/pre-test-edit',
        8: '/course/content/pre-test-edit',
        4: '/course/upload/edit-content',
        5: '/course/upload/edit-content',
        6: '/course/upload/edit-content'
    };

    const handleAddContent = (courseId) => {

        if (!permissions.can_create) {
            alert('You do not have permission to add content');
            return;
        }

        setSelectedCourseId(courseId);
        setCurrentPage('addContent');
    };

    const handleEditContent = (courseId, contentId, contentTypeId) => {
        if (!permissions.can_edit) {
            alert('You do not have permission to edit content');
            return;
        }

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

    const handleViewContent = (courseId, contentId, contentTypeId) => {
        if (!permissions.can_view) {
            alert('You do not have permission to view content');
            return;
        }

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

    const handleSaveSuccess = async () => {
        setCurrentPage('main');
        setSelectedContentId(null);
        setSelectedCourseId('');
        await fetchCourses();
        await fetchEnrollData();
    };

    const handleDeleteSuccess = async () => {
        await fetchCourses();
        await fetchEnrollData();
    }
    

    // ✅ Dynamic Breadcrumb
    const getBreadcrumbs = () => {
        const breadcrumbs = {
            main: ['Home', 'Course Management'],
            addContent: ['Home', 'Course Management', 'Add Content'],
            editContent: ['Home', 'Course Management', 'Edit Content']
        };
        return breadcrumbs[currentPage] || breadcrumbs.main;
    };
    if (!permissions.can_view) {
        return (
            <div className="p-6 bg-gray-50 min-h-screen">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                        <p className="text-gray-600 mb-6">You do not have permission to access this page.</p>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }
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
                            onViewContent={handleViewContent}
                            onSave={addCourse}
                            onDelete={deleteCourse}
                            onDeleteContent={deleteContent} 
                            onDeleteContentSuccess={handleDeleteSuccess}
                            isLoading={isLoading}    
                            isSaving={isSaving}
                            permissions={permissions}
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
                            onDeleteContentSuccess={handleDeleteSuccess}
                            isLoading={isLoading}    
                            isSaving={isSaving}
                            permissions={permissions}
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
            permissions={permissions}
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
            permissions={permissions}
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
