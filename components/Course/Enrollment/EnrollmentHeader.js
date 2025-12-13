import { Check, AlertCircle, TrendingUp } from 'lucide-react';

export default function EnrollmentHeader({ 
    loading, 
    coursesCount, 
    newEnrollmentsCount, 
    onConfirm,
    totalEnrollments,
    completedEnrollments 
}) {
    const progress = totalEnrollments > 0 
        ? (completedEnrollments / totalEnrollments) * 100 
        : 0;

    const hasNewEnrollments = newEnrollmentsCount > 0;

    return (
        <div className="space-y-4">
            {/* Stats Cards */}
            

            {/* Header with Action Button */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                            Multi-Company Course Enrollment
                        </h3>
                        <p className="text-sm text-gray-600">
                            Configure and manage company-specific enrollments for each course
                        </p>
                    </div>

                    {/* Confirm Button */}
                    <button 
                        onClick={onConfirm}
                        disabled={loading || coursesCount === 0 || !hasNewEnrollments}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg ${
                            hasNewEnrollments && !loading
                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-xl transform hover:-translate-y-0.5'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>Processing...</span>
                            </>
                        ) : (
                            <>
                                <Check className="w-5 h-5" />
                                <span>Confirm {newEnrollmentsCount > 0 ? `(${newEnrollmentsCount} new)` : 'Enrollment'}</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Progress Bar */}
                {totalEnrollments > 0 && (
                    <div className="mt-5 pt-5 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-700">
                                Overall Progress
                            </span>
                            <span className="text-sm font-bold text-blue-600">
                                {Math.round(progress)}% Complete
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                            <div 
                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-700 shadow-sm relative overflow-hidden"
                                style={{ width: `${progress}%` }}
                            >
                                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            {completedEnrollments} out of {totalEnrollments} enrollments completed
                        </p>
                    </div>
                )}

                {/* Alert for Pending */}
                {hasNewEnrollments && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-yellow-900">
                                You have {newEnrollmentsCount} pending enrollment{newEnrollmentsCount > 1 ? 's' : ''}
                            </p>
                            <p className="text-xs text-yellow-700 mt-1">
                                Review the details below and click "Confirm" to save all changes
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}