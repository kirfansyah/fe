import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import 'react-quill/dist/quill.snow.css';

import { NavigationBar } from './NavigationBar';
import { TestConfigSection } from './TestConfigSection';
import { QuestionEditor } from './QuestionEditor';
import { useQuillConfig } from './hooks/useQuillConfig';
import { useQuestionManager } from './hooks/useQuestionManager';

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

    const [autoCalculatedPoints, setAutoCalculatedPoints] = useState(0);
    const [pointsRemaining, setPointsRemaining] = useState(0);

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

    // Auto calculate points
    useEffect(() => {
        if (testConfig.pointDistribution === 'Equal Distribution') {
            
            const total = parseInt(testConfig.totalPoints) || 0;
            const number = parseInt(testConfig.totalNumber) || 1;
            const pointsPerQuestion = Math.floor(total / number);
            console.log('🔢 Calculation:', {
            total,
            number,
            pointsPerQuestion
        });
            setAutoCalculatedPoints(pointsPerQuestion);
        }
    }, [testConfig.pointDistribution, testConfig.totalPoints, testConfig.totalNumber]);

    // Calculate remaining points
    useEffect(() => {
        const total = parseInt(testConfig.totalPoints) || 0;
        const remaining = total - totalPointsUsed;
        setPointsRemaining(remaining >= 0 ? remaining : 0);
    }, [testConfig.totalPoints, totalPointsUsed]);

    const handleTestConfigChange = (field, value) => {
        setTestConfig(prev => ({ ...prev, [field]: value }));
    };

    const handleCancel = () => {
        if (confirm('Are you sure you want to cancel?')) {
            onBack?.();
        }
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
                        <button onClick={handleSaveAndNext} className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                            Save & Next
                        </button>
                    )}
                    {isEditMode && (
                        <button onClick={() => onSave?.(savedQuestions)} className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                            Save All Changes
                        </button>
                    )}
                    <button onClick={handleCancel} className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}