import { Check, ChevronDown, ChevronRight, Calendar, Settings } from "lucide-react";
import { useState } from "react";
import React from "react";

export default function ListCourses({ courses }) {
    const [expanded, setExpanded] = useState(null);
    
    const toggleExpand = (id) => {
        setExpanded(expanded === id ? null : id);
    };
    
    return (
        <div className="space-y-4">
            {/* Header with Confirm Button */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Course Enrollment</h3>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm">
                    <Check className="w-4 h-4" />
                    <span className="font-medium">Confirm Enrollment</span>
                </button>
            </div>

            {/* Course List */}
            <div className="space-y-3">
                {courses.map((course, index) => (
                    <div
                        key={course.id_course}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                    >
                        {/* Course Header */}
                        <div
                            className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => toggleExpand(course.id_course)}
                        >
                            <div className="flex items-center gap-4 flex-1">
                                {/* Number Badge */}
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                                </div>

                                {/* Course Title */}
                                <h4 className="text-base font-semibold text-gray-900">
                                    {course.course_title}
                                </h4>
                            </div>

                            {/* Enroll Button */}
                            <button className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200">
                                {expanded === course.id_course ? (
                                    <ChevronDown className="w-4 h-4" />
                                ) : (
                                    <ChevronRight className="w-4 h-4" />
                                )}
                                <span className="text-sm font-medium">Enroll</span>
                            </button>
                        </div>

                        {/* Expanded Details */}
                        {expanded === course.id_course && (
                            <div className="border-t border-gray-100 bg-gray-50 p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Enrollment Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Enrollment Type
                                        </label>
                                        <select
                                            defaultValue={course.enrollment_type || "General"}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                        >
                                            <option>General</option>
                                            <option>Specific</option>
                                        </select>
                                    </div>

                                    {/* Status Course */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Status Course
                                        </label>
                                        <select
                                            defaultValue={course.status_course || "Mandatory"}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                        >
                                            <option>Mandatory</option>
                                            <option>Optional</option>
                                        </select>
                                    </div>

                                    {/* Date Publish */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-500" />
                                                Date Publish
                                            </div>
                                        </label>
                                        <input
                                            type="date"
                                            defaultValue={course.publish_date}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                        />
                                    </div>

                                    {/* End Date */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-500" />
                                                End Date
                                            </div>
                                        </label>
                                        <input
                                            type="date"
                                            defaultValue={course.end_date}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                        />
                                    </div>

                                    {/* Remedial Allowed */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Remedial Allowed
                                        </label>
                                        <select
                                            defaultValue={course.remedial_allowed ? "Yes" : "No"}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                        >
                                            <option>Yes</option>
                                            <option>No</option>
                                        </select>
                                    </div>

                                    {/* Times */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Times (Attempts)
                                        </label>
                                        <input
                                            type="number"
                                            defaultValue={course.times || 1}
                                            min="1"
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                        />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-6 flex justify-end gap-3">
                                    <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                                        Cancel
                                    </button>
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                                        Save Settings
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {courses.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Settings className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses available</h3>
                    <p className="text-gray-600">There are no courses to enroll at this moment</p>
                </div>
            )}
        </div>
    );
}