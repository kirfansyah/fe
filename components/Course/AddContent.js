import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import { 
    ChevronDown, 
    ChevronRight, 
    FileText, 
    CheckCircle,
    AlertCircle,
    Save,
    X,
    Search,
    Lock,
    Shield
} from "lucide-react";
import dynamic from "next/dynamic";
import 'react-quill/dist/quill.snow.css';
import { useCourses } from "../../hooks/useCourses";
import { ProfileContext } from "../../contexts/profile/ProfileContext";
import { useSweetAlert } from '../../hooks/useSweetAlert';
import { getDeviceInfo } from '@/lib/deviceHelper';

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function AddContent({
    onBack, 
    onSuccess,
    courseId, 
    contentTypes,
    mode = 'add', 
    contentId = null,
    permissions // ✅ Receive permissions
}) {
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedContentTypeId, setSelectedContentTypeId] = useState('');
    const [selectedContentType, setSelectedContentType] = useState('');
    const [content, setContent] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    const router = useRouter();
    const { showLoading, showSuccess, showError, showWarning, confirmAction } = useSweetAlert();
    const { dataKaryawan } = useContext(ProfileContext);
    const { contentData, handleSavePreTest } = useCourses(contentId);

    // ✅ Check permissions
    const canEdit = mode === 'edit' ? permissions?.can_edit : permissions?.can_create;
    const isReadOnly = !canEdit;

    // React Quill modules configuration
    const quillModules = {
        toolbar: isReadOnly ? false : [ // ✅ Disable toolbar if read-only
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
            matchVisual: false,
        }
    };

    const quillFormats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'color', 'background',
        'list', 'bullet', 'indent',
        'align',
        'link', 'image', 'video',
        'code-block'
    ];

    useEffect(() => {
        if (contentData && mode === 'edit') {
            setSelectedContentTypeId(contentData.id_content_type || '');
            setSelectedContentType(contentData.content_title || '');
            setContent(contentData.content_body || '');
        }
    }, [contentData, mode]);

    // ✅ Show permission error on mount if no permission
    useEffect(() => {
        if (isReadOnly && mode === 'add') {
            showError('You do not have permission to add content');
            setTimeout(() => {
                if (onBack) onBack();
            }, 2000);
        }
    }, [isReadOnly, mode]);

    const handleContentSelect = (contentId, contentName) => {
        // ✅ Check permission before allowing selection
        if (isReadOnly) {
            showWarning('You do not have permission to select content types');
            return;
        }

        setSelectedContentTypeId(contentId);
        setSelectedContentType(contentName);
        setShowDropdown(false);
        setSearchTerm('');

        // Route mapping
        const routes = {
            'Multiple Choice Test': '/course/content/pre-test',
            'PRE TEST': '/course/content/pre-test',
            'Post Test': '/course/content/pre-test',
            'PDF Content': '/course/upload/upload-content',
            'Video Content': '/course/upload/upload-content',
            'PPT Content': '/course/upload/upload-content'
        };

        if (routes[contentName]) {
            router.push({
                pathname: routes[contentName],
                query: { courseId, contentTypeId: contentId },
            });
        }
    };
    
    const handleSubmit = async () => {
        // ✅ Check permission before submit
        if (isReadOnly) {
            showError(`You do not have permission to ${mode === 'edit' ? 'update' : 'create'} content`);
            return;
        }

        if (!selectedContentTypeId) {
            showWarning('Please select a content type');
            return;
        }

        if (!content || !content.trim() || content === '<p><br></p>') {
            showWarning('Please add some content');
            return;
        }

        const result = await confirmAction({
            title: mode === 'edit' ? 'Update this Content?' : 'Save this Content?',
            text: `Content Type: ${selectedContentType}`,
            confirmButtonText: mode === 'edit' ? 'Yes, update it!' : 'Yes, save it!'
        });
        
        if (!result.isConfirmed) return;
        
        const deviceInfo = getDeviceInfo();
        const pretestData = {   
            id_course: courseId,
            id_content_type: selectedContentTypeId,
            content_title: selectedContentType,
            content_body: content,
            ...(mode === 'edit' ? {
                id_course_content: contentData.id_course_content,
                updated_by: dataKaryawan.nama,
                updated_device: deviceInfo.device
            } : {
                created_by: dataKaryawan.nama,
                created_device: deviceInfo.device
            })
        };
        
        try {
            showLoading(mode === 'edit' ? 'Updating Content...' : 'Saving Content...');
            await handleSavePreTest(pretestData);
            await showSuccess(mode === 'edit' ? 'Content updated successfully!' : 'Content saved successfully!');
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            showError(`Failed to ${mode === 'edit' ? 'update' : 'save'} content: ` + error.message);
        }
    };

    const filteredContentTypes = contentTypes.map(item => {
        if (item.children && item.children.length > 0) {
            const filteredChildren = item.children.filter(child =>
                child.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            return filteredChildren.length > 0 ? { ...item, children: filteredChildren } : null;
        }
        return item.name.toLowerCase().includes(searchTerm.toLowerCase()) ? item : null;
    }).filter(Boolean);

    const isFormValid = !isReadOnly && selectedContentTypeId && content && content.trim() && content !== '<p><br></p>';
    const wordCount = content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* ✅ Enhanced Header with Permission Badge */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex justify-between items-center">
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {mode === 'edit' ? 'Edit Content' : 'Add New Content'}
                            </h1>
                            {/* ✅ Permission Badge */}
                            {isReadOnly && (
                                <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                    <Lock className="w-3 h-3" />
                                    No Permission
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <span>Course Management</span>
                            <ChevronRight className="w-4 h-4" />
                            <span className="text-blue-600 font-medium">Content Editor</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-600">Course ID</p>
                        <p className="text-lg font-bold text-gray-900">{courseId}</p>
                    </div>
                </div>
            </div>

            {/* ✅ Permission Warning Banner */}
            {isReadOnly && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5 mb-6">
                    <div className="flex items-center gap-3">
                        <Shield className="w-6 h-6 text-red-600 flex-shrink-0" />
                        <div>
                            <h4 className="text-sm font-bold text-red-900 mb-1">Permission Denied</h4>
                            <p className="text-sm text-red-700">
                                You do not have permission to {mode === 'edit' ? 'edit' : 'create'} content. 
                                {mode === 'edit' ? ' You can only view this content.' : ' Please contact your administrator.'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ Main Form */}
            <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${
                isReadOnly ? 'opacity-75' : ''
            }`}>
                {/* Section: Content Type Selection */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            selectedContentTypeId ? 'bg-green-100' : 'bg-blue-100'
                        }`}>
                            {selectedContentTypeId ? (
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            ) : (
                                <FileText className="w-6 h-6 text-blue-600" />
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Content Type</h3>
                            <p className="text-sm text-gray-600">
                                {selectedContentTypeId 
                                    ? 'Content type selected' 
                                    : isReadOnly 
                                    ? 'Content type (view only)'
                                    : 'Select the type of content you want to create'}
                            </p>
                        </div>
                    </div>

                    <div className="relative max-w-2xl">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Select Content Type <span className="text-red-500">*</span>
                        </label>
                        
                        {/* ✅ Dropdown Button with Read-Only State */}
                        <button 
                            onClick={() => !isReadOnly && setShowDropdown(!showDropdown)} 
                            disabled={isReadOnly}
                            className={`w-full border-2 rounded-xl px-4 py-3 text-left flex justify-between items-center transition-all ${
                                isReadOnly
                                    ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
                                    : selectedContentTypeId
                                    ? 'border-green-500 bg-green-50'
                                    : showDropdown
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-300 bg-white hover:border-gray-400'
                            }`}
                        >
                            <span className={selectedContentType ? 'text-gray-900 font-medium' : 'text-gray-500'}>
                                {selectedContentType || 'Choose content type...'}
                            </span>
                            {isReadOnly ? (
                                <Lock className="w-5 h-5 text-gray-400" />
                            ) : (
                                <ChevronDown className={`w-5 h-5 transition-transform ${
                                    showDropdown ? 'rotate-180' : ''
                                } ${selectedContentTypeId ? 'text-green-600' : 'text-gray-600'}`} />
                            )}
                        </button>

                        {/* Dropdown Menu - Only show if not read-only */}
                        {showDropdown && !isReadOnly && (
                            <div className="absolute z-10 mt-2 w-full bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-96 overflow-hidden">
                                <div className="p-3 border-b border-gray-200 bg-gray-50">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search content types..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                </div>

                                <div className="overflow-y-auto max-h-80">
                                    {filteredContentTypes.length > 0 ? (
                                        filteredContentTypes.map((item) => (
                                            <div key={item.id_content_type}>
                                                {item.children && item.children.length > 0 ? (
                                                    <div className="border-b border-gray-200 last:border-b-0">
                                                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                                            <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                                                                {item.name}
                                                            </span>
                                                        </div>
                                                        {item.children.map((child) => (
                                                            <div
                                                                key={child.parent_id}
                                                                onClick={() => handleContentSelect(child.parent_id, child.name)}
                                                                className={`px-6 py-3 hover:bg-blue-50 cursor-pointer transition-colors flex items-center justify-between ${
                                                                    selectedContentTypeId === child.parent_id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                                                                }`}
                                                            >
                                                                <span className="text-gray-700 font-medium">{child.name}</span>
                                                                {selectedContentTypeId === child.parent_id && (
                                                                    <CheckCircle className="w-5 h-5 text-blue-600" />
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div
                                                        onClick={() => handleContentSelect(item.id_content_type, item.name)}
                                                        className={`px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-200 last:border-b-0 transition-colors flex items-center justify-between ${
                                                            selectedContentTypeId === item.id_content_type ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                                                        }`}
                                                    >
                                                        <span className="text-gray-700 font-medium">{item.name}</span>
                                                        {selectedContentTypeId === item.id_content_type && (
                                                            <CheckCircle className="w-5 h-5 text-blue-600" />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-4 py-8 text-center text-gray-500">
                                            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                            <p className="text-sm">No content types found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Section: Content Editor */}
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <FileText className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Content Body</h3>
                                <p className="text-sm text-gray-600">
                                    {isReadOnly 
                                        ? 'View content (read-only mode)'
                                        : 'Write or paste your content using the rich text editor'
                                    }
                                </p>
                            </div>
                        </div>
                        
                        {content && content !== '<p><br></p>' && (
                            <div className="text-right">
                                <p className="text-xs text-gray-600">Word Count</p>
                                <p className="text-lg font-bold text-gray-900">{wordCount}</p>
                            </div>
                        )}
                    </div>

                    {/* ✅ Rich Text Editor with Read-Only Support */}
                    <div className={`border-2 rounded-xl overflow-hidden transition-colors ${
                        isReadOnly 
                            ? 'border-gray-300 bg-gray-50'
                            : 'border-gray-200 focus-within:border-blue-500'
                    }`}>
                        <ReactQuill
                            theme="snow"
                            value={content}
                            onChange={setContent}
                            modules={quillModules}
                            formats={quillFormats}
                            readOnly={isReadOnly}
                            placeholder={isReadOnly 
                                ? "No content available" 
                                : "Start writing your content here... You can use rich text formatting, insert images, videos, and more."
                            }
                            style={{ minHeight: '400px' }}
                        />
                    </div>

                    {/* Content Guidelines */}
                    {!isReadOnly && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-blue-900 mb-1">
                                        Content Guidelines
                                    </p>
                                    <ul className="text-xs text-blue-700 space-y-1">
                                        <li>• Use clear and concise language</li>
                                        <li>• Format text for better readability</li>
                                        <li>• Include relevant images or videos when applicable</li>
                                        <li>• Proofread before saving</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ✅ Action Buttons with Permission Check */}
                <div className="p-6 bg-gray-50 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <button 
                            onClick={onBack} 
                            className="px-5 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center gap-2"
                        >
                            <X className="w-5 h-5" />
                            {isReadOnly ? 'Close' : 'Cancel'}
                        </button>

                        <div className="flex items-center gap-3">
                            {/* Validation Status */}
                            {!isReadOnly && !isFormValid && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <AlertCircle className="w-4 h-4 text-orange-500" />
                                    <span>Complete all fields to save</span>
                                </div>
                            )}

                            {/* ✅ Save Button - Only show if not read-only */}
                            {!isReadOnly && (
                                <button 
                                    onClick={handleSubmit}
                                    disabled={!isFormValid}
                                    className={`px-6 py-2.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2 ${
                                        isFormValid
                                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    <Save className="w-5 h-5" />
                                    {mode === 'edit' ? 'Update Content' : 'Save Content'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}