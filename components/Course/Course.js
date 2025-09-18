import { Plus, Trash2, Menu, Globe, CirclePlus, CircleX, SquarePen } from "lucide-react";
import { useState } from "react";
export default function Course({ courses, onAddContent,onSave }) {
    const toggleCourse = (courseId) => {
        setExpandedCourse(expandedCourse === courseId ? null : courseId);
    };
    const [expandedCourse, setExpandedCourse] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [courseName, setCourseName] = useState('');
    
    const handleSave = () => {
        if (!courseName.trim()) return;
        onSave(courseName);       
        setCourseName("");        
        setIsModalOpen(false);    
    }

    const handleCancel = () => {
        setCourseName('');
        setIsModalOpen(false);
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Course Management</h2>    
                <button onClick={()=>setIsModalOpen(true)} className="bg-green-600 text-white px-4 py-2 rounded flex items-center">
                    <Plus className="w-4 h-4 mr-2" /> Add New Course
                </button>
            </div>
            <div className="bg-slate-100">
                <div className="bg-gray">
                    {courses.map((course) => (
                    <div key={course.id_course} className="border-b border-gray-200">
                        {/* Main Course Row */}
                        <div className="flex items-center justify-between py-4 px-6 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center space-x-4">
                                <button
                                onClick={() => toggleCourse(course.id_course)}
                                className="p-1"
                                >
                                <Menu className="w-6 h-6 text-gray-600" />
                                </button>
                                <span className="text-lg font-medium text-gray-900 tracking-wide">
                                {course.course_title}
                                </span>
                            </div>

                            <div className="flex items-center space-x-6">
                                <div className="flex items-center space-x-2">
                                    <Globe className="w-4 h-4 text-gray-600" />
                                    <span className="text-sm text-gray-700">Published</span>
                                </div>
                                <button
                                    onClick={() => onAddContent && onAddContent(course.id_course)}
                                    className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
                                >
                                    <CirclePlus className="w-4 h-4 text-gray-400" />
                                    <span>Content</span>
                                </button>
                                <button className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded">
                                    <CircleX className="w-4 h-4 text-gray-400" />
                                    <span>Delete</span>
                                </button>
                            </div>
                        </div>
                        {/* Expanded Modules */}
                        {expandedCourse === course.id_course && (
                        <div className="bg-white">
                            {course.contents.map((module) => (
                            <div
                                key={module.id_course_content}
                                className="flex items-center justify-between py-1 px-6 ml-10 border-l-2 border-gray-300 hover:bg-white transition-colors"
                            >
                                <div className="flex items-center space-x-4">
                                <Menu className="w-2 h-5 text-gray-500" />
                                <span className="text-gray-700">{module.content_type_name}</span>
                                </div>

                                <div className="flex items-center space-x-4">
                                {module.content_type_name && (
                                    <span className="bg-green-500 text-white text-xs px-2 rounded font-medium">
                                    Preview
                                    </span>
                                )}
                                
                                <button className="w-2 h-5 text-gray-400 hover:text-gray-600">
                                    <SquarePen className="w-2 h-5" />
                                </button>
                                
                                <button className="w-2 h-5 text-gray-400 hover:text-red-500">
                                    <Trash2 className="w-2 h-5" />
                                </button>
                                </div>
                            </div>
                            ))}
                        </div>
                        )}
                    </div>
                    ))}
                </div>
            </div>
            {/* Modal for Adding New Course */}
            
            {isModalOpen && (
                <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center" >
                    <div className="rounded-xl border border-gray-200 bg-white shadow-xl w-full max-w-4xl">
                        {/* Header */}
                        <div className="flex items-center gap-2 rounded-t-xl border-b bg-gradient-to-b from-gray-50 to-white px-4 py-3">
                        {/* plus icon */}
                            <CirclePlus className="h-6 w-6 text-green-600" />
                            <h3 className="text-base font-semibold text-gray-900">Add New Course</h3>
                        </div>

                        {/* Body */}
                        <div className="space-y-4 px-6 py-5 relative">
                            <div className="flex items-center gap-6">
                                <label className="block text-sm font-medium text-gray-700 w-40">Course Name</label>
                                <input
                                    type="text"
                                    value={courseName}
                                    onChange={(e) => setCourseName(e.target.value)}
                                    className="flex-1 rounded-md border border-gray-300 px-12 py-2 text-gray-900
                                            focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                    placeholder="Type course name..."
                                />
                            </div>
                        {/* Actions */}
                            <div className="flex items-center justify-center gap-6 pt-2">
                                <button
                                onClick={handleSave}
                                className="rounded-full bg-green-600 px-6 py-1.5 text-sm font-semibold text-white
                                            shadow hover:bg-green-700"
                                >
                                Save
                                </button>
                                <button
                                onClick={() => { handleCancel?.(); setCourseName(""); }}
                                className="rounded-full bg-red-600 px-6 py-1.5 text-sm font-semibold text-white
                                            shadow hover:bg-red-700"
                                >
                                Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}