import { Check, Menu, Shrink } from "lucide-react";
import { useState } from "react";
import React from "react";
export default function ListCourses({courses}) {
    
    const [expanded, setExpanded] = useState(null);
    const toggleExpand = (id) => {
        setExpanded(expanded === id ? null : id);
    };
    
    return (
         <>
            <div className="flex justify-end items-center mb-4">
                <button className="bg-gray-400 text-white px-4 py-2 rounded flex items-center">
                    <Check className="w-4 h-4 mr-2" /> Confirm
                </button>
            </div>
            <div className="divide-y divide-gray-200">
                <table className="w-full border-collapse">
                <tbody>
                {courses.map((course, index) => (
                    <React.Fragment key={course.id_course}>
                    {/* Row utama */}
                    <tr
                        key={course.id_course}
                        className="border-b cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleExpand(course.id_course)}
                    >
                        <td className="px-4 py-2 w-10 text-gray-600 font-medium">
                        {index + 1}
                        </td>
                        <td className="px-6 py-2">{course.course_title}</td>
                        <td className="px-4 py-2 text-right">
                            <div className="flex justify-end items-center gap-2">
                                <button className="flex items-center gap-2">
                                {expanded === course.id_course ? (
                                    <Shrink className="w-5 h-5" />  
                                ) : (
                                    <Menu className="w-5 h-5" />
                                )}
                                <span>Enroll</span>
                                </button>
                            </div>
                        </td>
                    </tr>

                    {/* Row detail (expand) */}
                    {expanded === course.id_course && (
                        <tr className="bg-gray-50">
                        <td colSpan={3} className="px-6 py-4">
                            <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-600">Enrollment Type</label>
                                <select
                                defaultValue={course.status_course}
                                className="w-full border rounded px-2 py-1 mt-1"
                                >
                                <option>General</option>
                                <option>Specific</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm text-gray-600">Status Course</label>
                                <select
                                defaultValue={course.status_course}
                                className="w-full border rounded px-2 py-1 mt-1"
                                >
                                <option>Mandatory</option>
                                <option>Optional</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm text-gray-600">Date Publish</label>
                                <input
                                type="date"
                                defaultValue={course.publish_date}
                                className="w-full border rounded px-2 py-1 mt-1"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-600">End Date</label>
                                <input
                                type="date"
                                defaultValue={course.end_date}
                                className="w-full border rounded px-2 py-1 mt-1"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-600">Remedial Allowed</label>
                                <select
                                defaultValue={course.deleted_status ? "Yes" : "No"}
                                className="w-full border rounded px-2 py-1 mt-1"
                                >
                                <option>Yes</option>
                                <option>No</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm text-gray-600">Times</label>
                                <input
                                type="number"
                                defaultValue={course.deleted_status}
                                className="w-full border rounded px-2 py-1 mt-1"
                                />
                            </div>
                            </div>
                        </td>
                        </tr>
                    )}
                    </React.Fragment>
                ))}
                </tbody>
            </table>
            </div>
        </>
    );
}