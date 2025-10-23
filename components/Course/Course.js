import { 
    Plus, Trash2, Globe, GlobeLock, FileText, ChevronDown, ChevronRight,
    Video, FileCheck, ClipboardList, Edit, X, Search
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/router";
export default function Course({ courses, onAddContent, onSave, onDelete }) {
    const [expandedCourse, setExpandedCourse] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [courseName, setCourseName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all | published | unpublished
    const [editingContent, setEditingContent] = useState(null);
    const router = useRouter();
    const toggleCourse = (courseId) => {
        setExpandedCourse(expandedCourse === courseId ? null : courseId);
    };

    const handleSave = () => {
        if (!courseName.trim()) return;
        onSave(courseName);
        setCourseName("");
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setCourseName('');
        setIsModalOpen(false);
    };

    const handleEditContent = (courseId, contentId) => {
        router.push({
            pathname: '/course/content/pre-test-edit',
            query: { 
                courseId: courseId, 
                contentId: contentId 
            }
        });
    };

    // Filter courses
    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.course_title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || 
                            (filterStatus === 'published' && course.publish_date) ||
                            (filterStatus === 'unpublished' && !course.publish_date);
        return matchesSearch && matchesFilter;
    });

    const getContentIcon = (contentTypeName) => {
        const name = contentTypeName?.toLowerCase() || '';
        if (name.includes('video')) return <Video className="w-4 h-4" />;
        if (name.includes('test') || name.includes('quiz')) return <ClipboardList className="w-4 h-4" />;
        return <FileCheck className="w-4 h-4" />;
    };

    const getContentColor = (contentTypeName) => {
        const name = contentTypeName?.toLowerCase() || '';
        if (name.includes('video')) return 'bg-purple-100 text-purple-600';
        if (name.includes('test') || name.includes('quiz')) return 'bg-blue-100 text-blue-600';
        return 'bg-gray-100 text-gray-600';
    };

    return (
        <div >
            {/* Search & Filter Bar */}
            <div className="mb-6 flex gap-4 items-center">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilterStatus('all')}
                        className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                            filterStatus === 'all'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilterStatus('published')}
                        className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                            filterStatus === 'published'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        Published
                    </button>
                    <button
                        onClick={() => setFilterStatus('unpublished')}
                        className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                            filterStatus === 'unpublished'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        Unpublished
                    </button>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="font-medium">Add New Course</span>
                    </button>
                </div>
            </div>

            {/* Header
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Course Management</h2>
                
            </div> */}

            {/* Course List */}
            <div className="space-y-3">
                {filteredCourses.map((course) => (
                    <div
                        key={course.id_course}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                    >
                        {/* Course Header */}
                        <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3 flex-1">
                                {/* Expand/Collapse Button */}
                                <button
                                    onClick={() => toggleCourse(course.id_course)}
                                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                                >
                                    {expandedCourse === course.id_course ? (
                                        <ChevronDown className="w-5 h-5 text-gray-600" />
                                    ) : (
                                        <ChevronRight className="w-5 h-5 text-gray-600" />
                                    )}
                                </button>

                                {/* Course Icon */}
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                </div>

                                {/* Course Title */}
                                <h3 className="text-base font-semibold text-gray-900">
                                    {course.course_title}
                                </h3>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3">
                                {/* Status */}
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                                    course.publish_date
                                        ? 'bg-green-50 text-green-700 border border-green-200'
                                        : 'bg-gray-100 text-gray-600 border border-gray-300'
                                }`}>
                                    {course.publish_date ? (
                                        <>
                                            <Globe className="w-4 h-4" />
                                            <span>Published</span>
                                        </>
                                    ) : (
                                        <>
                                            <GlobeLock className="w-4 h-4" />
                                            <span>Unpublished</span>
                                        </>
                                    )}
                                </div>

                                {/* Content Button */}
                                <button 
                                    onClick={() => onAddContent && onAddContent(course.id_course)}
                                    className="flex items-center gap-2 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
                                >
                                    <FileText className="w-4 h-4" />
                                    <span className="text-sm font-medium">Content</span>
                                </button>

                                {/* Delete Button */}
                                <button 
                                    onClick={() => onDelete && onDelete(course.id_course)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Expanded Content List */}
                        {expandedCourse === course.id_course && course.contents && course.contents.length > 0 && (
                            <div className="border-t border-gray-100 bg-gray-50">
                                {course.contents.map((content, index) => (
                                    <div
                                        key={content.id_course_content}
                                        className={`flex items-center justify-between px-4 py-3 hover:bg-white transition-colors ${
                                            index !== course.contents.length - 1 ? 'border-b border-gray-100' : ''
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 flex-1">
                                            {/* Drag Handle */}
                                            <div className="flex items-center justify-center w-6 h-6 text-gray-400 cursor-move">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                    <circle cx="8" cy="6" r="1.5"/>
                                                    <circle cx="8" cy="12" r="1.5"/>
                                                    <circle cx="8" cy="18" r="1.5"/>
                                                    <circle cx="16" cy="6" r="1.5"/>
                                                    <circle cx="16" cy="12" r="1.5"/>
                                                    <circle cx="16" cy="18" r="1.5"/>
                                                </svg>
                                            </div>

                                            {/* Content Icon & Title */}
                                            <div className={`flex items-center justify-center w-8 h-8 rounded ${getContentColor(content.content_type_name)}`}>
                                                {getContentIcon(content.content_type_name)}
                                            </div>

                                            <span className="text-sm text-gray-700">{content.content_type_name}</span>
                                        </div>

                                        {/* Content Actions */}
                                        <div className="flex items-center gap-2">
                                            <button className="px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded hover:bg-green-600 transition-colors">
                                                Preview
                                            </button>
                                            <button
                                                onClick={() => handleEditContent(course.id_course, content.id_course_content)}
                                                className="p-1.5 text-gray-500 hover:bg-gray-200 rounded transition-colors">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Empty State */}
                        {expandedCourse === course.id_course && (!course.contents || course.contents.length === 0) && (
                            <div className="border-t border-gray-100 bg-gray-50 px-4 py-8 text-center">
                                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <FileText className="w-6 h-6 text-gray-400" />
                                </div>
                                <p className="text-sm text-gray-600 mb-3">No content added yet</p>
                                <button 
                                    onClick={() => onAddContent && onAddContent(course.id_course)}
                                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Add Content
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                {/* Empty State - No Results */}
                {filteredCourses.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses found</h3>
                        <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Modal for Adding New Course */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-900">Add New Course</h3>
                            <button 
                                onClick={handleCancel}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Course Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={courseName}
                                    onChange={(e) => setCourseName(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                                            focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                    placeholder="Enter course name..."
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg
                                        hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!courseName.trim()}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg
                                        hover:bg-green-700 transition-colors font-medium
                                        disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Save Course
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}