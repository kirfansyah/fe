import { useState } from "react";
import API from '../services/ManagementService';
import { useRouter } from 'next/router';
import { ProfileContext } from '../contexts/profile/ProfileContext';

export function useFileUpload(){
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [error, setError] = useState(null);
    const router = useRouter();
    const uploadFile = async (fileData, additionalData) => {
        setUploading(true);
        setError(null); 
        setUploadProgress(0);
        try {
            const uploadData ={
                file : fileData,
                ...additionalData
            }
            const response = await API.uploadContentFile(uploadData, (percentCompleted) => {
                setUploadProgress(percentCompleted);
            });
            setUploadedFile(response.data);
            setUploadProgress(100);
            setUploading(false);
            return response.data;
        } catch (err) {
            setError(err.message || 'Failed to upload file');
            throw err;
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };
    const removeFile = () => {
        if (uploadedFile?.url) {
            URL.revokeObjectURL(uploadedFile.url);
        }
        setUploadedFile(null);
        setUploadProgress(0);
        setError(null);
    };
    const reset = () => {
        removeFile();
        setUploading(false);
        setError(null);
    }
    return {
        uploadedFile,
        uploadFile,
        uploadProgress, 
        uploading,
        error,
        removeFile,
        reset
    };
}