import { useState,useCallback } from "react";
import Admin from "layouts/Admin.js";
import CoursesListView from "/components/Course/Course"; 
import EnrollmentView from "/components/Course/Enroll";
import ContentAdditionView from "/components/Course/AddContent";
import { useCourses } from "/hooks/useCourses";
export default function Management() {
    const [activeTab, setActiveTab] = useState('courses-list');
    const [currentPage, setCurrentPage] = useState('main');
    const [selectedCourseId, setSelectedCourseId]= useState('');
    const { courses, contentTypes, addCourse } = useCourses();
    
    
    const handleAddContent = (courseId) => {
        setSelectedCourseId(courseId);
        setCurrentPage('addContent');
    }
    
    const MainPage = () => (
        <div className="mt-6 ml-2 grid grid-cols-1 gap-6">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div className="flex gap-4">
                    <button onClick={() => setActiveTab('courses-list')}
                    className={`px-12 py-2 font-medium text-sm rounded-t border-b-0 ${
                    activeTab === 'courses-list'
                    ? 'bg-blue-900 text-white'
                    : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                    }`}>
                        Course List
                    </button>
                    <button onClick={() => setActiveTab('enrollment')}
                    className={`px-12 py-2 font-medium text-sm rounded-t border-b-0 ${
                    activeTab === 'enrollment'
                    ? 'bg-blue-900 text-white'
                    : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                    }`}>
                        Enrollment
                    </button>
                </div>
            </div> 
            {/* Content Section */}
            <div>
                {activeTab === 'courses-list' && <CoursesListView 
                courses={courses} 
                onAddContent={handleAddContent} 
                onSave={addCourse}
                />}
                {activeTab === 'enrollment' && <EnrollmentView courses={courses}/>}
            </div>
        </div>
    );

    const AddContentPage = () => (
        <ContentAdditionView onBack={() => setCurrentPage('main')}   contentTypes={contentTypes} />
    );

    return (
        <div>
            {currentPage === 'main' && <MainPage />}
            {currentPage === 'addContent' && <AddContentPage />}
        </div>
    );
    

}
Management.layout = Admin;