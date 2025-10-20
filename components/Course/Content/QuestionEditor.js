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
    pointsRemaining, // ✅ Tambahkan ini
    onQuestionChange,
    onOptionChange,
    onAnswerKeyChange,
    onPointsChange
}) => {
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
                    onChange={onQuestionChange}  // ✅ HAPUS kondisi if, langsung panggil
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
                        onChange={(content) => onOptionChange(index, content)}  // ✅ HAPUS kondisi if
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
                    onChange={onAnswerKeyChange}
                />
                <CustomSelect
                    label="Correct Answer Points"
                    value={formData.correctAnswerPoints}
                    options={pointDistribution === 'Equal Distribution' ? 
                        (autoCalculatedPoints ? [autoCalculatedPoints.toString()] : [])
                        : POINTS.map(p => p.toString())}
                    placeholder={pointDistribution === 'Equal Distribution' ? 
                        (autoCalculatedPoints ? `Auto: ${autoCalculatedPoints}` : 'Select total points first')
                        : 'Select points'}
                    onChange={onPointsChange}
                    disabled={pointDistribution === 'Equal Distribution'}
                />
                <div className="text-gray-700 font-medium">
                    Points Remaining: <span className="font-bold text-xl text-blue-600">{pointsRemaining}</span>
                </div>
            </div>
        </>
    );
};