import React from 'react';
import dynamic from "next/dynamic";
import { CustomSelect } from './CustomSelect';
import { ANSWER_KEYS, POINTS } from './constants';

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export const QuestionEditor = ({ 
    formData,
    currentQuestionNumber,
    editorKey,
    quillModules,
    quillFormats,
    autoCalculatedPoints,
    pointDistribution,
    pointsRemaining,
    isEditMode = false, // ✅ Tambahkan prop ini
    onQuestionChange,
    onOptionChange,
    onAnswerKeyChange,
    onPointsChange
}) => {
    // ✅ Generate points options yang smart untuk Equal Distribution
    const getPointsOptions = () => {
        if (pointDistribution === 'Equal Distribution') {
            if (!autoCalculatedPoints) {
                return [];
            }
            
            // ✅ Di edit mode, include both auto-calculated DAN current value
            if (isEditMode && formData.correctAnswerPoints && 
                formData.correctAnswerPoints !== autoCalculatedPoints.toString()) {
                // Include both: current value dan auto-calculated value
                const currentValue = formData.correctAnswerPoints;
                const autoValue = autoCalculatedPoints.toString();
                
                // Remove duplicates dan sort
                const uniqueValues = [...new Set([currentValue, autoValue])].sort((a, b) => b - a);
                return uniqueValues;
            }
            
            // Default: hanya auto-calculated
            return [autoCalculatedPoints.toString()];
        }
        
        // Custom/Weighted: semua points available
        return POINTS.map(p => p.toString());
    };

    // ✅ Determine if points select should be disabled
    const isPointsDisabled = () => {
        // Di add mode dengan Equal Distribution → disabled (auto)
        if (!isEditMode && pointDistribution === 'Equal Distribution') {
            return true;
        }
        
        // Di edit mode → always editable
        if (isEditMode) {
            return false;
        }
        
        // Custom/Weighted → editable
        return false;
    };

    const pointsOptions = getPointsOptions();

    return (
        <>
            {/* Question */}
            <div className="mt-6 grid grid-cols-1 gap-2">
                <label className="text-gray-700 font-medium mb-2 block">
                    Question [{currentQuestionNumber}]
                </label>
                <ReactQuill
                    value={formData.question || ''}
                    key={`question-${editorKey}`}
                    theme="snow"
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder="Start writing your question here..."
                    style={{ height: '70px' }}
                    onChange={onQuestionChange}
                />
            </div>

            {/* Options */}
            {formData.options.map((option, index) => (
                <div key={index} className="mt-12">
                    <label className="text-gray-700 font-medium mb-2 block">
                        Option [{String.fromCharCode(97 + index)}]
                    </label>
                    <ReactQuill
                        key={`option-${index}-${editorKey}`}
                        theme="snow"
                        modules={quillModules}
                        formats={quillFormats}
                        placeholder="Start writing your option here..."
                        style={{ height: '70px' }}
                        value={option || ''}
                        onChange={(content) => onOptionChange(index, content)}
                    />
                </div>
            ))}

            {/* Answer Key & Points */}
            <div className="mt-12 flex items-center gap-6">
                <CustomSelect
                    label="Answer Key"
                    value={formData.answerKey}
                    options={ANSWER_KEYS}
                    placeholder="Select answer key"
                    onChange={(val) => {
                        onAnswerKeyChange(val);
                    }}
                />
                
                <div className="flex-1">
                    <CustomSelect
                        label="Correct Answer Points"
                        value={formData.correctAnswerPoints}
                        options={pointsOptions}
                        placeholder={
                            pointDistribution === 'Equal Distribution' 
                                ? (autoCalculatedPoints 
                                    ? `Auto: ${autoCalculatedPoints}` 
                                    : 'Select total points first')
                                : 'Select points'
                        }
                        onChange={(val) => {
                            onPointsChange(val);
                        }}
                        disabled={isPointsDisabled()}
                    />
                    
                    {/* ✅ Helper text untuk Equal Distribution di edit mode */}
                    {isEditMode && pointDistribution === 'Equal Distribution' && (
                        <p className="text-xs text-gray-500 mt-1">
                            💡 In edit mode, you can manually adjust points if needed
                        </p>
                    )}
                    
                    {/* ✅ Warning jika points berbeda dari auto-calculated */}
                    {pointDistribution === 'Equal Distribution' && 
                     formData.correctAnswerPoints && 
                     formData.correctAnswerPoints !== autoCalculatedPoints.toString() && (
                        <p className="text-xs text-orange-600 mt-1">
                            ⚠️ Points differ from auto-calculated ({autoCalculatedPoints})
                        </p>
                    )}
                </div>

                {/* ✅ Points Remaining Display (conditional render) */}
                {pointsRemaining !== undefined && (
                    <div className="text-gray-700 font-medium">
                        Remaining: <span className={`font-bold text-xl ${
                            pointsRemaining > 0 ? 'text-blue-600' : 
                            pointsRemaining === 0 ? 'text-orange-600' : 
                            'text-red-600'
                        }`}>{pointsRemaining}</span>
                    </div>
                )}
            </div>
        </>
    );
};