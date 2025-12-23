import { useState, useEffect, useCallback, useRef } from 'react';
import Swal from 'sweetalert2';

export const useQuestionManager = (isEditMode, contentData, testConfig) => {
    const [savedQuestions, setSavedQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
    const [totalPointsUsed, setTotalPointsUsed] = useState(0);
    const [editorKey, setEditorKey] = useState(0);
    
    const [formData, setFormData] = useState({
        question: '',
        options: ['', '', '', ''],
        answerKey: '',
        correctAnswerPoints: ''
    });

    const savedQuestionsRef = useRef([]);
    
    useEffect(() => {
        savedQuestionsRef.current = savedQuestions;
    }, [savedQuestions]);

    // Load questions saat edit mode
    useEffect(() => {
        if (isEditMode && contentData?.questions?.length > 0) {
            const loadedQuestions = contentData.questions.map(q => ({
                questionNumber: q.question_no,
                question: q.question_text,
                options: q.options.map(opt => opt.option_text),
                answerKey: q.options.find(opt => opt.is_correct)?.option_label.toLowerCase() || '',
                points: q.correct_answer_points?.toString() || '',
                timestamp: new Date().toISOString()
            }));
            
            setSavedQuestions(loadedQuestions);
            
            if (loadedQuestions.length > 0) {
                loadQuestionToForm(loadedQuestions[0]);
            }
            
            const pointsUsed = loadedQuestions.reduce((sum, q) => sum + parseInt(q.points || 0), 0);
            setTotalPointsUsed(pointsUsed);
        }
    }, [isEditMode, contentData]);

    const loadQuestionToForm = useCallback((question) => {
        setFormData({
            question: question.question,
            options: [...question.options],
            answerKey: question.answerKey,
            correctAnswerPoints: question.points
        });
        setCurrentQuestionNumber(question.questionNumber);
        setEditorKey(prev => prev + 1);
    }, []);

    const handleQuestionChange = useCallback((content) => {
        setFormData(prev => {
            if (prev.question === content) return prev;
            return { ...prev, question: content };
        });
    }, []);

    const handleOptionChange = useCallback((index, value) => {
        setFormData(prev => {
            if (prev.options[index] === value) return prev;
            const newOptions = [...prev.options];
            newOptions[index] = value;
            return { ...prev, options: newOptions };
        });
    }, []);

    const handleInputChange = useCallback((field, value) => {
        setFormData(prev => {
            if (prev[field] === value) return prev;
            return { ...prev, [field]: value };
        });
    }, []);

    const handlePreviousQuestion = useCallback(() => {
        if (currentQuestionIndex > 0) {
            const newIndex = currentQuestionIndex - 1;
            setCurrentQuestionIndex(newIndex);
            loadQuestionToForm(savedQuestions[newIndex]);
        }
    }, [currentQuestionIndex, savedQuestions, loadQuestionToForm]);

    const handleNextQuestion = useCallback(() => {
        if (currentQuestionIndex < savedQuestions.length - 1) {
            const newIndex = currentQuestionIndex + 1;
            setCurrentQuestionIndex(newIndex);
            loadQuestionToForm(savedQuestions[newIndex]);
        }
    }, [currentQuestionIndex, savedQuestions, loadQuestionToForm]);

    // ✅ Update dengan SweetAlert2
    const handleUpdateCurrentQuestion = useCallback(async () => {
        // Validation checks
        if (!formData.question.trim()) {
            await Swal.fire({
                icon: 'warning',
                title: 'Validation Error',
                text: 'Please enter a question',
                confirmButtonColor: '#1e3a8a'
            });
            return;
        }

        const filledOptions = formData.options.filter(opt => opt.trim() !== '');
        if (filledOptions.length < 2) {
            await Swal.fire({
                icon: 'warning',
                title: 'Validation Error',
                text: 'Please fill at least 2 options',
                confirmButtonColor: '#1e3a8a'
            });
            return;
        }

        if (!formData.answerKey || !formData.correctAnswerPoints) {
            await Swal.fire({
                icon: 'warning',
                title: 'Validation Error',
                text: 'Please select answer key and points',
                confirmButtonColor: '#1e3a8a'
            });
            return;
        }

        const updatedQuestions = [...savedQuestions];
        updatedQuestions[currentQuestionIndex] = {
            questionNumber: currentQuestionNumber,
            question: formData.question,
            options: [...formData.options],
            answerKey: formData.answerKey,
            points: formData.correctAnswerPoints,
            timestamp: new Date().toISOString()
        };

        setSavedQuestions(updatedQuestions);
        
        const pointsUsed = updatedQuestions.reduce((sum, q) => sum + parseInt(q.points || 0), 0);
        setTotalPointsUsed(pointsUsed);

        // ✅ Success notification
        await Swal.fire({
            icon: 'success',
            title: 'Updated!',
            text: `Question ${currentQuestionNumber} updated successfully`,
            confirmButtonColor: '#1e3a8a',
            timer: 1500,
            showConfirmButton: false
        });
    }, [formData, savedQuestions, currentQuestionIndex, currentQuestionNumber]);

    // ✅ Save dengan SweetAlert2
    const handleSaveAndNext = useCallback(async (onComplete) => {
        // Config validation
        if (!testConfig.randomType || !testConfig.totalNumber || !testConfig.totalPoints) {
            await Swal.fire({
                icon: 'warning',
                title: 'Configuration Required',
                text: 'Please complete test configuration',
                confirmButtonColor: '#1e3a8a'
            });
            return;
        }

        // Question validation
        if (!formData.question.trim()) {
            await Swal.fire({
                icon: 'warning',
                title: 'Validation Error',
                text: 'Please enter a question',
                confirmButtonColor: '#1e3a8a'
            });
            return;
        }

        const filledOptions = formData.options.filter(opt => opt.trim() !== '');
        if (filledOptions.length < 2) {
            await Swal.fire({
                icon: 'warning',
                title: 'Validation Error',
                text: 'Please fill at least 2 options',
                confirmButtonColor: '#1e3a8a'
            });
            return;
        }

        if (!formData.answerKey || !formData.correctAnswerPoints) {
            await Swal.fire({
                icon: 'warning',
                title: 'Validation Error',
                text: 'Please select answer key and points',
                confirmButtonColor: '#1e3a8a'
            });
            return;
        }

        const currentSavedQuestions = savedQuestionsRef.current;
        
        const currentPoints = parseInt(formData.correctAnswerPoints);
        const totalPoints = parseInt(testConfig.totalPoints);
        
        const currentTotalUsed = currentSavedQuestions.reduce((sum, q) => sum + parseInt(q.points || 0), 0);
        const newTotalUsed = currentTotalUsed + currentPoints;

        // Points validation
        if (newTotalUsed > totalPoints) {
            await Swal.fire({
                icon: 'error',
                title: 'Points Exceeded!',
                html: `
                    <p class="text-gray-700">Total points would exceed the limit.</p>
                    <p class="text-blue-600 font-semibold mt-2">Remaining: ${totalPoints - currentTotalUsed} points</p>
                `,
                confirmButtonColor: '#1e3a8a'
            });
            return;
        }

        // Max questions validation
        if (currentSavedQuestions.length >= parseInt(testConfig.totalNumber)) {
            await Swal.fire({
                icon: 'info',
                title: 'Maximum Reached',
                text: 'Maximum number of questions reached!',
                confirmButtonColor: '#1e3a8a'
            });
            return;
        }

        const newQuestion = {
            questionNumber: currentQuestionNumber,
            question: formData.question,
            options: [...formData.options],
            answerKey: formData.answerKey,
            points: formData.correctAnswerPoints,
            timestamp: new Date().toISOString()
        };

        const updatedQuestions = [...currentSavedQuestions, newQuestion];
        
        setSavedQuestions(updatedQuestions);
        setTotalPointsUsed(newTotalUsed);

        // Reset form
        setFormData({
            question: '',
            options: ['', '', '', ''],
            answerKey: '',
            correctAnswerPoints: ''
        });

        setCurrentQuestionNumber(prev => prev + 1);
        setEditorKey(prev => prev + 1);

        // ✅ Success notification
        await Swal.fire({
            icon: 'success',
            title: 'Saved!',
            text: `Question ${currentQuestionNumber} saved successfully`,
            confirmButtonColor: '#1e3a8a',
            timer: 1500,
            showConfirmButton: false
        });

        // ✅ Check if all questions completed
        const totalRequired = parseInt(testConfig.totalNumber);
        if (updatedQuestions.length === totalRequired && onComplete) {
            setTimeout(async () => {
                const result = await Swal.fire({
                    icon: 'success',
                    title: 'All Questions Completed!',
                    html: `
                        <p class="text-gray-700 mb-2">You've created all ${totalRequired} questions.</p>
                        <p class="text-blue-600 font-semibold">Submit test now?</p>
                    `,
                    showCancelButton: true,
                    confirmButtonColor: '#1e3a8a',
                    cancelButtonColor: '#6b7280',
                    confirmButtonText: 'Yes, Submit',
                    cancelButtonText: 'Not Yet'
                });
                
                if (result.isConfirmed) {
                    onComplete(updatedQuestions);
                }
            }, 100);
        }

    }, [formData, testConfig, currentQuestionNumber]);
    
    return {
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
        handleSaveAndNext,
        setSavedQuestions
    };
};