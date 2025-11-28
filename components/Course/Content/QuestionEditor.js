import React from 'react';
import dynamic from "next/dynamic";
import { CustomSelect } from './CustomSelect';
import { ANSWER_KEYS, POINTS } from './constants';
import { AlertCircle } from 'lucide-react';

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export const QuestionEditor = ({ 
    formData,
    currentQuestionNumber,
    editorKey,
    quillModules,
    quillFormats,
    autoCalculatedPoints,
    pointDistribution,
    isEditMode = false,
    onQuestionChange,
    onOptionChange,
    onAnswerKeyChange,
    onPointsChange
}) => {
    const getPointsOptions = () => {
        if (pointDistribution === 'Equal Distribution') {
            if (!autoCalculatedPoints) {
                return [];
            }
            
            if (isEditMode && formData.correctAnswerPoints && 
                formData.correctAnswerPoints !== autoCalculatedPoints.toString()) {
                const currentValue = formData.correctAnswerPoints;
                const autoValue = autoCalculatedPoints.toString();
                const uniqueValues = [...new Set([currentValue, autoValue])].sort((a, b) => b - a);
                return uniqueValues;
            }
            
            return [autoCalculatedPoints.toString()];
        }
        
        return POINTS.map(p => p.toString());
    };

    const isPointsDisabled = () => {
        if (!isEditMode && pointDistribution === 'Equal Distribution') {
            return true;
        }
        if (isEditMode) {
            return false;
        }
        return false;
    };

    const pointsOptions = getPointsOptions();

    return (
        <div className="space-y-6">
            {/* Question */}
            <div>
                <label className="text-sm font-bold text-gray-700 mb-3 block flex items-center gap-2">
                    <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                        Q
                    </span>
                    Question Text
                </label>
                <div className="border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-blue-500 transition-colors">
                    <ReactQuill
                        value={formData.question || ''}
                        key={`question-${editorKey}`}
                        theme="snow"
                        modules={quillModules}
                        formats={quillFormats}
                        placeholder="Enter your question here... You can use rich text formatting."
                        style={{ minHeight: '120px' }}
                        onChange={onQuestionChange}
                    />
                </div>
            </div>

            {/* Options */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">
                        A
                    </span>
                    <span className="text-sm font-bold text-gray-700">Answer Options</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.options.map((option, index) => (
                        <div key={index}>
                            <label className="text-xs font-semibold text-gray-600 mb-2 block">
                                Option {String.fromCharCode(65 + index)}
                            </label>
                            <div className="border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-blue-500 transition-colors">
                                <ReactQuill
                                    key={`option-${index}-${editorKey}`}
                                    theme="snow"
                                    modules={quillModules}
                                    formats={quillFormats}
                                    placeholder={`Enter option ${String.fromCharCode(65 + index)}...`}
                                    style={{ minHeight: '80px' }}
                                    value={option || ''}
                                    onChange={(content) => onOptionChange(index, content)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Answer Key & Points */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-blue-50 border-2 border-blue-200 rounded-xl">
                <CustomSelect
                    label="Correct Answer Key"
                    value={formData.answerKey}
                    options={ANSWER_KEYS}
                    placeholder="Select correct answer"
                    onChange={(val) => onAnswerKeyChange(val)}
                    tooltip="Select which option (A, B, C, or D) is the correct answer"
                />
                
                <div>
                    <CustomSelect
                        label="Points for Correct Answer"
                        value={formData.correctAnswerPoints}
                        options={pointsOptions}
                        placeholder={
                            pointDistribution === 'Equal Distribution' 
                                ? (autoCalculatedPoints 
                                    ? `Auto: ${autoCalculatedPoints}` 
                                    : 'Configure total points first')
                                : 'Select points'
                        }
                        onChange={(val) => onPointsChange(val)}
                        disabled={isPointsDisabled()}
                        tooltip={
                            pointDistribution === 'Equal Distribution'
                                ? 'Points are automatically distributed equally'
                                : 'Manually set points for this question'
                        }
                    />
                    
                    {/* Helper Messages */}
                    {isEditMode && pointDistribution === 'Equal Distribution' && (
                        <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Edit mode: You can adjust points manually if needed
                        </p>
                    )}
                    
                    {pointDistribution === 'Equal Distribution' && 
                     formData.correctAnswerPoints && 
                     formData.correctAnswerPoints !== autoCalculatedPoints.toString() && (
                        <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Points differ from auto-calculated ({autoCalculatedPoints})
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};