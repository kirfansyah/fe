import { useRouter } from 'next/router';
import { useEffect, useContext } from 'react';
import Admin from "layouts/Admin.js";
import PreTestForm from "../../../components/Course/Content/index";
import { useCourses } from "../../../hooks/useCourses";
import { ProfileContext } from "../../../contexts/profile/ProfileContext";
import { useMenuPermissions } from '@/hooks/useMenuPermissions';
import Swal from 'sweetalert2'; // ✅ Import SweetAlert2
import { getDeviceInfo } from '@/lib/deviceHelper';
export default function PreTestPage() {
    const router = useRouter();
    const { courseId, contentTypeId } = router.query;
    const permissions = useMenuPermissions();
    const deviceInfo = getDeviceInfo();
    // ✅ Course ID validation dengan SweetAlert2
    useEffect(() => {
        if (router.isReady && !courseId) {
            Swal.fire({
                icon: 'error',
                title: 'Missing Information',
                text: 'Course ID is required',
                confirmButtonColor: '#1e3a8a',
                allowOutsideClick: false
            }).then(() => {
                router.push('/course/management');
            });
        }
    }, [router.isReady, courseId, router]);

    // ✅ Permission check dengan SweetAlert2
    useEffect(() => {
        if (router.isReady && courseId && !permissions.can_create) {
            Swal.fire({
                icon: 'warning',
                title: 'Access Denied',
                text: 'You do not have permission to create content',
                confirmButtonColor: '#1e3a8a',
                allowOutsideClick: false
            }).then(() => {
                router.push('/course/management');
            });
        }
    }, [router.isReady, permissions.can_create, courseId, router]);

    const handleBack = () => {
        router.push('/course/management');
    };

    const { handleSavePreTest } = useCourses();
    const { dataKaryawan } = useContext(ProfileContext);
    
    // ✅ Save handler dengan SweetAlert2
    const handleSave = async (pretestData) => {
        if (!permissions.can_create) {
            await Swal.fire({
                icon: 'error',
                title: 'Permission Denied',
                text: 'You do not have permission to create content',
                confirmButtonColor: '#1e3a8a'
            });
            return;
        }

        try {
            // ✅ Show loading
            Swal.fire({
                title: 'Saving...',
                text: 'Please wait while we save your pre-test',
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const response = await handleSavePreTest(pretestData);
            
            // ✅ Success notification
            await Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Saved!',
                text: 'Pre-test saved successfully!',
                confirmButtonColor: '#1e3a8a',
                timer: 2000,
                showConfirmButton: false
            });

            router.push('/course/management'); 
            
        } catch (error) {
            // ✅ Error notification
            await Swal.fire({
                icon: 'error',
                title: 'Save Failed',
                text: error.message || 'Failed to save pre-test. Please try again.',
                confirmButtonColor: '#1e3a8a'
            });
        }
    };

    // ✅ Loading state
    if (!courseId) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    // ✅ Permission check (backup UI - tetap ada untuk fallback)
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
        <PreTestForm 
            courseId={courseId}
            contentTypeId={contentTypeId}
            onBack={handleBack}
            onSave={handleSave}
            createdBy={dataKaryawan.nama}
            deviceInfo={deviceInfo}
            permissions={permissions}
        />
    );
}

PreTestPage.layout = Admin;