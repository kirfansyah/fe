import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle, X, FileText, Video, ChevronRight } from 'lucide-react';
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
    },
    '5': {
      accept: 'video/*',
      maxSize: 100,
      icon: Video,
      label: 'Video File',
      allowUrl: true,
    },
    '6': {
      accept: '.ppt,.pptx',
      maxSize: 20,
      icon: FileText,
      label: 'PowerPoint',
    },
  };

  // ==================== STATE ====================
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [existingFileUrl, setExistingFileUrl] = useState(null);
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

  // ==================== EFFECTS ====================
    useEffect(() => {
        if (isEditMode && contentData) {
            setTitle(contentData.content_title || '');
            setDescription(contentData.description || '');
            setVideoUrl(contentData.content_url || '');
        }
        if (contentData && contentData.content_url && !isEditMode) {
            setExistingFileUrl(contentData.content_url);
        }
    }, [isEditMode, contentData]);
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
    // Validasi ukuran
    if (file.size > config.maxSize * 1024 * 1024) {
      addToast(`File terlalu besar. Max ${config.maxSize}MB`, 'error');
      return;
    }
    try {
        await uploadFile(file,
        {
            contentTypeId
        }
      );
      addToast('File uploaded successfully', 'success');
      setExistingFileUrl(null);
    } catch (err) {
      addToast('File upload failed: ' + err.message, 'error');
    }
  };

  const handleRemoveFile = () => {
    removeFile();
    setExistingFileUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    // Validasi
    if (!title.trim()) {
      addToast('Judul harus diisi', 'warning');
      return;
    }

    if (!uploadedFile && !videoUrl) {
      addToast('Upload file atau masukkan URL', 'warning');
      return;
    }

    let contentUrl = '';
    if (videoUrl) {
      contentUrl = videoUrl; // Priority 1: Video URL (YouTube/Vimeo)
    } else if (uploadedFile) {
      contentUrl = uploadedFile.url; // Priority 2: Newly uploaded file
    } else if (existingFileUrl) {
      contentUrl = existingFileUrl; // Priority 3: Existing file (edit mode)
    }

    const data = {
      id_course: courseId,
      id_content_type: contentTypeId,
        content_title: title,
        time_duration : uploadedFile && uploadedFile.duration ? uploadedFile.duration : "00:00:00",
        content_url: contentUrl,
        time_duration: "00:00:00",
        created_by: createdBy,
        created_device: "system"
    };
    if (isEditMode && contentData?.id_course_content) {
        data.id_course_content = contentData.id_course_content;
    }
    try {
        showLoading(isEditMode ? 'Updating Content...' : 'Saving Content...'); 
        setTimeout(async () => {
            showSuccess(isEditMode ? 'Content updated successfully!' : 'Content saved successfully!');   
            if (onSave) {
                onSave(data);
            }
        }, 1500);
    } catch (error) {
        showError('Failed to save Content: ' + error.message);
    }
  };

  const handleCancel = () => {
    if (uploading) return;
    showWarning('Are you sure you want to cancel? Unsaved changes will be lost.').then((result) => {
      if (result.isConfirmed) {
        setTitle('');
        setDescription('');
        setVideoUrl('');
        setExistingFileUrl(null);
        handleRemoveFile();
        onBack();
      }
    });
  };
  // ==================== RENDER ====================
  // Display file info (existing atau newly uploaded)
  const displayFileInfo = uploadedFile || (existingFileUrl ? {
    name: existingFileUrl.split('/').pop(),
    size: 'Unknown Size',
    url: existingFileUrl,
    isExisting: true
  } : null);

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Home</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 font-medium">Course Management</span>
          </div>
      </div>
      <div className="min-h-screen bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">{isEditMode ? 'Edit Content' : 'Upload Content'}</h2>
                <div className="text-sm text-gray-600">
                <span>Course ID: {courseId}</span>
                {isEditMode && contentData?.id_course_content && (
                    <span className="ml-3">Content ID: {contentData.id_course_content}</span>
                )}
          </div>
          </div>
        <div className="space-y-4">
          {/* ========== TITLE INPUT ========== */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Judul Content <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masukkan judul content"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          {/* ========== DESCRIPTION TEXTAREA ========== */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Masukkan deskripsi content (opsional)"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
            />
          </div>

          {/* ========== VIDEO URL INPUT ========== */}
          {config?.allowUrl && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video URL (YouTube, Vimeo)
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
              <p className="mt-1 text-sm text-gray-500">Atau upload file video di bawah</p>
            </div>
          )}

          {/* ========== FILE UPLOAD SECTION ========== */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload {config?.label}
              {isEditMode && existingFileUrl && !uploadedFile && (
                <span className="ml-2 text-xs text-blue-600">(Optional - akan replace file lama)</span>
              )}
            </label>

            {/* --- DROP ZONE --- */}
            {!displayFileInfo ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
                  isDragging
                    ? 'border-purple-500 bg-purple-50 scale-105'
                    : 'border-gray-300 hover:border-gray-400'
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

                <Icon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-purple-600 font-medium mb-1">Klik untuk upload</p>
                <p className="text-gray-500 text-sm mb-2">atau drag and drop file di sini</p>
                <p className="text-xs text-gray-400">Max. {config?.maxSize}MB</p>

                {/* Upload Progress - REAL dari API */}
                {uploading && (
                  <div className="mt-4 px-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-purple-600 h-2.5 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Uploading... {uploadProgress}%
                    </p>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mt-4 px-4">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
              </div>
            ) : (
            //   /* --- FILE PREVIEW --- */
            //   <div className="border border-green-300 rounded-lg p-4 bg-green-50">
            //     <div className="flex items-center justify-between mb-3">
            //       <div className="flex items-center space-x-3 flex-1 min-w-0">
            //         <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
            //         <div className="flex-1 min-w-0">
            //           <p className="font-medium text-gray-900 truncate">
            //             {uploadedFile.name}
            //           </p>
            //           <p className="text-sm text-gray-500">{uploadedFile.size}</p>
            //           {uploadedFile.filePath && (
            //             <div className="mt-1">
            //               <p className="text-xs text-green-600">✓ Uploaded to server</p>
            //               <p className="text-xs text-gray-500 truncate">
            //                 {uploadedFile.filePath}
            //               </p>
            //             </div>
            //           )}
            //         </div>
            //       </div>
            //       <button
            //         onClick={handleRemoveFile}
            //         className="p-2 hover:bg-green-200 rounded-lg transition-colors"
            //         disabled={uploading}
            //       >
            //         <X className="w-5 h-5 text-gray-600" />
            //       </button>
            //     </div>
            <div className={`border rounded-lg p-4 ${
                displayFileInfo.isExisting ? 'border-blue-300 bg-blue-50' : 'border-green-300 bg-green-50'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <CheckCircle className={`w-6 h-6 flex-shrink-0 ${
                      displayFileInfo.isExisting ? 'text-blue-600' : 'text-green-600'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {displayFileInfo.name}
                      </p>
                      <p className="text-sm text-gray-500">{displayFileInfo.size}</p>
                      {displayFileInfo.filePath && (
                        <div className="mt-1">
                          <p className={`text-xs ${
                            displayFileInfo.isExisting ? 'text-blue-600' : 'text-green-600'
                          }`}>
                            {displayFileInfo.isExisting ? '📎 Existing file' : '✓ Uploaded to server'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {displayFileInfo.filePath}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveFile}
                    className={`p-2 rounded-lg transition-colors ${
                      displayFileInfo.isExisting 
                        ? 'hover:bg-blue-200' 
                        : 'hover:bg-green-200'
                    }`}
                    disabled={uploading}
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                {/* Video Preview */}
                {contentTypeId === '5' && 
                uploadedFile.type.startsWith('video/') && (
                  <video
                    src={uploadedFile.url}
                    controls
                    className="w-full rounded-lg"
                    style={{ maxHeight: '300px' }}
                  />
                )}
              </div>
            )}
          </div>

          {/* ========== ACTION BUTTONS ========== */}
          <div className="flex space-x-3 pt-6">
            <button
              onClick={handleSave}
              disabled={uploading}
              className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : (isEditMode ? 'Update' : 'Save')}
            </button>
            <button
              onClick={handleCancel}
              disabled={uploading}
              className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadForm;