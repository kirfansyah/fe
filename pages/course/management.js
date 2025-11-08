import { useState } from "react";
import Admin from "layouts/Admin.js";
import CoursesListView from "../../components/Course/Course"; 
import EnrollmentView from "../../components/Course/Enrollment/Enroll";
import ContentAdditionView from "../../components/Course/AddContent";
import { useCourses } from "../../hooks/useCourses";
import { ChevronRight } from 'lucide-react';
import { useRouter } from "next/router";
export default function Management() {
    const [activeTab, setActiveTab] = useState('courses-list');
    const [currentPage, setCurrentPage] = useState('main');
    const [selectedCourseId, setSelectedCourseId]= useState('');
    const [selectedContentId, setSelectedContentId] = useState(null);
    const {courses, contentTypes, groupEnroll, addCourse, deleteCourse } = useCourses();
    const [editData, setEditData] = useState(null);
    const [activeEnrollmentTab, setActiveEnrollmentTab] = useState('courses-list-sub');
    const router = useRouter();
    const handleAddContent = (courseId) => {
        setSelectedCourseId(courseId);
        setCurrentPage('addContent');
        setEditData(null);
    }
    
    const CONTENT_TYPE_ROUTES = {
        3: '/course/content/pre-test-edit',
        4: '/course/upload/edit-content',
        5: '/course/upload/edit-content',
        6: '/course/upload/edit-content'
    };

    const handleEditContent = (courseId, contentId,contentTypeId) => {
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
        <div className="mt-6 p-4 grid grid-cols-1 gap-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Home</span>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-gray-900 font-medium">Course Management</span>
                </div>
            </div>
            {/* Header Section */}
            <div className="flex gap-2">
                <button 
                    onClick={() => setActiveTab('courses-list')}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                        activeTab === 'courses-list'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }`}
                >
                    Course List
                </button>
                <button 
                    onClick={() => setActiveTab('enrollment')}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                        activeTab === 'enrollment'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }`}
                >
                    Enrollment
                </button>
            </div>
            {/* Content Section */}
            <div>
                {activeTab === 'courses-list' && <CoursesListView 
                    courses={courses} 
                    onAddContent={handleAddContent} 
                    onEditContent={handleEditContent}
                    onSave={addCourse}
                    onDelete={deleteCourse}
                />}
                {activeTab === 'enrollment' && 
                <EnrollmentView 
                    courses={courses} 
                    groupEnroll={groupEnroll} 
                    activeEnrollmentTab={activeEnrollmentTab} 
                    setActiveEnrollmentTab={setActiveEnrollmentTab}
                    onSuccess={handleSaveSuccess}
                />}
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
            
            courseId={selectedCourseId}   
            contentTypes={contentTypes}
            mode="edit"
            contentId={selectedContentId}
        />
    );

    return (
        <div>
            {currentPage === 'main' && <MainPage />}
            {currentPage === 'addContent' && <AddContentPage />}
            {currentPage === 'editContent' && <EditContentPage />}
        </div>
    );
}
Management.layout = Admin;