import { useRouter } from 'next/router';
import { useEffect, useContext } from 'react';
import Admin from "layouts/Admin.js";
import PreTestForm from "../../../components/Course/Content/index";
import { useCourses } from "../../../hooks/useCourses";
import { ProfileContext } from "../../../contexts/profile/ProfileContext";
import { useMenuPermissions } from '@/hooks/useMenuPermissions'; // ✅ Import

export default function PreTestEdit() {
    const router = useRouter();
    const { courseId, contentTypeId, contentId } = router.query;
    
    // ✅ Get permissions
    const permissions = useMenuPermissions();

    useEffect(() => {
        if (router.isReady && !courseId) {
            alert('Course ID is required');
            router.push('/course/management');
        }
    }, [router.isReady, courseId, router]);

    // ✅ Check permission on mount - Need at least view OR edit
    useEffect(() => {
        if (router.isReady && !permissions.can_view && !permissions.can_edit) {
            alert('You do not have permission to access this content');
            router.push('/course/management');
        }
    }, [router.isReady, permissions.can_view, permissions.can_edit, router]);

    const handleBack = () => {
        router.push('/course/management');
    };

    const { contentData, handleSavePreTest } = useCourses(contentId);
    const { getKaryawan, dataKaryawan } = useContext(ProfileContext);

    const handleSave = async (pretestData) => {
        // ✅ Check permission before save
        if (!permissions.can_edit) {
            alert('You do not have permission to edit content');
            return;
        }

        try {
            const response = await handleSavePreTest(pretestData);
            
            alert('Pre Test updated successfully!');
            router.push('/course/management'); 
            
        } catch (error) {
            alert('Failed to save: ' + error.message);
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
    if (!permissions.can_view && !permissions.can_edit) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="max-w-md text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600 mb-6">You do not have permission to access this content.</p>
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
        <PreTestForm 
            courseId={courseId}
            contentTypeId={contentTypeId}
            onBack={handleBack}
            onSave={handleSave}
            createdBy={dataKaryawan.nama}
            contentData={contentData}
            isEditMode={true}
            permissions={permissions} // ✅ Pass permissions to child
        />
    );
}

PreTestEdit.layout = Admin;