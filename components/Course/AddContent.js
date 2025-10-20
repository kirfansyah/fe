import { useState } from "react";
import { useRouter } from "next/router";
import { 
    ChevronDown, ChevronRight
} from "lucide-react";
import dynamic from "next/dynamic";
import 'react-quill/dist/quill.snow.css';
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })
export default function AddContent({onBack, courseId, contentTypes}) {
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedContentType, setSelectedContentType] = useState('');
    // React Quill modules configuration
    const quillModules = {
        toolbar: [
            [{ 'header': ['1', '2', '3', '4', '5', '6', false] }],
            [{ 'font': [] }],
            [{ 'size': [] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, 
             { 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'align': [] }],
            ['link', 'image', 'video'],
            ['code-block'],
            ['clean']
        ],
        clipboard: {
            // toggle to add extra line breaks when pasting HTML:
            matchVisual: false,
        }
    };
    // React Quill formats
    const quillFormats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'color', 'background',
        'list', 'bullet', 'indent',
        'align',
        'link', 'image', 'video',
        'code-block'
    ];
    const router = useRouter();
    const handleContentSelect = (contentName) => {
        setSelectedContentType(contentName);
        setShowDropdown(false);

        // Route mapping
        const routes = {
            'Multiple Choice Test': '/course/content/pre-test',
            'PRE TEST': '/course/content/pre-test',
            'Post Test': '/course/content/post-test',
            'POST TEST': '/course/content/post-test',
            'Quiz': '/course/content/quiz',
            'QUIZ': '/course/content/quiz',
            'Video': '/course/content/video',
            'Document': '/course/content/document',
        };

        // Langsung redirect
        if (routes[contentName]) {
            router.push({
                pathname: routes[contentName],
                query: { courseId }
            });
        } else {
            alert(`Content type "${contentName}" belum tersedia`);
        }
    };
    
    return (
    <div className="min-h-screen p-6">
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
        <div className="min-h-screen bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Add New Content</h2>  
                <p className="text-sm text-gray-600 mt-1">Course ID: {courseId}</p>
            </div>
            <div className="mb-4 w-1/2">
                <label className="block text-sm font-medium mb-1">Select Content Type</label>
                <div className="relative">
                    <button 
                        onClick={() => setShowDropdown(!showDropdown)} 
                        className="w-full bg-white border border-gray-300 rounded px-4 py-2 text-left flex justify-between items-center"
                    >
                        {selectedContentType || 'Choose content type'}
                        <ChevronDown className="w-4 h-4 text-gray-600" />
                    </button>
                    {showDropdown && (
                        <div className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                                {contentTypes.map((item) => (
                                    <div key={item.id_content_type}>
                                        {item.children && item.children.length > 0 ? (
                                            <div className="border-b border-gray-200 last:border-b-0">
                                                <div className="px-4 py-3 font-semibold bg-gray-50 text-gray-700 text-sm">
                                                    {item.name}
                                                </div>
                                                {item.children.map((child) => (
                                                    <div
                                                        key={child.parent_id}
                                                        onClick={() => handleContentSelect(child.name)}
                                                        className="px-6 py-3 hover:bg-blue-50 cursor-pointer transition-colors"
                                                    >
                                                        <span className="text-gray-700">{child.name}</span>
                                                    </div>
                                                ))} 
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => handleContentSelect(item.name)}
                                                className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-200 last:border-b-0 transition-colors"
                                            >
                                                <span className="text-gray-700">{item.name}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                    )}
                </div>
            </div>
            <div className="bg-white">
                <ReactQuill
                    theme="snow"
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder="Start writing your content here..."
                    style={{ height: '300px' }}
                />
            </div>
            <div className="mt-12 flex gap-6 justify-start items-center">
                <button className="px-6 py-2 bg-green-600 text-white rounded">
                    Save
                </button>
                <button onClick={onBack} className="px-6 py-2 bg-red-600 text-gray-700 rounded hover:bg-gray-300">
                    Cancel
                </button>
            </div>
        </div>
    </div>
    );
}