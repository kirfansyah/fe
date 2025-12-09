import { 
    X, Building2, Calendar, Settings, Target, Check,
    AlertCircle, ChevronRight, ChevronLeft, Save, Edit
} from "lucide-react";
import { useState, useEffect } from "react";

export default function EnrollmentForm({ 
    isOpen,
    onClose,
    courseId,
    courseName,
    enrollment,
    enrollmentIndex,
    companyUnits = [],
    groupEnroll = [],
    availableCompanies = [],
    onUpdateField,
    onToggleGroup,
    onSave
}) {
    const [currentStep, setCurrentStep] = useState(1);
    const [isSaving, setIsSaving] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [editMode, setEditMode] = useState(false);

    const isExisting = !!enrollment.id_course_enrollment;
    const isSpecific = enrollment.enroll_type_name === 'Specific' || enrollment.id_enrollment_type === 2;
    const selectedGroups = enrollment.groupings || 
                          (enrollment.groupings?.map(g => g.id_grouping)) || [];
    const selectedCompany = companyUnits.find(c => c.id === enrollment.company_id);

    // Format values
    const enrollmentType = enrollment.enroll_type_name || 
                          (enrollment.id_enrollment_type === 1 ? 'General' : 
                           enrollment.id_enrollment_type === 2 ? 'Specific' : '');
    const statusCourse = enrollment.course_status_name || 
                       (enrollment.id_course_status === 1 ? 'Mandatory' : 
                        enrollment.id_course_status === 2 ? 'Non Mandatory' : '');
    const publishDate = enrollment.publish_date ? 
                      new Date(enrollment.publish_date).toISOString().split('T')[0] : '';
    const endDate = enrollment.end_date ? 
                   new Date(enrollment.end_date).toISOString().split('T')[0] : '';
    const remedialAllowed = enrollment.remedial_allowed !== undefined ? 
                          (enrollment.remedial_allowed ? 'Yes' : 'No') : 'Yes';
    const times = enrollment.remedial_limit || enrollment.times || 1;
    
    // Reset step when modal opens
    useEffect(() => {
        if (isOpen) {
            setCurrentStep(1);
            setValidationErrors({});
            setEditMode(false);
        }
    }, [isOpen]);

    const totalSteps = isSpecific ? 4 : 3;

    const steps = [
        { id: 1, title: 'Basic Info', icon: Building2, color: 'blue' },
        { id: 2, title: 'Schedule', icon: Calendar, color: 'purple' },
        { id: 3, title: 'Settings', icon: Settings, color: 'green' },
    ];

    if (isSpecific) {
        steps.push({ id: 4, title: 'Groups', icon: Target, color: 'orange' });
    }

    const validateCurrentStep = () => {
        const errors = {};
        
        if (currentStep === 1) {
            if (!enrollment.company_id) errors.company_id = 'Company is required';
            if (!enrollmentType) errors.enroll_type_name = 'Enrollment type is required';
            if (!statusCourse) errors.course_status_name = 'Status is required';
        }
        
        if (currentStep === 2) {
            if (!publishDate) errors.publish_date = 'Start date is required';
            if (endDate && publishDate && new Date(endDate) < new Date(publishDate)) {
                errors.end_date = 'End date must be after start date';
            }
        }

        if (currentStep === 3) {
            if (!enrollment.passing_grade && enrollment.passing_grade !== 0) {
                errors.passing_grade = 'Minimum score is required';
            }
            if (enrollment.passing_grade < 0 || enrollment.passing_grade > 100) {
                errors.passing_grade = 'Score must be between 0 and 100';
            }
        }
        
        if (currentStep === 4 && isSpecific && selectedGroups.length === 0) {
            errors.groups = 'Please select at least one group';
        }
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleNext = () => {
        if (validateCurrentStep()) {
            setCurrentStep(prev => Math.min(prev + 1, totalSteps));
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSave = async () => {
        if (!validateCurrentStep()) return;
        
        setIsSaving(true);
        try {
            // ✅ Await the save and get result
            const result = await onSave(courseId, enrollmentIndex);
            
            // ✅ Close only if successful
            if (result?.success) {
                onClose();
            }
        } catch (error) {
            console.error('Save error:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleEnableEdit = () => {
        setEditMode(true);
        setCurrentStep(1);
    };

    const handleCancelEdit = () => {
        setEditMode(false);
    };

    const canProceed = () => {
        if (currentStep === 1) {
            return enrollment.company_id && enrollmentType && statusCourse;
        }
        if (currentStep === 2) {
            return publishDate;
        }
        if (currentStep === 3) {
            return enrollment.passing_grade >= 0 && enrollment.passing_grade <= 100;
        }
        if (currentStep === 4 && isSpecific) {
            return selectedGroups.length > 0;
        }
        return true;
    };

    const isReadOnly = isExisting && !editMode;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8 max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
                    <div className="flex-1 min-w-0 mr-4">
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-bold text-gray-900 truncate">
                                {isExisting 
                                    ? (editMode ? 'Edit Enrollment' : 'View Enrollment')
                                    : 'Add Company Enrollment'}
                            </h3>
                            {isExisting && !editMode && (
                                <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                                    Read-Only
                                </span>
                            )}
                            {isExisting && editMode && (
                                <span className="px-3 py-1 bg-orange-600 text-white text-xs font-bold rounded-full">
                                    Editing
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                            {courseName}
                        </p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-200 rounded-lg"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Progress Stepper */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = currentStep === step.id;
                            const isCompleted = currentStep > step.id;
                            
                            return (
                                <div key={step.id} className="flex items-center flex-1">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                                            isActive 
                                                ? `bg-${step.color}-600 text-white shadow-lg scale-110`
                                                : isCompleted
                                                ? 'bg-green-500 text-white shadow-md'
                                                : 'bg-gray-200 text-gray-500'
                                        }`}>
                                            {isCompleted ? (
                                                <Check className="w-6 h-6" />
                                            ) : (
                                                <Icon className="w-6 h-6" />
                                            )}
                                        </div>
                                        <span className={`text-xs font-semibold mt-2 ${
                                            isActive 
                                                ? 'text-blue-600'
                                                : isCompleted
                                                ? 'text-green-600'
                                                : 'text-gray-500'
                                        }`}>
                                            {step.title}
                                        </span>
                                    </div>
                                    
                                    {index < steps.length - 1 && (
                                        <div className={`flex-1 h-1 mx-2 rounded transition-all ${
                                            currentStep > step.id 
                                                ? 'bg-green-500'
                                                : 'bg-gray-200'
                                        }`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Read-Only Banner */}
                {isReadOnly && (
                    <div className="mx-6 mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                            <p className="text-sm text-blue-800">
                                <strong>View Mode:</strong> Click "Edit" to make changes
                            </p>
                        </div>
                        <button
                            onClick={handleEnableEdit}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center gap-2"
                        >
                            <Edit className="w-4 h-4" />
                            Edit
                        </button>
                    </div>
                )}

                {/* Modal Body - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Step 1: Basic Info */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Building2 className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900">Basic Information</h4>
                                    <p className="text-sm text-gray-600">Select company and enrollment details</p>
                                </div>
                            </div>

                            {/* Company */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Company Unit <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={enrollment.company_id || ''}
                                    onChange={(e) => onUpdateField(
                                        courseId, 
                                        enrollmentIndex, 
                                        'company_id', 
                                        e.target.value ? parseInt(e.target.value) : null
                                    )}
                                    disabled={isReadOnly}
                                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${
                                        validationErrors.company_id
                                            ? 'border-red-300 focus:ring-red-500'
                                            : 'border-gray-200 focus:ring-blue-500'
                                    } ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'} focus:outline-none focus:ring-2`}
                                >
                                    <option value="">Select Company</option>
                                    {isExisting ? (
                                        <option value={enrollment.company_id}>
                                            {enrollment.company_name}
                                        </option>
                                    ) : (
                                        availableCompanies.map(company => (
                                            <option key={company.id} value={company.id}>
                                                {company.company_name}
                                            </option>
                                        ))
                                    )}
                                </select>
                                {validationErrors.company_id && (
                                    <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {validationErrors.company_id}
                                    </p>
                                )}
                            </div>

                            {/* Enrollment Type */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Enrollment Type <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => !isReadOnly && onUpdateField(courseId, enrollmentIndex, 'enroll_type_name', 'General')}
                                        disabled={isReadOnly}
                                        className={`p-4 rounded-xl border-2 transition-all ${
                                            enrollmentType === 'General'
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        } ${isReadOnly ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                                    >
                                        <div className="font-bold text-gray-900 mb-1">General</div>
                                        <div className="text-xs text-gray-600">All employees</div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => !isReadOnly && onUpdateField(courseId, enrollmentIndex, 'enroll_type_name', 'Specific')}
                                        disabled={isReadOnly}
                                        className={`p-4 rounded-xl border-2 transition-all ${
                                            enrollmentType === 'Specific'
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        } ${isReadOnly ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                                    >
                                        <div className="font-bold text-gray-900 mb-1">Specific</div>
                                        <div className="text-xs text-gray-600">Selected groups</div>
                                    </button>
                                </div>
                            </div>

                            {/* Status Course */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Course Status <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => !isReadOnly && onUpdateField(courseId, enrollmentIndex, 'course_status_name', 'Mandatory')}
                                        disabled={isReadOnly}
                                        className={`p-4 rounded-xl border-2 transition-all ${
                                            statusCourse === 'Mandatory'
                                                ? 'border-red-500 bg-red-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        } ${isReadOnly ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                                    >
                                        <div className="font-bold text-gray-900 mb-1">Mandatory</div>
                                        <div className="text-xs text-gray-600">Required</div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => !isReadOnly && onUpdateField(courseId, enrollmentIndex, 'course_status_name', 'Non Mandatory')}
                                        disabled={isReadOnly}
                                        className={`p-4 rounded-xl border-2 transition-all ${
                                            statusCourse === 'Non Mandatory'
                                                ? 'border-green-500 bg-green-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        } ${isReadOnly ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                                    >
                                        <div className="font-bold text-gray-900 mb-1">Non Mandatory</div>
                                        <div className="text-xs text-gray-600">Not required</div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Schedule */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Calendar className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900">Schedule & Duration</h4>
                                    <p className="text-sm text-gray-600">Set enrollment dates</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Publish Date */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Start Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={publishDate}
                                        onChange={(e) => onUpdateField(courseId, enrollmentIndex, 'publish_date', e.target.value)}
                                        disabled={isReadOnly}
                                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${
                                            validationErrors.publish_date
                                                ? 'border-red-300 focus:ring-red-500'
                                                : 'border-gray-200 focus:ring-blue-500'
                                        } ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'} focus:outline-none focus:ring-2`}
                                    />
                                    {validationErrors.publish_date && (
                                        <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {validationErrors.publish_date}
                                        </p>
                                    )}
                                </div>

                                {/* End Date */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        End Date (Recommended)
                                    </label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => onUpdateField(courseId, enrollmentIndex, 'end_date', e.target.value)}
                                        min={publishDate}
                                        disabled={isReadOnly}
                                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${
                                            validationErrors.end_date
                                                ? 'border-red-300 focus:ring-red-500'
                                                : 'border-gray-200 focus:ring-blue-500'
                                        } ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'} focus:outline-none focus:ring-2`}
                                    />
                                </div>
                            </div>

                            {publishDate && (
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                    <p className="text-sm text-blue-800">
                                        <strong>Course will be available from:</strong> {new Date(publishDate).toLocaleDateString('id-ID', { 
                                            weekday: 'long', 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}
                                        {endDate && (
                                            <>
                                                <br />
                                                <strong>Until:</strong> {new Date(endDate).toLocaleDateString('id-ID', { 
                                                    weekday: 'long', 
                                                    year: 'numeric', 
                                                    month: 'long', 
                                                    day: 'numeric' 
                                                })}
                                            </>
                                        )}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3: Settings */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Settings className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900">Course Settings</h4>
                                    <p className="text-sm text-gray-600">Configure remedial, score, and refresh period</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Remedial Allowed */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Remedial Allowed
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => !isReadOnly && onUpdateField(courseId, enrollmentIndex, 'remedial_allowed', 'Yes')}
                                            disabled={isReadOnly}
                                            className={`p-4 rounded-xl border-2 transition-all ${
                                                remedialAllowed === 'Yes'
                                                    ? 'border-green-500 bg-green-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            } ${isReadOnly ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                                        >
                                            <div className="font-bold text-gray-900 mb-1">Yes</div>
                                            <div className="text-xs text-gray-600">Allow retakes</div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => !isReadOnly && onUpdateField(courseId, enrollmentIndex, 'remedial_allowed', 'No')}
                                            disabled={isReadOnly}
                                            className={`p-4 rounded-xl border-2 transition-all ${
                                                remedialAllowed === 'No'
                                                    ? 'border-red-500 bg-red-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            } ${isReadOnly ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                                        >
                                            <div className="font-bold text-gray-900 mb-1">No</div>
                                            <div className="text-xs text-gray-600">One attempt</div>
                                        </button>
                                    </div>
                                </div>

                                {/* Maximum Attempts */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Maximum Attempts
                                    </label>
                                    <input
                                        type="number"
                                        value={times}
                                        onChange={(e) => onUpdateField(courseId, enrollmentIndex, 'times', parseInt(e.target.value) || 1)}
                                        min="1"
                                        max="10"
                                        disabled={isReadOnly}
                                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            isReadOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                                        }`}
                                    />
                                    <p className="text-xs text-gray-500 mt-2">
                                        Number of times employee can attempt this course
                                    </p>
                                </div>

                                {/* Minimum Score */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Minimum Score <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={enrollment.passing_grade ?? 0}
                                            onChange={(e) => onUpdateField(courseId, enrollmentIndex, 'passing_grade', parseInt(e.target.value) || 0)}
                                            min="0"
                                            max="100"
                                            disabled={isReadOnly}
                                            className={`w-full px-4 py-3 pr-12 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 ${
                                                validationErrors.passing_grade
                                                    ? 'border-red-300 focus:ring-red-500'
                                                    : 'border-gray-200 focus:ring-blue-500'
                                            } ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                                        />
                                    </div>
                                    {validationErrors.passing_grade ? (
                                        <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {validationErrors.passing_grade}
                                        </p>
                                    ) : (
                                        <p className="text-xs text-gray-500 mt-2">
                                            Minimum passing score (0-100)
                                        </p>
                                    )}
                                </div>

                                {/* Refreshment Date */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Refreshment Period (Months)
                                    </label>
                                    <select
                                        value={enrollment.refreshment_months || ''}
                                        onChange={(e) => onUpdateField(courseId, enrollmentIndex, 'refreshment_months', e.target.value ? parseInt(e.target.value) : null)}
                                        disabled={isReadOnly}
                                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            isReadOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                                        } border-gray-200`}
                                    >
                                        <option value="">No Refresh Required</option>
                                        <option value="6">6 Months</option>
                                        <option value="12">12 Months (1 Year)</option>
                                        <option value="18">18 Months</option>
                                        <option value="24">24 Months (2 Years)</option>
                                        <option value="36">36 Months (3 Years)</option>
                                    </select>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Course must be retaken after this period
                                    </p>
                                </div>
                            </div>

                            {/* Settings Info Card */}
                            {((enrollment.passing_grade ?? 0) > 0 || enrollment.refreshment_months) && (
                                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                                    <p className="text-sm text-green-800">
                                        {(enrollment.passing_grade ?? 0) > 0 && (
                                            <>
                                                <strong>Passing Score:</strong> Employees must score at least {enrollment.passing_grade} to pass
                                                {enrollment.refreshment_months && <br />}
                                            </>
                                        )}
                                        {enrollment.refreshment_months && (
                                            <>
                                                <strong>Refresh Period:</strong> Course must be retaken every {enrollment.refreshment_months} months
                                            </>
                                        )}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 4: Target Groups */}
                    {currentStep === 4 && isSpecific && (
                        <div className="space-y-6">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Target className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900">Target Groups</h4>
                                    <p className="text-sm text-gray-600">
                                        {selectedGroups.length === 0 
                                            ? 'Select employee groups' 
                                            : `${selectedGroups.length} group(s) selected`}
                                    </p>
                                </div>
                            </div>

                            <div className="border-2 border-gray-200 rounded-xl bg-white max-h-96 overflow-y-auto">
                                <div className="p-4 space-y-2">
                                    {groupEnroll.map(group => (
                                        <label
                                            key={group.id}
                                            className={`flex items-center gap-3 p-4 rounded-xl transition-all ${
                                                selectedGroups.includes(group.id)
                                                    ? 'bg-blue-50 border-2 border-blue-500 shadow-sm'
                                                    : 'bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
                                            } ${isReadOnly ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedGroups.includes(group.id)}
                                                onChange={() => !isReadOnly && onToggleGroup(courseId, enrollmentIndex, group.id)}
                                                disabled={isReadOnly}
                                                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                            />
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-gray-900">
                                                    {group.name_group}
                                                </p>
                                                {group.description && (
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {group.description}
                                                    </p>
                                                )}
                                            </div>
                                            {selectedGroups.includes(group.id) && (
                                                <Check className="w-5 h-5 text-blue-600" />
                                            )}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {validationErrors.groups && (
                                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-600 font-semibold">
                                        {validationErrors.groups}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Summary Preview */}
                    {currentStep === totalSteps && !isReadOnly && (
                        <div className="mt-6 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-5">
                            <h5 className="text-sm font-bold text-blue-900 mb-4 flex items-center gap-2">
                                <Check className="w-4 h-4" />
                                Review Before Saving
                            </h5>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-blue-700 font-medium mb-1">Company:</p>
                                    <p className="text-blue-900 font-bold">{selectedCompany?.company_name}</p>
                                </div>
                                <div>
                                    <p className="text-blue-700 font-medium mb-1">Type:</p>
                                    <p className="text-blue-900 font-bold">{enrollmentType}</p>
                                </div>
                                <div>
                                    <p className="text-blue-700 font-medium mb-1">Status:</p>
                                    <p className="text-blue-900 font-bold">{statusCourse}</p>
                                </div>
                                <div>
                                    <p className="text-blue-700 font-medium mb-1">Start Date:</p>
                                    <p className="text-blue-900 font-bold">
                                        {new Date(publishDate).toLocaleDateString('id-ID')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-blue-700 font-medium mb-1">Minimum Score:</p>
                                    <p className="text-blue-900 font-bold">{enrollment.passing_grade ?? 0}</p>
                                </div>
                                <div>
                                    <p className="text-blue-700 font-medium mb-1">Refresh Period:</p>
                                    <p className="text-blue-900 font-bold">
                                        {enrollment.refreshment_months ? `${enrollment.refreshment_months} months` : 'None'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-blue-700 font-medium mb-1">Remedial:</p>
                                    <p className="text-blue-900 font-bold">{remedialAllowed}</p>
                                </div>
                                <div>
                                    <p className="text-blue-700 font-medium mb-1">Max Attempts:</p>
                                    <p className="text-blue-900 font-bold">{times}</p>
                                </div>
                                {isSpecific && (
                                    <div className="col-span-2">
                                        <p className="text-blue-700 font-medium mb-1">Selected Groups:</p>
                                        <p className="text-blue-900 font-bold">{selectedGroups.length} group(s)</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                    <div className="text-sm text-gray-600">
                        {!isReadOnly && `Step ${currentStep} of ${totalSteps}`}
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {isReadOnly ? (
                            <button
                                onClick={onClose}
                                className="px-5 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                            >
                                Close
                            </button>
                        ) : (
                            <>
                                {isExisting && editMode && (
                                    <button
                                        type="button"
                                        onClick={handleCancelEdit}
                                        className="px-5 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                )}

                                {currentStep > 1 && (
                                    <button
                                        type="button"
                                        onClick={handleBack}
                                        className="px-5 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center gap-2"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                        Back
                                    </button>
                                )}
                                
                                {currentStep < totalSteps ? (
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        disabled={!canProceed()}
                                        className={`px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${
                                            canProceed()
                                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        }`}
                                    >
                                        Next
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        disabled={!canProceed() || isSaving}
                                        className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-md hover:shadow-lg ${
                                            canProceed() && !isSaving
                                                ? 'bg-green-600 text-white hover:bg-green-700'
                                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        }`}
                                    >
                                        {isSaving ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-5 h-5" />
                                                {isExisting ? 'Update Enrollment' : 'Save Enrollment'}
                                            </>
                                        )}
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}