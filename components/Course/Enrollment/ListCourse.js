import { Users, ChevronDown, ChevronRight, Calendar, Settings, X } from "lucide-react";
import { useState } from "react";
import React from "react";

export default function ListCourses({ 
    courses,
    groupEnroll = [],   
    onCourseChange,     
    enrollmentData = {}
}) {
    const [expanded, setExpanded] = useState(null);

    const toggleExpand = (id) => {
        setExpanded(expanded === id ? null : id);
    };

    const handleFieldChange = (courseId, field, value) => {
        if (onCourseChange) {
            onCourseChange(courseId, field, value);
        }
    };

    const toggleEnrollmentGroup = (courseId, groupId) => {
        const courseData = getCourseData(courseId);
        const currentGroups = courseData.enrollment_group_ids || [];
        
        let newGroups;
        if (currentGroups.includes(groupId)) {
            newGroups = currentGroups.filter(id => id !== groupId);
        } else {
            newGroups = [...currentGroups, groupId];
        }
        
        handleFieldChange(courseId, 'enrollment_group_ids', newGroups);
    };

    const getCourseData = (courseId) => {
        const data = enrollmentData[courseId];
        
        return {
            enrollment_type: data?.enrollment_type || '',
            status_course: data?.status_course || '',
            publish_date: data?.publish_date || '',
            end_date: data?.end_date || '',
            remedial_allowed: data?.remedial_allowed || 'Yes',
            times: data?.times || 1,
            enrollment_group_ids: data?.enrollment_group_ids || [],
        };
    };
    
    return (
        <div className="space-y-4">
            <div className="space-y-3">
                {courses.map((course, index) => {
                    const courseData = getCourseData(course.id_course);
                    const isSpecific = courseData.enrollment_type === 'Specific';
                    const selectedGroups = courseData.enrollment_group_ids || [];
                    const isEnrolled = course.id_course_enrollment !== null; // ⭐ Check enrolled

                    return (
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
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-base font-semibold text-gray-900">
                                                {course.course_title}
                                            </h4>
                                            
                                            {/* ⭐ Show enrolled badge */}
                                            {isEnrolled && (
                                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                                                    Enrolled
                                                </span>
                                            )}
                                        </div>
                                        
                                        {/* Show selected groups badges */}
                                        {isSpecific && selectedGroups.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {selectedGroups.map(groupId => {
                                                    const group = groupEnroll.find(g => g.id === groupId);
                                                    return group ? (
                                                        <span 
                                                            key={groupId}
                                                            className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded"
                                                        >
                                                            {group.name_group}
                                                        </span>
                                                    ) : null;
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Enroll Button */}
                                <button 
                                    type="button"
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors border ${
                                        isEnrolled 
                                            ? 'text-green-600 bg-green-50 border-green-200'
                                            : 'text-blue-600 hover:bg-blue-50 border-blue-200'
                                    }`}
                                >
                                    {expanded === course.id_course ? (
                                        <ChevronDown className="w-4 h-4" />
                                    ) : (
                                        <ChevronRight className="w-4 h-4" />
                                    )}
                                    <span className="text-sm font-medium">
                                        {isEnrolled ? 'Update' : 'Enroll'}
                                    </span>
                                </button>
                            </div>

                            {/* Expanded Details */}
                            {expanded === course.id_course && (
                                <div className="border-t border-gray-100 bg-gray-50 p-6">
                                    {/* ⭐ Info untuk enrolled course */}
                                    {isEnrolled && (
                                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <p className="text-sm text-blue-800">
                                                ℹ️ This course is already enrolled. You can update the settings below.
                                            </p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {/* Enrollment Type */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Enrollment Type <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={courseData.enrollment_type}
                                                onChange={(e) => handleFieldChange(course.id_course, 'enrollment_type', e.target.value)}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                            >
                                                <option value="">Select</option>
                                                <option value="General">General</option>
                                                <option value="Specific">Specific</option>
                                            </select>
                                        </div>

                                        {/* Status Course */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Status Course <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={courseData.status_course}
                                                onChange={(e) => handleFieldChange(course.id_course, 'status_course', e.target.value)}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                            >
                                                <option value="">Select</option>
                                                <option value="Mandatory">Mandatory</option>
                                                <option value="Optional">Optional</option>
                                            </select>
                                        </div>

                                        {/* MULTIPLE ENROLLMENT GROUPS */}
                                        {isSpecific && (
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Users className="w-4 h-4 text-gray-500" />
                                                            Enrollment Groups <span className="text-red-500">*</span>
                                                            <span className="text-xs text-gray-500">
                                                                ({selectedGroups.length} selected)
                                                            </span>
                                                        </div>
                                                        {selectedGroups.length > 0 && (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleFieldChange(course.id_course, 'enrollment_group_ids', []);
                                                                }}
                                                                className="text-xs text-red-600 hover:text-red-700 font-medium"
                                                            >
                                                                Clear All
                                                            </button>
                                                        )}
                                                    </div>
                                                </label>

                                                {/* Checkbox List */}
                                                <div className="border border-gray-300 rounded-lg bg-white p-4 max-h-64 overflow-y-auto">
                                                    {groupEnroll.length === 0 ? (
                                                        <p className="text-sm text-gray-500 text-center py-4">
                                                            No enrollment groups available
                                                        </p>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            {groupEnroll.map(group => (
                                                                <label
                                                                    key={group.id}
                                                                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedGroups.includes(group.id)}
                                                                        onChange={() => toggleEnrollmentGroup(course.id_course, group.id)}
                                                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                                    />
                                                                    <div className="flex-1">
                                                                        <p className="text-sm font-medium text-gray-900">
                                                                            {group.name_group}
                                                                        </p>
                                                                        {group.description && (
                                                                            <p className="text-xs text-gray-500">
                                                                                {group.description}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Selected Groups Summary */}
                                                {selectedGroups.length > 0 && (
                                                    <div className="mt-2">
                                                        <p className="text-xs text-gray-600 mb-1">Selected groups:</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {selectedGroups.map(groupId => {
                                                                const group = groupEnroll.find(g => g.id === groupId);
                                                                return group ? (
                                                                    <div 
                                                                        key={groupId}
                                                                        className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded"
                                                                    >
                                                                        <span>{group.name_group}</span>
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                toggleEnrollmentGroup(course.id_course, groupId);
                                                                            }}
                                                                            className="hover:bg-purple-200 rounded-full p-0.5"
                                                                        >
                                                                            <X className="w-3 h-3" />
                                                                        </button>
                                                                    </div>
                                                                ) : null;
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Date Publish */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-500" />
                                                    Date Publish <span className="text-red-500">*</span>
                                                </div>
                                            </label>
                                            <input
                                                type="date"
                                                value={courseData.publish_date}
                                                onChange={(e) => handleFieldChange(course.id_course, 'publish_date', e.target.value)}
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
                                                value={courseData.end_date}
                                                onChange={(e) => handleFieldChange(course.id_course, 'end_date', e.target.value)}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                            />
                                        </div>

                                        {/* Remedial Allowed */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Remedial Allowed
                                            </label>
                                            <select
                                                value={courseData.remedial_allowed}
                                                onChange={(e) => handleFieldChange(course.id_course, 'remedial_allowed', e.target.value)}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                            >
                                                <option value="Yes">Yes</option>
                                                <option value="No">No</option>
                                            </select>
                                        </div>

                                        {/* Times */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Times (Attempts)
                                            </label>
                                            <input
                                                type="number"
                                                value={courseData.times}
                                                onChange={(e) => handleFieldChange(course.id_course, 'times', parseInt(e.target.value) || 1)}
                                                min="1"
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                            />
                                        </div>
                                    </div>

                                    {/* Validation Warning */}
                                    {isSpecific && selectedGroups.length === 0 && (
                                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <p className="text-sm text-yellow-800">
                                                ⚠️ Please select at least one enrollment group for specific enrollment type
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
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