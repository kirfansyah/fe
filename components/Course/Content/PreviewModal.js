// components/Course/Content/PreTestForm/PreviewModal.js

import React from 'react';

export function PreviewModal({ 
    isOpen, 
    onClose, 
    testConfig, 
    savedQuestions, 
    currentQuestion,
    currentQuestionNumber 
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Preview Mode</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                    >
                        ×
                    </button>
                </div>
                
                <div className="p-6">
                    {/* Test Info */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-semibold text-gray-700 mb-2">Test Information</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><span className="font-medium">Random Type:</span> {testConfig.randomType || '-'}</div>
                            <div><span className="font-medium">Total Questions:</span> {testConfig.totalNumber || '-'}</div>
                            <div><span className="font-medium">Total Points:</span> {testConfig.totalPoints || '-'}</div>
                            <div><span className="font-medium">Duration:</span> {testConfig.timeDuration || '-'}</div>
                        </div>
                    </div>

                    {/* Saved Questions */}
                    {savedQuestions.map((q, idx) => (
                        <div key={idx} className="mb-8 p-6 border border-gray-200 rounded-lg bg-white">
                            <div className="flex items-start mb-4">
                                <span className="text-lg font-semibold text-gray-800 mr-2">{idx + 1}.</span>
                                <div 
                                    className="text-lg text-gray-800 flex-1 prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: q.question }}
                                />
                            </div>
                            
                            <div className="space-y-3 ml-6">
                                {q.options.map((opt, optIdx) => {
                                    if (!opt.trim() && !opt.includes('<')) return null;
                                    const letter = String.fromCharCode(97 + optIdx);
                                    const isCorrect = q.answerKey === letter;
                                    return (
                                        <div key={optIdx} className="flex items-start">
                                            <div className={`w-5 h-5 rounded-full border-2 mr-3 flex-shrink-0 mt-1 ${
                                                isCorrect ? 'border-green-500 bg-green-50' : 'border-gray-300'
                                            }`}>
                                                {isCorrect && (
                                                    <div className="w-full h-full rounded-full bg-green-500 scale-50"></div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <span className="font-medium">{letter}.</span>{' '}
                                                <span 
                                                    className="text-gray-700 prose prose-sm inline"
                                                    dangerouslySetInnerHTML={{ __html: opt }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            <div className="mt-4 ml-6 text-sm text-gray-500">
                                <span className="font-medium">Correct Answer:</span> {q.answerKey.toUpperCase()} | 
                                <span className="font-medium ml-2">Points:</span> {q.points}
                            </div>
                        </div>
                    ))}

                    {/* Current Question (Not Saved) */}
                    {currentQuestion?.question?.trim() && (
                        <div className="mb-8 p-6 border-2 border-blue-300 rounded-lg bg-blue-50">
                            <div className="mb-2 text-sm text-blue-600 font-semibold">Current Question (Not Saved)</div>
                            <div className="flex items-start mb-4">
                                <span className="text-lg font-semibold text-gray-800 mr-2">{currentQuestionNumber}.</span>
                                <div 
                                    className="text-lg text-gray-800 flex-1 prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: currentQuestion.question }}
                                />
                            </div>
                            
                            <div className="space-y-3 ml-6">
                                {currentQuestion.options.map((opt, optIdx) => {
                                    if (!opt.trim() && !opt.includes('<')) return null;
                                    const letter = String.fromCharCode(97 + optIdx);
                                    const isCorrect = currentQuestion.answerKey === letter;
                                    return (
                                        <div key={optIdx} className="flex items-start">
                                            <div className={`w-5 h-5 rounded-full border-2 mr-3 flex-shrink-0 mt-1 ${
                                                isCorrect ? 'border-green-500 bg-green-50' : 'border-gray-300'
                                            }`}>
                                                {isCorrect && (
                                                    <div className="w-full h-full rounded-full bg-green-500 scale-50"></div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <span className="font-medium">{letter}.</span>{' '}
                                                <span 
                                                    className="text-gray-700 prose prose-sm inline"
                                                    dangerouslySetInnerHTML={{ __html: opt }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            {currentQuestion.answerKey && (
                                <div className="mt-4 ml-6 text-sm text-gray-500">
                                    <span className="font-medium">Correct Answer:</span> {currentQuestion.answerKey.toUpperCase()} | 
                                    <span className="font-medium ml-2">Points:</span> {currentQuestion.correctAnswerPoints || 0}
                                </div>
                            )}
                        </div>
                    )}

                    {savedQuestions.length === 0 && !currentQuestion?.question?.trim() && (
                        <div className="text-center py-8 text-gray-500">
                            No questions available to preview
                        </div>
                    )}
                </div>

                <div className="sticky bottom-0 bg-white border-t px-6 py-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Close Preview
                    </button>
                </div>
            </div>
        </div>
    );
}