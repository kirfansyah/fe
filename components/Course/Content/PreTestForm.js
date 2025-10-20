import React, { useState, useEffect } from 'react';
import dynamic from "next/dynamic";
import 'react-quill/dist/quill.snow.css';
import { ChevronRight,ChevronLeft, Save } from 'lucide-react';
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })
export default function PreTestForm({ courseId, onBack, onSave ,createdBy = "System", contentData = null, isEditMode = false}) {
      
      // State untuk semua pertanyaan yang sudah disimpan
      const [savedQuestions, setSavedQuestions] = useState([]);
      
      // State untuk pertanyaan saat ini
      const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
      const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
      
      // State untuk konfigurasi test (hanya diisi sekali)
      const [testConfig, setTestConfig] = useState({
        randomType: '',
        totalNumber: '',
        totalPoints: '',
        pointDistribution: '',
        timeDuration: ''
      });
    
      const [formData, setFormData] = useState({
        question: '',
        options: ['', '', '', ''],
        answerKey: '',
        correctAnswerPoints: ''
      });
    
      const [pointsRemaining, setPointsRemaining] = useState(0);
      const [totalPointsUsed, setTotalPointsUsed] = useState(0);
      const [autoCalculatedPoints, setAutoCalculatedPoints] = useState(0);
      const [showPreviewModal, setShowPreviewModal] = useState(false);
      const [editorKey, setEditorKey] = useState(0);
    
        const randomTypes = ['Random A', 'Random B', 'Random C', 'Random D', 'Random E'];
        const numbers = Array.from({ length: 50 }, (_, i) => i + 1);
        const points = Array.from({ length: 100 }, (_, i) => (i + 1) * 1);
        const distributionTypes = ['Equal Distribution', 'Custom Distribution', 'Weighted'];
        const durations = ['30 minutes', '45 minutes', '60 minutes', '90 minutes', '120 minutes'];
        const answerKeys = ['a', 'b', 'c', 'd'];
    
      // Auto calculate Points per Question for Equal Distribution
      useEffect(() => {
        if (testConfig.pointDistribution === 'Equal Distribution') {
          const total = parseInt(testConfig.totalPoints) || 0;
          const number = parseInt(testConfig.totalNumber) || 1;
          const pointsPerQuestion = Math.floor(total / number);
          setAutoCalculatedPoints(pointsPerQuestion);
          
           if (!isEditMode) {
              setFormData(prev => ({
                  ...prev,
                  correctAnswerPoints: pointsPerQuestion.toString()
              }));
          }
        } else {
          setAutoCalculatedPoints(0);
        }
      }, [testConfig.pointDistribution, testConfig.totalPoints, testConfig.totalNumber]);
    
      // Auto calculate Points Remaining
      useEffect(() => {
        const total = parseInt(testConfig.totalPoints) || 0;
        const remaining = total - totalPointsUsed;
        setPointsRemaining(remaining >= 0 ? remaining : 0);
      }, [testConfig.totalPoints, totalPointsUsed]);

       // Load data saat edit mode
          useEffect(() => {
              if (isEditMode && contentData) {
                  console.log('📦 Loading content data for edit:', contentData);
                  
                  // Load test configuration
                  setTestConfig({
                      randomType: contentData.random_type || '',
                      totalNumber: contentData.total_number?.toString() || '',
                      totalPoints: contentData.total_points?.toString() || '',
                      pointDistribution: contentData.point_distribution_type === 'equal' ? 'Equal Distribution' : 
                                        contentData.point_distribution_type === 'customize' ? 'Custom Distribution' : 'Weighted',
                      timeDuration: contentData.time_duration || ''
                  });
      
                  // Load questions if available
                  if (contentData.questions && contentData.questions.length > 0) {
                      const loadedQuestions = contentData.questions.map(q => ({
                          questionNumber: q.question_no,
                          question: q.question_text,
                          options: q.options.map(opt => opt.option_text),
                          answerKey: q.options.find(opt => opt.is_correct)?.option_label.toLowerCase() || '',
                          points: q.correct_answer_points?.toString() || '',
                          timestamp: new Date().toISOString()
                      }));
                      
                      setSavedQuestions(loadedQuestions);
                      
                      // Load soal pertama ke form
                      if (loadedQuestions.length > 0) {
                          loadQuestionToForm(loadedQuestions[0]);
                          setCurrentQuestionIndex(0);
                      }
                      
                      // Calculate total points used
                      const pointsUsed = loadedQuestions.reduce((sum, q) => sum + parseInt(q.points || 0), 0);
                      setTotalPointsUsed(pointsUsed);
                  }
              }
          }, [isEditMode, contentData]);
      
          // Function untuk load question ke form
          const loadQuestionToForm = (question) => {
              setFormData({
                  question: question.question,
                  options: [...question.options],
                  answerKey: question.answerKey,
                  correctAnswerPoints: question.points
              });
              setCurrentQuestionNumber(question.questionNumber);
              setEditorKey(prev => prev + 1); // Reset editor
          };
       

      const formTitle = isEditMode ? 'Edit Content' : 'Add New Content';
    
      const handleTestConfigChange = (field, value) => {
        setTestConfig(prev => ({
          ...prev,
          [field]: value
        }));
      };
    
      const handleInputChange = (field, value) => {
        setFormData(prev => ({
          ...prev,
          [field]: value
        }));
      };
    
      const handleOptionChange = (index, value) => {
        const newOptions = [...formData.options];
        newOptions[index] = value;
        setFormData(prev => ({
          ...prev,
          options: newOptions
        }));
      };

    // Navigation: Previous Question
    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            const newIndex = currentQuestionIndex - 1;
            setCurrentQuestionIndex(newIndex);
            loadQuestionToForm(savedQuestions[newIndex]);
        }
    };

    // Navigation: Next Question
    const handleNextQuestion = () => {
        if (currentQuestionIndex < savedQuestions.length - 1) {
            const newIndex = currentQuestionIndex + 1;
            setCurrentQuestionIndex(newIndex);
            loadQuestionToForm(savedQuestions[newIndex]);
        }
    };

    // Update Current Question
    const handleUpdateCurrentQuestion = () => {
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

        // Update question di array
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
        
        // Recalculate points
        const pointsUsed = updatedQuestions.reduce((sum, q) => sum + parseInt(q.points || 0), 0);
        setTotalPointsUsed(pointsUsed);

        alert(`Question ${currentQuestionNumber} updated!`);
    };
      // Save & Next Question
    
      const handleSaveAndNext = () => {
        // Validation untuk konfigurasi test (hanya validasi di pertanyaan pertama)
        if (savedQuestions.length === 0) {
          if (!testConfig.randomType) {
            alert('Please select Random Type');
            return;
          }
          if (!testConfig.totalNumber) {
            alert('Please select Total Number');
            return;
          }
          if (!testConfig.totalPoints) {
            alert('Please select Total Points');
            return;
          }
        }
    
        // Validation untuk pertanyaan
        if (!formData.question.trim()) {
          alert('Please enter a question');
          return;
        }
    
        // Validation untuk options
        const filledOptions = formData.options.filter(opt => opt.trim() !== '');
        if (filledOptions.length < 2) {
          alert('Please fill at least 2 options');
          return;
        }
    
        if (!formData.answerKey) {
          alert('Please select Answer Key');
          return;
        }
    
        if (!formData.correctAnswerPoints) {
          alert('Please select Correct Answer Points');
          return;
        }
    
        // Check if points remaining mencukupi
        const currentPoints = parseInt(formData.correctAnswerPoints);
        const newTotalUsed = totalPointsUsed + currentPoints;
        if (newTotalUsed > parseInt(testConfig.totalPoints)) {
          alert(`Points exceed total! Remaining points: ${pointsRemaining}`);
          return;
        }
    
        // Check if sudah mencapai total number
        if (savedQuestions.length >= parseInt(testConfig.totalNumber)) {
          alert(`Maximum number of questions (${testConfig.totalNumber}) reached!`);
          return;
        }
    
        // Simpan pertanyaan ke array
        const newQuestion = {
          questionNumber: currentQuestionNumber,
          question: formData.question,
          options: [...formData.options],
          answerKey: formData.answerKey,
          points: formData.correctAnswerPoints,
          timestamp: new Date().toISOString()
        };
    
        setSavedQuestions(prev => [...prev, newQuestion]);
        setTotalPointsUsed(newTotalUsed);
    
        console.log('Question saved:', newQuestion);
        console.log('All saved questions:', [...savedQuestions, newQuestion]);
        console.log('Points used:', newTotalUsed, '/', testConfig.totalPoints);
    
        // Reset form untuk pertanyaan berikutnya
        setFormData({
          question: '',
          options: ['', '', '', ''],
          answerKey: '',
          correctAnswerPoints: ''
        });
    
        // Increment question number
        setCurrentQuestionNumber(prev => prev + 1);

        setEditorKey(prev => prev + 1);
    
        alert(`Question ${currentQuestionNumber} saved! Ready for question ${currentQuestionNumber + 1}`);
    
        // Jika sudah mencapai total number, tanya apakah ingin submit
        if (savedQuestions.length + 1 === parseInt(testConfig.totalNumber)) {
          if (confirm('All questions completed! Do you want to submit the test?')) {
            handleSubmitTest([...savedQuestions, newQuestion]);
          }
        }
      };
    
      const handleSubmitTest = (allQuestions) => {
         const finalTest = {
            id_course: courseId,
            id_content_type: 3,
            content_title: "Pre Test",
            total_points: parseInt(testConfig.totalPoints) || 0,
            total_number: parseInt(testConfig.totalNumber) || 0,
            point_distribution_type: testConfig.pointDistribution === 'Equal Distribution' ? 'equal' : 
                                        testConfig.pointDistribution === 'Custom Distribution' ? 'customize' : 
                                        'weighted',
            time_duration: testConfig.timeDuration || '00:00:00',
            created_by: createdBy, 
            created_device: "system",
            questions: allQuestions.map((q, index) => ({
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
                }).filter(opt => opt.option_text && opt.option_text.trim() !== '') // Filter empty options
            }))
        };
    
        console.log('=== FINAL TEST SUBMISSION ===');
        console.log(JSON.stringify(finalTest, null, 2));
        
        // Panggil onSave dari parent jika ada
        if (onSave) {
          onSave(finalTest);
        } else {
          alert('Test submitted successfully!\n\nCheck console for full test data.');
          
          // Reset semua jika tidak ada onSave callback
          if (confirm('Do you want to create another test?')) {
            resetAll();
          }
        }
      };
    
      const resetAll = () => {
        setSavedQuestions([]);
        setCurrentQuestionNumber(1);
        setTotalPointsUsed(0);
        setTestConfig({
          randomType: '',
          totalNumber: '',
          totalPoints: '',
          pointDistribution: '',
          timeDuration: ''
        });
        setFormData({
          question: '',
          options: ['', '', '', ''],
          answerKey: '',
          correctAnswerPoints: ''
        });
      };
    
      const handleCancel = () => {
        if (confirm('Are you sure you want to cancel? All changes will be lost.')) {
          if (onBack) {
            onBack(); // Kembali ke halaman sebelumnya
          } else {
            resetAll(); // Reset form jika tidak ada onBack callback
          }
        }
      };
    
      const handlePreview = () => {
        if (savedQuestions.length === 0 && !formData.question.trim()) {
          alert('No questions to preview!');
          return;
        }
    
        setShowPreviewModal(true);
      };

    const CustomSelect = ({ label, value, options, placeholder, onChange, disabled = false }) => (
        <div className="flex flex-col items-start gap-2">
            <label className="text-gray-700 font-medium mb-2 text-lg">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className={`border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <option value="">{placeholder}</option>
                {options.map((opt, idx) => (
                <option key={idx} value={opt}>{opt}</option>
                ))}
            </select>
        </div>
    );
    const quillModules = {
        toolbar: [
            [{ 'header': ['1', '2', '3', '4', '5', '6', false] }],
            [{ 'font': [] }],
            [{ 'size': [] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, 
             { 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'align': [] }],
            ['link', 'image', 'video'],
            ['code-block'],
            ['clean']
        ],
        clipboard: {
            // toggle to add extra line breaks when pasting HTML:
            matchVisual: false,
        }
    };
    // React Quill formats
    const quillFormats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'color', 'background',
        'list', 'bullet', 'indent',
        'align',
        'link', 'image', 'video',
        'code-block'
    ];
    

    return (
    <div className="min-h-screen p-6">
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Home</span>
                <ChevronRight className="w-4 h-4" />
                <span className="text-gray-900 font-medium">Course Management</span>
            </div>
        </div>
        {/* Preview Modal */}
        {showPreviewModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Preview Mode</h2>
                <button
                    onClick={() => setShowPreviewModal(false)}
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
                {formData.question.trim() && (
                    <div className="mb-8 p-6 border-2 border-blue-300 rounded-lg bg-blue-50">
                    <div className="mb-2 text-sm text-blue-600 font-semibold">Current Question (Not Saved)</div>
                    <div className="flex items-start mb-4">
                        <span className="text-lg font-semibold text-gray-800 mr-2">{currentQuestionNumber}.</span>
                        <div 
                            className="text-lg text-gray-800 flex-1 prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: formData.question }}
                            />
                    </div>
                    
                    <div className="space-y-3 ml-6">
                        {formData.options.map((opt, optIdx) => {
                            if (!opt.trim() && !opt.includes('<')) return null;
                            const letter = String.fromCharCode(97 + optIdx);
                            const isCorrect = formData.answerKey === letter;
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
                    
                    {formData.answerKey && (
                        <div className="mt-4 ml-6 text-sm text-gray-500">
                        <span className="font-medium">Correct Answer:</span> {formData.answerKey.toUpperCase()} | 
                        <span className="font-medium ml-2">Points:</span> {formData.correctAnswerPoints || 0}
                        </div>
                    )}
                    </div>
                )}

                {savedQuestions.length === 0 && !formData.question.trim() && (
                    <div className="text-center py-8 text-gray-500">
                    No questions available to preview
                    </div>
                )}
                </div>

                <div className="sticky bottom-0 bg-white border-t px-6 py-4">
                <button
                    onClick={() => setShowPreviewModal(false)}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    Close Preview
                </button>
                </div>
            </div>
            </div>
        )}
        {/* Navigation untuk Edit Mode */}
        {isEditMode && savedQuestions.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handlePreviousQuestion}
                            disabled={currentQuestionIndex === 0}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                        </button>
                        
                        <span className="text-lg font-semibold text-gray-700">
                            Question {currentQuestionIndex + 1} of {savedQuestions.length}
                        </span>
                        
                        <button
                            onClick={handleNextQuestion}
                            disabled={currentQuestionIndex === savedQuestions.length - 1}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <button
                        onClick={handleUpdateCurrentQuestion}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Save className="w-4 h-4" />
                        Update Question
                    </button>
                </div>
            </div>
        )}
        <div className="min-h-screen bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">{formTitle}</h2>  
                <p className="text-sm text-gray-600 mt-1">Course ID: {courseId}</p>
            </div>
            <div className="flex items-center gap-6">
                <CustomSelect
                        label="Random Type"
                        value={testConfig.randomType}
                        options={randomTypes}
                        placeholder="Select Random Type"
                        onChange={(val) => handleTestConfigChange('randomType', val)}
                        disabled={savedQuestions.length > 0}
                    />
                <CustomSelect
                    label="Total Number"
                    value={testConfig.totalNumber}
                    options={numbers}
                    placeholder="Select number"
                    onChange={(val) => handleTestConfigChange('totalNumber', val)}
                    disabled={savedQuestions.length > 0}
                />
                <CustomSelect
                    label="Total Points"
                    value={testConfig.totalPoints}
                    options={points}
                    placeholder="Select total points"
                    onChange={(val) => handleTestConfigChange('totalPoints', val)}
                    disabled={savedQuestions.length > 0}
                />
                <CustomSelect
                    label="Point Distribution Type"
                    value={testConfig.pointDistribution}
                    options={distributionTypes}
                    placeholder="Select type"
                    onChange={(val) => handleTestConfigChange('pointDistribution', val)}
                    disabled={savedQuestions.length > 0}
                />
                <CustomSelect
                    label="Time Duration"
                    value={testConfig.timeDuration}
                    options={durations}
                    placeholder="hh:mm:ss"
                    onChange={(val) => handleTestConfigChange('timeDuration', val)}
                    disabled={savedQuestions.length > 0}
                />
            </div>
            <div className="mt-6 grid grid-cols-1 gap-2">
                <label className="text-gray-700 font-medium mb-2 block">Question [{currentQuestionNumber}]</label>
                <ReactQuill
                        value={formData.question}
                        key={`question-${editorKey}`}
                        theme="snow"
                        modules={quillModules}
                        formats={quillFormats}
                        placeholder="Start writing your content here..."
                        style={{ height: '70px' }}
                        onChange={(content) => {
                            handleInputChange('question', content);
                        }}
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
                        placeholder="Start writing your content here..."
                        style={{ height: '70px' }}
                        value={option}
                        onChange={(content) => {
                        handleOptionChange(index, content);
                        }}
                     />
            </div>
            ))}
            <div className="mt-12 flex items-center gap-6">
                <CustomSelect
                    label="Answer Key"  
                    value={formData.answerKey}
                    options={answerKeys}
                    placeholder="Select answer key"
                    onChange={(val) => handleInputChange('answerKey', val)}
                />
                <CustomSelect
                    label="Correct Answer Points"
                    value={formData.correctAnswerPoints}
                    options={testConfig.pointDistribution === 'Equal Distribution' ? 
                        (autoCalculatedPoints ? [autoCalculatedPoints.toString()] : [])
                        : points}
                    placeholder={testConfig.pointDistribution === 'Equal Distribution' ? 
                        (autoCalculatedPoints ? `Auto: ${autoCalculatedPoints}` : 'Select total points first')
                        : 'Select points'}
                    onChange={(val) => handleInputChange('correctAnswerPoints', val)}
                    disabled={testConfig.pointDistribution === 'Equal Distribution'}
                />
                <div className="text-gray-700 font-medium">
                    Points Remaining: <span className="font-bold">{pointsRemaining}</span>
                </div>
            </div>
            <div className="mt-12 flex gap-6 justify-start items-center">
                <button onClick={handleSaveAndNext} className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700">   
                    Save & Next
                </button>
                <button onClick={handlePreview} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Preview
                </button>
                <button onClick={handleCancel} className="px-6 py-2 bg-red-600 text-gray-700 rounded hover:bg-gray-300">
                    Cancel
                </button>
            </div>
        </div>
    </div>
  );
}