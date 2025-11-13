import { useState, useEffect, useCallback, useRef  } from 'react';

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
    
    // ✅ Sync ref dengan state
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

    // ✅ Guard clause untuk prevent infinite loop
    const handleQuestionChange = useCallback((content) => {
        setFormData(prev => {
            if (prev.question === content) {
                return prev; // ✅ Ini cukup untuk prevent infinite loop
            }
            
            return {
                ...prev,
                question: content
            };
        });
    }, []);

    // ✅ Guard clause untuk prevent infinite loop
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

    const handleUpdateCurrentQuestion = useCallback(() => {
        if (!formData.question.trim()) {
            alert('Please enter a question');
            return;
        }

        const filledOptions = formData.options.filter(opt => opt.trim() !== '');
        if (filledOptions.length < 2) {
            alert('Please fill at least 2 options');
            return;
        }

        if (!formData.answerKey || !formData.correctAnswerPoints) {
            alert('Please select answer key and points');
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

        alert(`Question ${currentQuestionNumber} updated!`);
    }, [formData, savedQuestions, currentQuestionIndex, currentQuestionNumber]);

    const handleSaveAndNext = useCallback((onComplete) => {
    
        if (!testConfig.randomType || !testConfig.totalNumber || !testConfig.totalPoints) {
            alert('Please complete test configuration');
            return;
        }

        if (!formData.question.trim()) {
            alert('Please enter a question');
            return;
        }

        const filledOptions = formData.options.filter(opt => opt.trim() !== '');
        if (filledOptions.length < 2) {
            alert('Please fill at least 2 options');
            return;
        }

        if (!formData.answerKey || !formData.correctAnswerPoints) {
            alert('Please select answer key and points');
            return;
        }

        const currentSavedQuestions = savedQuestionsRef.current;
        
        const currentPoints = parseInt(formData.correctAnswerPoints);
        const totalPoints = parseInt(testConfig.totalPoints);
        
        const currentTotalUsed = currentSavedQuestions.reduce((sum, q) => sum + parseInt(q.points || 0), 0);
        const newTotalUsed = currentTotalUsed + currentPoints;

        if (newTotalUsed > totalPoints) {
            alert(`Points exceed total! Remaining: ${totalPoints - currentTotalUsed}`);
            return;
        }

        if (currentSavedQuestions.length >= parseInt(testConfig.totalNumber)) {
            alert(`Maximum number of questions reached!`);
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

        // ✅ UPDATE dengan ref
        const updatedQuestions = [...currentSavedQuestions, newQuestion];
        
        console.log('🔍 SAVE DEBUG:');
        console.log('Previous (from ref):', currentSavedQuestions.length);
        console.log('Saving Q#:', currentQuestionNumber);
        console.log('✅ Updated:', updatedQuestions.length);
        console.log('Questions:', updatedQuestions.map(q => `Q${q.questionNumber}`).join(', '));

        // ✅ UPDATE STATE
        setSavedQuestions(updatedQuestions);
        setTotalPointsUsed(newTotalUsed);

        // RESET FORM
        setFormData({
            question: '',
            options: ['', '', '', ''],
            answerKey: '',
            correctAnswerPoints: ''
        });

        setCurrentQuestionNumber(prev => prev + 1);
        setEditorKey(prev => prev + 1);

        alert(`Question ${currentQuestionNumber} saved!`);

        // CHECK SUBMIT
        const totalRequired = parseInt(testConfig.totalNumber);
        if (updatedQuestions.length === totalRequired && onComplete) {
            setTimeout(() => {
                const confirmSubmit = window.confirm(
                    `All ${totalRequired} questions completed! Submit test now?`
                );
                
                if (confirmSubmit) {
                    onComplete(updatedQuestions);
                }
            }, 100);
        }

    }, [formData, testConfig, currentQuestionNumber]);
    // ✅ Tetap pakai dependency ini, tapi logic pakai ref
    // const resetAll = () => {
    // setSavedQuestions([]);
    // setCurrentQuestionNumber(1);
    // setTotalPointsUsed(0);
    // setTestConfig({
    //     randomType: '',
    //     totalNumber: '',
    //     totalPoints: '',
    //     pointDistribution: '',
    //     timeDuration: ''
    // });
    // setFormData({
    //     question: '',
    //     options: ['', '', '', ''],
    //     answerKey: '',
    //     correctAnswerPoints: ''
    // });
    // };
    
    
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