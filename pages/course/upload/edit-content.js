import { useRouter } from 'next/router';
import { useEffect, useContext, useState } from 'react';
import Admin from "layouts/Admin.js";
import PreTestForm from "../../../components/Course/Upload/FileUploadForm";
import { useCourses } from "../../../hooks/useCourses";
import { ProfileContext } from "../../../contexts/profile/ProfileContext";

export default function EditContentPage() {
    const router = useRouter();
    const { courseId,contentTypeId,contentId } = router.query;
    const [toasts, setToasts] = useState([]);
    useEffect(() => {
        if (router.isReady && !courseId) {
            alert('Course ID is required');
            router.push('/course/management');
        }
    }, [router.isReady, courseId, router]);

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
    const { contentData,handleSavePreTest } = useCourses(contentId);

    const { getKaryawan, dataKaryawan } = useContext(ProfileContext);
              
    const dataKaryawans = dataKaryawan?.length ? dataKaryawan[0] : [];
    const handleSave = async (pretestData) => {
        try {
            const response = await handleSavePreTest(pretestData);
            router.push('/course/management');   
        } catch (error) {
            alert('Failed to save: ' + error.message);
        }
    };
    useEffect(() => {
        getKaryawan();
    }, []);

    if (!courseId) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    return (
        <PreTestForm 
            courseId={courseId}
            contentTypeId={contentTypeId}
            onBack={handleBack}
            onSave={handleSave}
            addToast={addToast}
            createdBy={dataKaryawans.nama}
            contentData={contentData}
            isEditMode={true}
        />
    );
}

EditContentPage.layout = Admin;