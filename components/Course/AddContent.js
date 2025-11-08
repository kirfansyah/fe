import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import { 
    ChevronDown, ChevronRight
} from "lucide-react";
import dynamic from "next/dynamic";
import 'react-quill/dist/quill.snow.css';
import { useCourses } from "../../hooks/useCourses";
import { ProfileContext } from "../../contexts/profile/ProfileContext";
import { useSweetAlert } from '../../hooks/useSweetAlert';
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })
export default function AddContent({
    onBack, 
    onSuccess,
    courseId, 
    contentTypes,
    mode='add', 
    contentId = null
}) {
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedContentTypeId, setSelectedContentTypeId] = useState('');
    const [selectedContentType, setSelectedContentType] = useState('');
    const [content, setContent] = useState('');
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
    const handleContentSelect = (contentId,contentName) => {
        setSelectedContentTypeId(contentId);
        setSelectedContentType(contentName);
        setShowDropdown(false);

        // Route mapping
        const routes = {
            'Multiple Choice Test': '/course/content/pre-test',
            'PRE TEST': '/course/content/pre-test',
            'PDF Content': '/course/upload/upload-content',
            'Video Content': '/course/upload/upload-content',
            'PPT Content': '/course/upload/upload-content'
        };

        // Langsung redirect
        if (routes[contentName]) {
            router.push({
                pathname: routes[contentName],
                query: { courseId, contentTypeId: contentId },
            });
        }
    };
    const { showLoading, showSuccess, showError, showWarning, confirmAction } = useSweetAlert();
    const { getKaryawan, dataKaryawan } = useContext(ProfileContext);
                  
    const dataKaryawans = dataKaryawan?.length ? dataKaryawan[0] : [];

    const { contentData, handleSavePreTest } = useCourses(contentId);
    useEffect(() => {
        if (contentData && mode === 'edit') {
            console.log('Loaded content data for editing:', contentData);
            setSelectedContentTypeId(contentData.id_content_type || '');
            setSelectedContentType(contentData.content_title || '');
            setContent(contentData.content_body || '');
        }
    }, [contentData, mode]);
    
    const handleSubmit = async () => {
        if (!selectedContentTypeId) {
            showWarning('Please select a content type');
            return;
        }

        if (!content || !content.trim() || content === '<p><br></p>') {
            showWarning('Please add a some content');
            return;
        }
        const result = await confirmAction({
            title: 'Save this Content?',
            text: `Content Type: ${selectedContentType}`,
            confirmButtonText: 'Yes, save it!'
        });
        if (!result.isConfirmed) return;
        const pretestData = {   
            id_course: courseId,
            id_content_type: selectedContentTypeId,
            content_title: selectedContentType,
            content_body: content,
            // Include id hanya jika mode edit
            ...(mode === 'edit' ? {
                id_course_content: contentData.id_course_content,
                updated_by: dataKaryawans.nama,
                updated_device: "system"
            }: {
                created_by: dataKaryawans.nama,
                created_device: "system"
            })

            
        };
        
        try {
            showLoading('Saving Content...');
            const response = await handleSavePreTest(pretestData);
            await showSuccess('Content saved successfully!');
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            showError('Failed to save course: ' + error.message);
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
                <h2 className="text-lg font-semibold">
                        {mode === 'edit' ? '✏️ Edit Content' : '➕ Add New Content'}
                    </h2>  
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
                                                        onClick={() => handleContentSelect(child.parent_id,child.name)}
                                                        className="px-6 py-3 hover:bg-blue-50 cursor-pointer transition-colors"
                                                    >
                                                        <span className="text-gray-700">{child.name}</span>
                                                    </div>
                                                ))} 
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => handleContentSelect(item.id_content_type,item.name)}
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
                    value={content}
                    onChange={setContent}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder="Start writing your content here..."
                    style={{ height: '300px' }}
                />
            </div>
            <div className="mt-12 flex gap-6 justify-start items-center">
                <button onClick={handleSubmit} className="px-6 py-2 bg-green-600 text-white rounded">
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