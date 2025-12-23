import { useRouter } from 'next/router';
import { useEffect, useContext, useState } from 'react';
import Admin from "layouts/Admin.js";
import PreTestForm from "../../../components/Course/Upload/FileUploadForm";
import { useCourses } from "../../../hooks/useCourses";
import { ProfileContext } from "../../../contexts/profile/ProfileContext";
import { useMenuPermissions } from '@/hooks/useMenuPermissions'; // ✅ Import

export default function CreateContentPage() {
    const router = useRouter();
    const { courseId, contentTypeId } = router.query;
    const [toasts, setToasts] = useState([]);
    
    // ✅ Get permissions
    const permissions = useMenuPermissions();

    useEffect(() => {
        if (router.isReady && !courseId) {
            alert('Course ID is required');
            router.push('/course/management');
        }
    }, [router.isReady, courseId, router]);

    // ✅ Check permission on mount - Need can_create
    useEffect(() => {
        if (router.isReady && !permissions.can_create) {
            alert('You do not have permission to create content');
            router.push('/course/management');
        }
    }, [router.isReady, permissions.can_create, router]);

    const handleBack = () => {
        router.push('/course/management');
    };

    const addToast = (message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    const { handleSavePreTest } = useCourses();
    const { getKaryawan, dataKaryawan } = useContext(ProfileContext);

    const handleSave = async (pretestData) => {
        // ✅ Check permission before save
        if (!permissions.can_create) {
            addToast('You do not have permission to create content', 'error');
            return;
        }

        try {
            const response = await handleSavePreTest(pretestData);
            addToast('Content created successfully!', 'success');
            setTimeout(() => {
                router.push('/course/management');
            }, 1000);
        } catch (error) {
            addToast('Failed to save: ' + error.message, 'error');
        }
    };

    useEffect(() => {
        getKaryawan();
    }, []);

    // ✅ Loading state
    if (!courseId) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    // ✅ Permission check - Backup UI
    if (!permissions.can_create) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="max-w-md text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600 mb-6">You do not have permission to create content.</p>
                    <button
                        onClick={() => router.push('/course/management')}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Back to Course Management
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* ✅ Toast Container */}
            <div className="fixed top-4 right-4 z-50 space-y-2">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`px-6 py-3 rounded-lg shadow-lg text-white font-medium animate-slide-in ${
                            toast.type === 'success' ? 'bg-green-600' :
                            toast.type === 'error' ? 'bg-red-600' :
                            'bg-blue-600'
                        }`}
                    >
                        {toast.message}
                    </div>
                ))}
            </div>

            <PreTestForm 
                courseId={courseId}
                contentTypeId={contentTypeId}
                onBack={handleBack}
                onSave={handleSave}
                addToast={addToast}
                createdBy={dataKaryawan.nama}
                permissions={permissions} // ✅ Pass permissions to child
            />
        </>
    );
}

CreateContentPage.layout = Admin;