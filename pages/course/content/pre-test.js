import { useRouter } from 'next/router';
import { useEffect, useContext } from 'react';
import Admin from "layouts/Admin.js";
import PreTestForm from "../../../components/Course/Content/index";
import { useCourses } from "../../../hooks/useCourses";
import { ProfileContext } from "../../../contexts/profile/ProfileContext";

export default function PreTestPage() {
    const router = useRouter();
     const { courseId,contentTypeId } = router.query;

    useEffect(() => {
        if (router.isReady && !courseId) {
            alert('Course ID is required');
            router.push('/course/management');
        }
    }, [router.isReady, courseId, router]);

    const handleBack = () => {
        router.push('/course/management');
    };

    const { handleSavePreTest } = useCourses();

    const { getKaryawan, dataKaryawan } = useContext(ProfileContext);
              
    const dataKaryawans = dataKaryawan?.length ? dataKaryawan[0] : [];
    const handleSave = async (pretestData) => {
        try {
            const response = await handleSavePreTest(pretestData);
            
            alert('Pre Test Save successfully!');
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
            createdBy={dataKaryawans.nama}
        />
    );
}

PreTestPage.layout = Admin;