import React, { useState, useRef, useEffect } from 'react';
import { 
    CheckCircle, 
    X, 
    FileText, 
    Video, 
    ChevronRight,
    Upload,
    AlertCircle,
    Save,
    Film,
    FileCheck,
    Link as LinkIcon,
    Info,
    ExternalLink,
    Copy
} from 'lucide-react';
import { useFileUpload } from '../../../hooks/useFileUpload';
import { useSweetAlert } from '../../../hooks/useSweetAlert';

const FileUploadForm = ({ 
    contentTypeId, 
    courseId, 
    onSave, 
    onBack, 
    addToast, 
    createdBy = "System",
    contentData = null,
    isEditMode = false 
}) => {
    // ==================== CONSTANTS ====================
    const FILE_CONFIG = {
        '4': {
            accept: '.pdf',
            maxSize: 10,
            icon: FileText,
            label: 'PDF Document',
            color: 'red',
            description: 'Upload PDF files for reading materials'
        },
        '5': {
            accept: 'video/*',
            maxSize: 100,
            icon: Video,
            label: 'Video File',
            color: 'purple',
            allowUrl: true,
            description: 'Upload video or provide YouTube/Vimeo URL'
        },
        '6': {
            accept: '.ppt,.pptx',
            maxSize: 20,
            icon: FileText,
            label: 'PowerPoint',
            color: 'orange',
            description: 'Upload PowerPoint presentations'
        },
    };

    // ==================== STATE ====================
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [existingFileUrl, setExistingFileUrl] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    const fileInputRef = useRef(null);

    // ==================== CUSTOM HOOK ====================
    const { 
        uploadedFile, 
        uploading, 
        uploadProgress, 
        error, 
        uploadFile, 
        removeFile 
    } = useFileUpload();
    
    const { 
        showLoading, 
        showSuccess, 
        showError,
        showWarning, 
        confirmAction
    } = useSweetAlert();
    
    const config = FILE_CONFIG[contentTypeId];
    const Icon = config?.icon || FileText;

    // ✅ Construct full URL dari relative path
    const getFullFileUrl = (relativePath) => {
        if (!relativePath) return null;
        
        // Jika sudah full URL (http/https), return as is
        if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
            return relativePath;
        }
        
        // Construct full URL dari relative path
        // Remove /api/v1 jika ada, karena content_url sudah include /uploads
        const cleanBaseUrl = 'http://192.168.12.73:5000/';
        
        return `${cleanBaseUrl}${relativePath}`;
    };

    // ==================== EFFECTS ====================
    useEffect(() => {
        if (isEditMode && contentData) {
            setTitle(contentData.content_title || '');
            setDescription(contentData.content_body || '');
            setVideoUrl(contentData.content_url || '');
            
            // ✅ Set existing file URL (relative path dari backend)
            if (contentData.content_url) {
                setExistingFileUrl(contentData.content_url);
            }
        }
    }, [isEditMode, contentData]);

    // ==================== VALIDATION ====================
    const validateForm = () => {
        const errors = {};
        
        if (!title.trim()) {
            errors.title = 'Title is required';
        }
        
        if (!uploadedFile && !videoUrl && !existingFileUrl) {
            errors.file = 'Please upload a file or provide a URL';
        }
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // ==================== HANDLERS ====================
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleFileSelect = async (file) => {
        setValidationErrors(prev => ({ ...prev, file: null }));
        
        if (file.size > config.maxSize * 1024 * 1024) {
            showError(`File too large. Maximum size is ${config.maxSize}MB`);
            return;
        }
        const section = 'content';
        try {
            await uploadFile(file, { contentTypeId,courseId,section });
            showSuccess('File uploaded successfully');
            setExistingFileUrl(null); // Clear existing when new file uploaded
        } catch (err) {
            showError('File upload failed: ' + err.message);
        }
    };

    const handleRemoveFile = () => {
        removeFile();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        // ✅ Restore existing file URL jika ada (saat cancel new upload)
        if (isEditMode && contentData?.content_url) {
            setExistingFileUrl(contentData.content_url);
        }
    };

    const handleCopyLink = async () => {
        const fullUrl = getFullFileUrl(existingFileUrl);
        if (fullUrl) {
            try {
                await navigator.clipboard.writeText(fullUrl);
                showSuccess('Link copied to clipboard!');
            } catch (err) {
                showError('Failed to copy link');
            }
        }
    };

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        const result = await confirmAction({
            title: isEditMode ? 'Update this content?' : 'Save this content?',
            text: `Title: ${title}`,
            confirmButtonText: isEditMode ? 'Yes, update it!' : 'Yes, save it!'
        });
        
        if (!result.isConfirmed) return;

        let contentUrl = '';
        if (videoUrl && config?.allowUrl) {
            contentUrl = videoUrl; // Priority 1: Video URL
        } else if (uploadedFile) {
            contentUrl = uploadedFile.url; // Priority 2: New upload (relative path dari backend)
        } else if (existingFileUrl) {
            contentUrl = existingFileUrl; // Priority 3: Existing (relative path)
        }

        const data = {
            id_course: courseId,
            id_content_type: contentTypeId,
            content_title: title,
            content_body : description,
            time_duration: uploadedFile && uploadedFile.duration ? uploadedFile.duration : "00:00:00",
            content_url: contentUrl, // ✅ Kirim relative path ke backend
            ...(isEditMode ? {
                id_course_content: contentData.id_course_content,
                updated_by: createdBy,
                updated_device: "system"
            } : {
                created_by: createdBy,
                created_device: "system"
            })
        };

        try {
            showLoading(isEditMode ? 'Updating Content...' : 'Saving Content...'); 
            setTimeout(async () => {
                showSuccess(isEditMode ? 'Content updated successfully!' : 'Content saved successfully!');   
                if (onSave) {
                    onSave(data);
                }
            }, 1500);
        } catch (error) {
            showError('Failed to save content: ' + error.message);
        }
    };

    const handleCancel = async () => {
        if (uploading) return;
        
        const result = await confirmAction({
            title: 'Cancel upload?',
            text: 'Unsaved changes will be lost',
            confirmButtonText: 'Yes, cancel'
        });
        
        if (result.isConfirmed) {
            setTitle('');
            setDescription('');
            setVideoUrl('');
            setExistingFileUrl(null);
            handleRemoveFile();
            onBack();
        }
    };

    // ==================== HELPERS ====================
    const displayFileInfo = uploadedFile || (existingFileUrl ? {
        name: existingFileUrl.split('/').pop(),
        size: 'Existing file',
        url: existingFileUrl,
        isExisting: true
    } : null);

    const isFormValid = title.trim() && (uploadedFile || videoUrl || existingFileUrl);

    const formatFileSize = (bytes) => {
        if (!bytes || bytes === 'Unknown Size' || bytes === 'Existing file') return bytes;
        const mb = bytes / (1024 * 1024);
        return mb >= 1 ? `${mb.toFixed(2)} MB` : `${(bytes / 1024).toFixed(2)} KB`;
    };

    // ✅ Get file extension for icon/preview
    const getFileExtension = (filename) => {
        return filename.split('.').pop().toLowerCase();
    };

    // ==================== RENDER ====================
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Enhanced Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {isEditMode ? 'Edit Content' : 'Upload Content'}
                        </h1>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <span>Course Management</span>
                            <ChevronRight className="w-4 h-4" />
                            <span className="text-blue-600 font-medium">
                                {config?.label} Upload
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-600">Course ID</p>
                        <p className="text-lg font-bold text-gray-900">{courseId}</p>
                        {isEditMode && contentData?.id_course_content && (
                            <>
                                <p className="text-xs text-gray-500 mt-1">Content ID</p>
                                <p className="text-sm font-semibold text-gray-700">
                                    {contentData.id_course_content}
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Section: Content Information */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3 mb-6">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            config?.color === 'red' ? 'bg-red-100' :
                            config?.color === 'purple' ? 'bg-purple-100' :
                            config?.color === 'orange' ? 'bg-orange-100' :
                            'bg-blue-100'
                        }`}>
                            <Icon className={`w-6 h-6 ${
                                config?.color === 'red' ? 'text-red-600' :
                                config?.color === 'purple' ? 'text-purple-600' :
                                config?.color === 'orange' ? 'text-orange-600' :
                                'text-blue-600'
                            }`} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Content Information</h3>
                            <p className="text-sm text-gray-600">{config?.description}</p>
                        </div>
                    </div>

                    <div className="space-y-5">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Content Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => {
                                    setTitle(e.target.value);
                                    setValidationErrors(prev => ({ ...prev, title: null }));
                                }}
                                placeholder="Enter content title..."
                                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                                    validationErrors.title
                                        ? 'border-red-300 focus:ring-red-500'
                                        : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                                }`}
                            />
                            {validationErrors.title && (
                                <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {validationErrors.title}
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Description (Optional)
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Add a brief description..."
                                rows={3}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Section: Video URL (if video content) */}
                {config?.allowUrl && (
                    <div className="p-6 bg-purple-50 border-b border-purple-200">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <LinkIcon className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 mb-1">
                                    Video URL (Alternative)
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Paste a YouTube or Vimeo URL, or upload a video file below
                                </p>
                            </div>
                        </div>

                        <div className="relative">
                            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="url"
                                value={videoUrl}
                                onChange={(e) => {
                                    setVideoUrl(e.target.value);
                                    setValidationErrors(prev => ({ ...prev, file: null }));
                                }}
                                placeholder="https://www.youtube.com/watch?v=..."
                                className="w-full pl-12 pr-4 py-3 border-2 border-purple-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                            />
                        </div>

                        <div className="mt-3 p-3 bg-white border border-purple-200 rounded-lg">
                            <div className="flex items-start gap-2">
                                <Info className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-gray-600">
                                    Supported platforms: YouTube, Vimeo. Video URL takes priority over uploaded files.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Section: File Upload */}
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <Upload className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">File Upload</h3>
                                <p className="text-sm text-gray-600">
                                    {isEditMode && existingFileUrl 
                                        ? 'Upload new file to replace existing file'
                                        : 'Drag and drop or click to browse'
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="text-xs text-gray-600">Max Size</p>
                            <p className="text-sm font-bold text-gray-900">{config?.maxSize} MB</p>
                        </div>
                    </div>

                    {/* ✅ Show Existing File Info (Edit Mode - BEFORE new upload) */}
                    {isEditMode && existingFileUrl && !uploadedFile && (
                        <div className="mb-4 border-2 border-blue-300 bg-blue-50 rounded-xl overflow-hidden">
                            <div className="p-5">
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 bg-blue-200 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <FileCheck className="w-7 h-7 text-blue-700" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <p className="text-sm font-bold text-gray-900">Current File</p>
                                            <span className="px-2 py-0.5 bg-blue-200 text-blue-700 text-xs font-bold rounded-full">
                                                Existing
                                            </span>
                                            <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs font-bold rounded-full uppercase">
                                                {getFileExtension(existingFileUrl)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700 mb-3 truncate">
                                            {existingFileUrl.split('/').pop()}
                                        </p>
                                        
                                        {/* ✅ Action Buttons */}
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {/* View/Download Button */}
                                            <a
                                                href={getFullFileUrl(existingFileUrl)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                View File
                                            </a>

                                            {/* Copy Link Button */}
                                            <button
                                                onClick={handleCopyLink}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-blue-300 text-blue-700 text-sm font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                                            >
                                                <Copy className="w-4 h-4" />
                                                Copy Link
                                            </button>
                                        </div>

                                        {/* ✅ Collapsible Full URL */}
                                        <details className="mt-3">
                                            <summary className="text-xs text-blue-700 cursor-pointer hover:text-blue-900 font-medium flex items-center gap-1">
                                                <ChevronRight className="w-3 h-3" />
                                                Show full path
                                            </summary>
                                            <div className="mt-2 p-3 bg-white border border-blue-200 rounded-lg">
                                                <p className="text-xs text-gray-600 mb-1 font-medium">Relative Path:</p>
                                                <code className="text-xs break-all text-gray-700 block mb-2">
                                                    {existingFileUrl}
                                                </code>
                                                <p className="text-xs text-gray-600 mb-1 font-medium">Full URL:</p>
                                                <code className="text-xs break-all text-blue-600">
                                                    {getFullFileUrl(existingFileUrl)}
                                                </code>
                                            </div>
                                        </details>
                                    </div>
                                </div>
                            </div>

                            {/* Info Message */}
                            <div className="border-t-2 border-blue-300 bg-blue-100 p-4">
                                <div className="flex items-start gap-2">
                                    <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-blue-800">
                                        <strong>Note:</strong> Upload a new file below to replace the current file. 
                                        The existing file will be replaced when you save.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Drop Zone or New File Preview */}
                    {!uploadedFile ? (
                        /* Drop Zone */
                        <div>
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
                                    isDragging
                                        ? 'border-blue-500 bg-blue-50 scale-[1.02] shadow-lg'
                                        : validationErrors.file
                                        ? 'border-red-300 bg-red-50'
                                        : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                                }`}
                                onClick={() => !uploading && fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept={config?.accept}
                                    onChange={handleFileInputChange}
                                    className="hidden"
                                    disabled={uploading}
                                />

                                <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
                                    isDragging ? 'bg-blue-200 animate-bounce' : 'bg-gray-100'
                                }`}>
                                    <Icon className={`w-10 h-10 ${
                                        isDragging ? 'text-blue-600' : 'text-gray-400'
                                    }`} />
                                </div>

                                <p className={`font-bold text-lg mb-2 ${
                                    isDragging ? 'text-blue-600' : 'text-gray-900'
                                }`}>
                                    {isDragging ? 'Drop file here' : 'Click to upload or drag and drop'}
                                </p>
                                <p className="text-sm text-gray-600 mb-4">
                                    {config?.accept.replace(/\./g, '').toUpperCase()} files up to {config?.maxSize}MB
                                </p>

                                {/* Upload Progress */}
                                {uploading && (
                                    <div className="mt-6 max-w-md mx-auto">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-semibold text-gray-700">Uploading...</span>
                                            <span className="text-sm font-bold text-blue-600">{uploadProgress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 transition-all duration-300 rounded-full"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Error Message */}
                                {error && (
                                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <div className="flex items-center gap-2 text-red-600">
                                            <AlertCircle className="w-5 h-5" />
                                            <p className="text-sm font-semibold">{error}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {validationErrors.file && (
                                <p className="text-sm text-red-600 mt-3 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    {validationErrors.file}
                                </p>
                            )}
                        </div>
                    ) : (
                        /* ✅ New Uploaded File Preview */
                        <div className="border-2 border-green-300 bg-green-50 rounded-2xl overflow-hidden">
                            <div className="p-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="w-14 h-14 bg-green-200 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <CheckCircle className="w-7 h-7 text-green-700" />
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-bold text-gray-900 truncate">
                                                    {uploadedFile.name}
                                                </p>
                                                <span className="px-2 py-0.5 bg-green-200 text-green-700 text-xs font-bold rounded-full">
                                                    New Upload
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                {formatFileSize(uploadedFile.size)}
                                            </p>
                                            {uploadedFile.filePath && (
                                                <p className="text-xs text-gray-500 mt-1 truncate">
                                                    {uploadedFile.filePath}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <button
                                        onClick={handleRemoveFile}
                                        disabled={uploading}
                                        className="p-3 hover:bg-green-200 rounded-xl transition-all disabled:opacity-50"
                                        title="Remove new file"
                                    >
                                        <X className="w-5 h-5 text-gray-700" />
                                    </button>
                                </div>
                            </div>

                            {/* Warning: Will Replace */}
                            {isEditMode && contentData?.content_url && (
                                <div className="border-t-2 border-green-300 bg-yellow-50 p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-semibold text-yellow-900 mb-1">
                                                ⚠️ This will replace the existing file
                                            </p>
                                            <p className="text-xs text-yellow-700">
                                                Previous file: <code className="font-mono">{contentData.content_url.split('/').pop()}</code>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Video Preview */}
                            {contentTypeId === '5' && 
                             uploadedFile.type?.startsWith('video/') && (
                                <div className="border-t-2 border-green-300 bg-white p-4">
                                    <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <Film className="w-4 h-4" />
                                        Video Preview
                                    </p>
                                    <video
                                        src={uploadedFile.url}
                                        controls
                                        className="w-full rounded-xl shadow-lg"
                                        style={{ maxHeight: '400px' }}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="p-6 bg-gray-50 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <button 
                            onClick={handleCancel}
                            disabled={uploading}
                            className="px-5 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <X className="w-5 h-5" />
                            Cancel
                        </button>

                        <div className="flex items-center gap-3">
                            {!isFormValid && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <AlertCircle className="w-4 h-4 text-orange-500" />
                                    <span>Complete all required fields</span>
                                </div>
                            )}

                            <button 
                                onClick={handleSave}
                                disabled={!isFormValid || uploading}
                                className={`px-6 py-2.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2 ${
                                    isFormValid && !uploading
                                        ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                {uploading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        {isEditMode ? 'Update Content' : 'Save Content'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FileUploadForm;