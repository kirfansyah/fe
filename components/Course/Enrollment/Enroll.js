import ListCourses from "@/components/Course/Enrollment/ListCourse";
import { useState } from "react";
import ListEmployees from "@/components/Course/Enrollment/ListEmployee";
export default function Enroll({courses, activeEnrollmentTab= 'courses-list-sub', setActiveEnrollmentTab}) {
    
    return (
       <>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex justify-between items-center">
                <div className="flex gap-2">
                <button
                    onClick={() => setActiveEnrollmentTab('courses-list-sub')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeEnrollmentTab === 'courses-list-sub'
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                    Course LIst Sub <span className="ml-2 text-xs"></span>
                </button>
                <button
                    onClick={() => setActiveEnrollmentTab('employee-list')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeEnrollmentTab === 'employee-list'
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                    Employee List <span className="ml-2 text-xs"></span>
                </button>
                <button
                    onClick={() => setActiveEnrollmentTab('labor-list')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeEnrollmentTab === 'labor-list'
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                    Labor List <span className="ml-2 text-xs"></span>
                </button>
                </div>
            </div>
        </div>
        <div className="bg-white mt-2 p-4 rounded-lg shadow">
            {activeEnrollmentTab === 'courses-list-sub' && <ListCourses courses={courses}/>}
            {activeEnrollmentTab === 'employee-list' && <ListEmployees />}
            {activeEnrollmentTab === 'labor-list' && <div>Labor List Content</div>}
        </div>
        </>
    );
}