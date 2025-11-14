import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import 'react-quill/dist/quill.snow.css';

import { NavigationBar } from './NavigationBar';
import { TestConfigSection } from './TestConfigSection';
import { QuestionEditor } from './QuestionEditor';
import { useQuillConfig } from './hooks/useQuillConfig';
import { useQuestionManager } from './hooks/useQuestionManager';
import { PreviewModal } from './PreviewModal';
import { useSweetAlert } from '../../../hooks/useSweetAlert';
export default function PreTestForm({ 
    courseId, 
    onBack, 
    onSave,
    createdBy = "System",
    contentData = null,
    isEditMode = false
}) {
    const [testConfig, setTestConfig] = useState({
        randomType: '',
        totalNumber: '',
        totalPoints: '',
        pointDistribution: '',
        timeDuration: ''
    });
    const { showLoading, showSuccess, showError, showWarning, confirmAction } = useSweetAlert();
    const [autoCalculatedPoints, setAutoCalculatedPoints] = useState(0);
    const [pointsRemaining, setPointsRemaining] = useState(0);
    const [showPreviewModal, setShowPreviewModal] = useState(false); 
    const { quillModules, quillFormats } = useQuillConfig();
    
    const {
        savedQuestions,
        currentQuestionIndex,
        currentQuestionNumber,
        totalPointsUsed,
        editorKey,
        formData,
        setFormData,
        handleQuestionChange,
        handleOptionChange,
        handleInputChange,
        handlePreviousQuestion,
        handleNextQuestion,
        handleUpdateCurrentQuestion,
        handleSaveAndNext
    } = useQuestionManager(isEditMode, contentData, testConfig);

    // Load test config saat edit
    useEffect(() => {
        if (isEditMode && contentData) {
            setTestConfig({
                randomType: contentData.random_type || '',
                totalNumber: contentData.total_number?.toString() || '',
                totalPoints: contentData.total_points?.toString() || '',
                pointDistribution: contentData.point_distribution_type === 'equal' ? 'Equal Distribution' : 
                                  contentData.point_distribution_type === 'customize' ? 'Custom Distribution' : 'Weighted',
                timeDuration: contentData.time_duration || ''
            });
        }
    }, [isEditMode, contentData]);

    useEffect(() => {
        if (testConfig.pointDistribution === 'Equal Distribution' && !isEditMode) {
            const total = parseInt(testConfig.totalPoints) || 0;
            const number = parseInt(testConfig.totalNumber) || 1;
            
            if (total > 0 && number > 0) {
                const pointsPerQuestion = Math.floor(total / number);
                
                console.log('🔢 Auto-calculating points:', pointsPerQuestion);
                
                setAutoCalculatedPoints(pointsPerQuestion);
                
                // ✅ Guard: only update if different
                setFormData(prev => {
                    if (prev.correctAnswerPoints === pointsPerQuestion.toString()) {
                        console.log('⏭️ Points already set, skipping update');
                        return prev; // ✅ Prevent unnecessary update
                    }
                    
                    console.log('📝 Setting points to:', pointsPerQuestion);
                    return {
                        ...prev,
                        correctAnswerPoints: pointsPerQuestion.toString()
                    };
                });
            }
        } else if (testConfig.pointDistribution !== 'Equal Distribution' && !isEditMode) {
            setAutoCalculatedPoints(0);
        }
    }, [testConfig.pointDistribution, testConfig.totalPoints, testConfig.totalNumber,currentQuestionNumber, isEditMode]);



    // Calculate remaining points
    useEffect(() => {
        const total = parseInt(testConfig.totalPoints) || 0;
        const remaining = total - totalPointsUsed;
        setPointsRemaining(remaining >= 0 ? remaining : 0);
    }, [testConfig.totalPoints, totalPointsUsed]);

    const handleTestConfigChange = (field, value) => {
        setTestConfig(prev => ({ ...prev, [field]: value }));
    };

    const handleCancel = async () => {
        const result = await confirmAction({
            title: 'Are you sure you want to cancel?',
            text: 'All unsaved changes will be lost.',
            confirmButtonText: 'Yes, cancel'
        });
        if (result.isConfirmed) {
            if (onBack) {
                onBack();
            }   
        }

        
    };

    const handlePreview = () => {
        if (savedQuestions.length === 0 && !formData.question.trim()) {
            showWarning('No questions to preview!');
            return;
        }
        setShowPreviewModal(true);
    };

   
    const handleSubmitTest = (questionsToSubmit) => {  
        const questionsToSave = questionsToSubmit || savedQuestions;
        
        if (questionsToSave.length === 0) {
            showWarning('No questions to save!');
            return;
        }

        const finalTest = {
            id_course: courseId,
            id_content_type: 3,
            random_type: testConfig.randomType,
            content_title: isEditMode ? contentData?.content_title : "Pre Test",
            total_points: parseInt(testConfig.totalPoints) || 0,
            total_number: parseInt(testConfig.totalNumber) || 0,
            point_distribution_type: testConfig.pointDistribution === 'Equal Distribution' ? 'equal' : 
                                        testConfig.pointDistribution === 'Custom Distribution' ? 'customize' : 
                                        'weighted',
            time_duration: testConfig.timeDuration || '00:00:00',
            ...(isEditMode ? {
                updated_by: createdBy,
                updated_device: "system"
            } : {
                created_by: createdBy,
                created_device: "system"
            }),
            questions: questionsToSave.map((q, index) => ({  // ✅ Pakai questionsToSave
                question_no: index + 1,
                question_text: q.question,
                correct_answer_points: parseInt(q.points) || 0,
                created_by: createdBy,
                created_device: "system",
                options: q.options.map((opt, optIndex) => {
                    const label = String.fromCharCode(65 + optIndex); 
                    return {
                        option_label: label,
                        option_text: opt,
                        is_correct: q.answerKey.toUpperCase() === label
                    };
                }).filter(opt => opt.option_text && opt.option_text.trim() !== '')
            }))
        };

        if (isEditMode && contentData?.id_course_content) {
            finalTest.id_course_content = contentData.id_course_content;
        }

        try {
            showLoading('Saving Test...');  
            // Simulate API call
            setTimeout(async () => {
                showSuccess('Test saved successfully!');    
                if (onSave) {
                    onSave(finalTest);
                }
            }, 1500);
        } catch (error) {
            showError('Failed to save test: ' + error.message);
        }
    };

    const handleSaveAndNextWithSubmit = () => {
        handleSaveAndNext(handleSubmitTest);
    };

    const isFormValid = () => {
        const filledOptions = formData.options.filter(opt => opt.trim() !== '');
        
        const isValid = formData.question.trim() !== '' && 
                        filledOptions.length >= 2 && 
                        formData.answerKey !== '' && 
                        formData.correctAnswerPoints !== '';

        
        return isValid;
    };

    const formTitle = isEditMode ? 'Edit Content' : 'Add New Content';

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

            {/* Navigation Bar (Edit Mode) */}
            <NavigationBar
                currentQuestionIndex={currentQuestionIndex}
                totalQuestions={savedQuestions.length}
                onPrevious={handlePreviousQuestion}
                onNext={handleNextQuestion}
                onUpdate={handleUpdateCurrentQuestion}
                isEditMode={isEditMode}
            />

            {/* Main Form */}
            <div className="min-h-screen bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">{formTitle}</h2>
                    <p className="text-sm text-gray-600">Course ID: {courseId}</p>
                </div>
        
                {/* Test Configuration */}
                <TestConfigSection
                    testConfig={testConfig}
                    onChange={handleTestConfigChange}
                    disabled={savedQuestions.length > 0}
                />

                {/* Question Editor */}
                <QuestionEditor
                    formData={formData}
                    currentQuestionNumber={currentQuestionNumber}
                    editorKey={editorKey}
                    quillModules={quillModules}
                    quillFormats={quillFormats}
                    isEditMode={isEditMode}
                    autoCalculatedPoints={autoCalculatedPoints}
                    pointDistribution={testConfig.pointDistribution}
                    onQuestionChange={handleQuestionChange}
                    onOptionChange={handleOptionChange}
                    onAnswerKeyChange={(val) => handleInputChange('answerKey', val)}
                    onPointsChange={(val) => handleInputChange('correctAnswerPoints', val)}
                />

                {/* Points Remaining */}
                <div className="mt-6 text-gray-700 font-medium">
                    Points Remaining: <span className="font-bold text-xl text-blue-600">{pointsRemaining}</span>
                </div>

                {/* Action Buttons */}
                <div className="mt-12 flex gap-6">
                    {!isEditMode && (
                        <button 
                        onClick={handleSaveAndNextWithSubmit}
                        disabled={!isFormValid()}
                         className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                            Save & Next
                        </button>
                    )}
                    {isEditMode && (
                        <button onClick={() => handleSubmitTest()} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                            Save All Changes
                        </button>
                    )}
                    <button 
                        onClick={handlePreview} 
                        className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Preview ({savedQuestions.length})
                    </button>
                    <button onClick={handleCancel} className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                        Cancel
                    </button>
                </div>
            </div>
            {/* Preview Modal */}
            <PreviewModal
                isOpen={showPreviewModal}
                onClose={() => setShowPreviewModal(false)}
                testConfig={testConfig}
                savedQuestions={savedQuestions}
                currentQuestion={formData}
                currentQuestionNumber={currentQuestionNumber}
            />
        </div>
    );
}