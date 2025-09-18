import { useState } from "react";
import ListCourses from "components/Course/ListCourse";
import ListEmployees from "components/Course/ListEmployee";
export default function Enroll({courses}) {
    const [activeEnrollmentTab, setActiveEnrollmentTab] = useState('course-list-sub');

    return (
       <>
        <div className="flex gap-4">
            <button onClick={() => setActiveEnrollmentTab('courses-list-sub')}
            className={`px-6 py-1 font-medium text-sm rounded-t border-b-0 ${
            activeEnrollmentTab === 'courses-list-sub'
            ? 'bg-blue-100 text-gray-900'
            : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
            }`}>
                Course List
            </button>
            <button onClick={() => setActiveEnrollmentTab('employee-list')}
            className={`px-6 py-1 font-medium text-sm rounded-t border-b-0 ${
            activeEnrollmentTab === 'employee-list'
            ? 'bg-blue-100 text-gray-900'
            : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
            }`}>
                Employee List
            </button>
            <button onClick={() => setActiveEnrollmentTab('labor-list')}
            className={`px-6 py-1 font-medium text-sm rounded-t border-b-0 ${
            activeEnrollmentTab === 'labor-list'
            ? 'bg-blue-100 text-gray-900'
            : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
            }`}>
                Labor List
            </button>
        </div>
        
        <div className="bg-white mt-2 p-4 rounded-lg shadow">
            {activeEnrollmentTab === 'courses-list-sub' && <ListCourses courses={courses}/>}
            {activeEnrollmentTab === 'employee-list' && <ListEmployees />}
            {activeEnrollmentTab === 'labor-list' && <div>Labor List Content</div>}
        </div>
        </>
    );
}