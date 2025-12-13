import React, { useState, useEffect } from 'react';
import { ChevronRight, AlertCircle, CheckCircle, Info } from 'lucide-react';
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
    contentTypeId,
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
                setAutoCalculatedPoints(pointsPerQuestion);
                
                setFormData(prev => {
                    if (prev.correctAnswerPoints === pointsPerQuestion.toString()) {
                        return prev;
                    }
                    
                    return {
                        ...prev,
                        correctAnswerPoints: pointsPerQuestion.toString()
                    };
                });
            }
        } else if (testConfig.pointDistribution !== 'Equal Distribution' && !isEditMode) {
            setAutoCalculatedPoints(0);
        }
    }, [testConfig.pointDistribution, testConfig.totalPoints, testConfig.totalNumber, currentQuestionNumber, isEditMode]);

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
            id_content_type: contentTypeId,
            random_type: testConfig.randomType,
            content_title: contentTypeId === 7 ? "Post Test" : "Pre Test",
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
            questions: questionsToSave.map((q, index) => ({
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
        return formData.question.trim() !== '' && 
               filledOptions.length >= 2 && 
               formData.answerKey !== '' && 
               formData.correctAnswerPoints !== '';
    };

    // Calculate progress
    const totalQuestions = parseInt(testConfig.totalNumber) || 0;
    const progress = totalQuestions > 0 ? (savedQuestions.length / totalQuestions) * 100 : 0;
    const isConfigComplete = testConfig.randomType && testConfig.totalNumber && testConfig.totalPoints && testConfig.pointDistribution && testConfig.timeDuration;

    const formTitle = isEditMode ? 'Edit Content' : 'Add New Content';

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* ✅ Enhanced Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{formTitle}</h1>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <span>Course Management</span>
                            <ChevronRight className="w-4 h-4" />
                            <span className="text-blue-600 font-medium">Pre-Test Configuration</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-600">Course ID</p>
                        <p className="text-lg font-bold text-gray-900">{courseId}</p>
                    </div>
                </div>

                {/* ✅ Progress Bar */}
                {totalQuestions > 0 && (
                    <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-700">
                                Question Progress
                            </span>
                            <span className="text-sm font-bold text-blue-600">
                                {savedQuestions.length} / {totalQuestions} Questions
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div 
                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}
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

            {/* ✅ Main Form - Enhanced */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Section: Test Configuration */}
                <div className={`p-6 border-b border-gray-200 ${savedQuestions.length > 0 ? 'bg-gray-50' : 'bg-white'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                isConfigComplete ? 'bg-green-100' : 'bg-blue-100'
                            }`}>
                                {isConfigComplete ? (
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                ) : (
                                    <Info className="w-6 h-6 text-blue-600" />
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Test Configuration</h3>
                                <p className="text-sm text-gray-600">
                                    {savedQuestions.length > 0 
                                        ? 'Configuration locked after first question'
                                        : 'Configure your test settings before adding questions'}
                                </p>
                            </div>
                        </div>
                        {isConfigComplete && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" />
                                Complete
                            </span>
                        )}
                    </div>

                    <TestConfigSection
                        testConfig={testConfig}
                        onChange={handleTestConfigChange}
                        disabled={savedQuestions.length > 0}
                    />

                    {/* ✅ Config Incomplete Warning */}
                    {!isConfigComplete && savedQuestions.length === 0 && (
                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-yellow-900">
                                    Complete Configuration Required
                                </p>
                                <p className="text-xs text-yellow-700 mt-1">
                                    Please fill all configuration fields before adding questions
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ✅ Config Locked Info */}
                    {savedQuestions.length > 0 && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-blue-900">
                                    Configuration Locked
                                </p>
                                <p className="text-xs text-blue-700 mt-1">
                                    Test configuration cannot be changed after adding questions
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Section: Question Editor */}
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <span className="text-lg font-bold text-purple-600">
                                    {currentQuestionNumber}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Question Editor</h3>
                                <p className="text-sm text-gray-600">
                                    Create question #{currentQuestionNumber}
                                    {totalQuestions > 0 && ` of ${totalQuestions}`}
                                </p>
                            </div>
                        </div>

                        {/* ✅ Points Display - More Prominent */}
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-xs text-gray-600 font-medium">Points Used</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {totalPointsUsed}
                                </p>
                            </div>
                            <div className="w-px h-10 bg-gray-300"></div>
                            <div className="text-right">
                                <p className="text-xs text-gray-600 font-medium">Points Remaining</p>
                                <p className={`text-xl font-bold ${
                                    pointsRemaining > 0 ? 'text-blue-600' : 
                                    pointsRemaining === 0 ? 'text-orange-600' : 
                                    'text-red-600'
                                }`}>
                                    {pointsRemaining}
                                </p>
                            </div>
                        </div>
                    </div>

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
                </div>

                {/* ✅ Enhanced Action Buttons */}
                <div className="p-6 bg-gray-50 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <button 
                            onClick={handleCancel} 
                            className="px-5 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>

                        <div className="flex items-center gap-3">
                            <button 
                                onClick={handlePreview} 
                                className="px-5 py-2.5 bg-white border-2 border-green-500 text-green-700 rounded-xl font-semibold hover:bg-green-50 transition-all flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Preview ({savedQuestions.length})
                            </button>

                            {!isEditMode && (
                                <button 
                                    onClick={handleSaveAndNextWithSubmit}
                                    disabled={!isFormValid()}
                                    className={`px-6 py-2.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2 ${
                                        isFormValid()
                                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                    Save & Next Question
                                </button>
                            )}

                            {isEditMode && (
                                <button 
                                    onClick={() => handleSubmitTest()} 
                                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    Save All Changes
                                </button>
                            )}
                        </div>
                    </div>
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