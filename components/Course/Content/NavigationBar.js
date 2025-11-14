import React from 'react';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';

export const NavigationBar = ({ 
    currentQuestionIndex, 
    totalQuestions,
    onPrevious,
    onNext,
    onUpdate,
    isEditMode
}) => {
    if (!isEditMode || totalQuestions === 0) return null;

    return (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onPrevious}
                        disabled={currentQuestionIndex === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                    </button>
                    
                    <span className="text-lg font-semibold text-gray-700">
                        Question {currentQuestionIndex + 1} of {totalQuestions}
                    </span>
                    
                    <button
                        onClick={onNext}
                        disabled={currentQuestionIndex === totalQuestions - 1}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Next
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                <button
                    onClick={onUpdate}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Save className="w-4 h-4" />
                    Update Question
                </button>
            </div>
        </div>
    );
};