import { useState, useEffect, useRef } from 'react';
import { 
    BookOpen, 
    Users, 
    CheckCircle2, 
    XCircle,
    TrendingUp,
    TrendingDown,
    Filter,
    BarChart3,
    PieChart,
    Loader2,
    ChevronDown,
    BookMarked,
    Clock,
    Calendar,
    Lock
} from 'lucide-react';
import Admin from "layouts/Admin.js";
import { useRoles } from "@/hooks/useRoles";
import { useCourses } from "@/hooks/useCourses";
import { useMenuPermissions } from "@/hooks/useMenuPermissions";

export default function DashboardAnalytics() {
    // ✅ ADD PERMISSION CHECK
    const permissions = useMenuPermissions();
    
    const { fetchAnalytics, fetchEmployeeCourseResult, fetchOverallPassPercentage } = useRoles();
    const { companies } = useCourses();
    
    const [employeeCourseData, setEmployeeCourseData] = useState(null);
    const [loadingEmployeeCourse, setLoadingEmployeeCourse] = useState(false);

    const [courseFilterEmployee, setCourseFilterEmployee] = useState('All');
    const [showCourseEmployeeDropdown, setShowCourseEmployeeDropdown] = useState(false);
    const courseEmployeeDropdownRef = useRef(null);

    const [passPercentageData, setPassPercentageData] = useState(null);
    const [loadingPassPercentage, setLoadingPassPercentage] = useState(false);

    const [coursesList, setCoursesList] = useState([]);
    const [coursesListWithId, setCoursesListWithId] = useState([]);

    
    const loadPassPercentage = async () => {
        // ✅ CHECK PERMISSION
        if (!permissions.can_view) {
            console.log('No permission to view pass percentage');
            return;
        }

        try {
            setLoadingPassPercentage(true);
            
            const filters = {};
            
            if (companyFilter !== 'All') {
                filters.company_id = companyFilter;
            }
            
            if (courseFilterPassPercentage !== 'All') {
                filters.id_course = courseFilterPassPercentage;
            }
            
            if (yearFilter !== 'All') {
                filters.year = yearFilter;
            }
            
            if (monthFilter !== 'All') {
                const monthIndex = monthOptions.indexOf(monthFilter);
                if (monthIndex > 0) {
                    filters.month = monthIndex;
                }
            }
            
            console.log('Sending filters:', filters);
            
            const result = await fetchOverallPassPercentage(filters);
            console.log('Pass Percentage Result:', result);
            
            if (result?.data && Array.isArray(result.data) && result.data.length > 0) {
                const totals = result.data.reduce((acc, course) => ({
                    in_progress: acc.in_progress + (course.in_progress || 0),
                    passed: acc.passed + (course.passed || 0),
                    failed: acc.failed + (course.failed || 0)
                }), { in_progress: 0, passed: 0, failed: 0 });
                
                setPassPercentageData(totals);
            } else {
                setPassPercentageData({ in_progress: 0, passed: 0, failed: 0 });
            }
        } catch (err) {
            console.error('Error fetching pass percentage:', err);
            setPassPercentageData({ in_progress: 0, passed: 0, failed: 0 });
        } finally {
            setLoadingPassPercentage(false);
        }
    };
    
    // Get current year and month
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonthIndex = currentDate.getMonth() + 1;
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMonthName = monthNames[currentDate.getMonth()];
    
    const [yearFilter, setYearFilter] = useState(currentYear);
    const [monthFilter, setMonthFilter] = useState(currentMonthName);
    const [companyFilter, setCompanyFilter] = useState('All');
    const [courseFilterPassPercentage, setCourseFilterPassPercentage] = useState('All');
    
    const [companiesList, setCompaniesList] = useState([{ id: 'All', company_name: 'All' }]);
    
    const [showYearDropdown, setShowYearDropdown] = useState(false);
    const [showMonthDropdown, setShowMonthDropdown] = useState(false);
    const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
    const [showCoursePassDropdown, setShowCoursePassDropdown] = useState(false);
    
    const yearDropdownRef = useRef(null);
    const monthDropdownRef = useRef(null);
    const companyDropdownRef = useRef(null);
    const coursePassDropdownRef = useRef(null);
    
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const yearOptions = ['All', ...Array.from({length: 5}, (_, i) => currentYear - i)];

    const monthOptions = [
        'All',
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ];

    useEffect(() => {
        if (companies && companies.length > 0) {
            const formattedCompanies = [
                { id: 'All', company_name: 'All' },
                ...companies
            ];
            setCompaniesList(formattedCompanies);
        }
    }, [companies]);

    useEffect(() => {
        if (permissions.can_view) {
            loadPassPercentage();
        }
    }, [companyFilter, courseFilterPassPercentage, yearFilter, monthFilter, permissions.can_view]);

    useEffect(() => {
        if (permissions.can_view) {
            loadAnalyticsData();
        }
    }, [yearFilter, monthFilter, companyFilter, permissions.can_view]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target)) {
                setShowYearDropdown(false);
            }
            if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target)) {
                setShowMonthDropdown(false);
            }
            if (companyDropdownRef.current && !companyDropdownRef.current.contains(event.target)) {
                setShowCompanyDropdown(false);
            }
            if (coursePassDropdownRef.current && !coursePassDropdownRef.current.contains(event.target)) {
                setShowCoursePassDropdown(false);
            }
            if (courseEmployeeDropdownRef.current && !courseEmployeeDropdownRef.current.contains(event.target)) {
                setShowCourseEmployeeDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadEmployeeCourseResult = async () => {
        // ✅ CHECK PERMISSION
        if (!permissions.can_view) {
            console.log('No permission to view employee course result');
            return;
        }

        try {
            setLoadingEmployeeCourse(true);
            
            const filters = {};
            
            if (companyFilter !== 'All') {
                filters.company_id = companyFilter;
            }
            
            if (courseFilterEmployee !== 'All') {
                filters.id_course = courseFilterEmployee;
            }
            
            if (yearFilter !== 'All') {
                filters.year = yearFilter;
            }
            
            if (monthFilter !== 'All') {
                const monthIndex = monthOptions.indexOf(monthFilter);
                if (monthIndex > 0) {
                    filters.month = monthIndex;
                }
            }
            
            console.log('Employee Course Filters:', filters);
            
            const result = await fetchEmployeeCourseResult(filters);
            console.log('Employee Course Result:', result);
            
            if (result?.data) {
                setEmployeeCourseData(result.data);
            } else {
                setEmployeeCourseData(null);
            }
        } catch (err) {
            console.error('Error fetching employee course result:', err);
            setEmployeeCourseData(null);
        } finally {
            setLoadingEmployeeCourse(false);
        }
    };
    
    useEffect(() => {
        if (permissions.can_view) {
            loadEmployeeCourseResult();
        }
    }, [companyFilter, courseFilterEmployee, yearFilter, monthFilter, permissions.can_view]);

    const handleCourseEmployeeSelect = (courseId) => {
        setCourseFilterEmployee(courseId);
        setShowCourseEmployeeDropdown(false);
    };

    const loadAnalyticsData = async () => {
        // ✅ CHECK PERMISSION
        if (!permissions.can_view) {
            setLoading(false);
            setError('You do not have permission to view this page');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            const filters = {};
            if (yearFilter !== 'All') {
                filters.year = yearFilter;
            }
            if (monthFilter !== 'All') {
                const monthIndex = monthOptions.indexOf(monthFilter);
                if (monthIndex > 0) {
                    filters.month = monthIndex;
                }
            }
            if (companyFilter !== 'All') {
                filters.company_id = companyFilter;
            }
            
            const result = await fetchAnalytics(filters);
            
            if (result.data) {
                const apiData = result.data;
                
                if (apiData.most_accessed_courses && Array.isArray(apiData.most_accessed_courses)) {
                    const coursesWithId = apiData.most_accessed_courses.map(c => ({
                        id: c.id_course,
                        name: c.course_title
                    }));
                    
                    setCoursesListWithId([{ id: 'All', name: 'All' }, ...coursesWithId]);
                    
                    const courseNames = apiData.most_accessed_courses.map(c => c.course_title);
                    setCoursesList(['All', ...courseNames]);
                }
                
                const transformed = transformApiData(apiData);
                setAnalyticsData(transformed);
            } else {
                setAnalyticsData(getEmptyData());
            }
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError(err.message || 'Failed to load analytics data');
            setAnalyticsData(getEmptyData());
        } finally {
            setLoading(false);
        }
    };

    // ... (rest of the helper functions remain the same: getEmptyData, transformApiData, etc.)
    const getEmptyData = () => {
        return {
            stats: [
                {
                    id: 1,
                    title: 'Total Course Active',
                    value: 0,
                    change: '0% this month',
                    changeValue: 0,
                    trend: 'neutral',
                    color: 'from-slate-700 to-slate-800',
                    icon: BookOpen,
                    iconBg: 'bg-slate-600'
                },
                {
                    id: 2,
                    title: 'Total Course Inactive',
                    value: 0,
                    change: '0% this month',
                    changeValue: 0,
                    trend: 'neutral',
                    color: 'from-blue-500 to-blue-600',
                    icon: XCircle,
                    iconBg: 'bg-blue-400'
                },
                {
                    id: 3,
                    title: 'Total Employee Enrolled',
                    value: 0,
                    change: '0% this month',
                    changeValue: 0,
                    trend: 'neutral',
                    color: 'from-teal-500 to-teal-600',
                    icon: Users,
                    iconBg: 'bg-teal-400'
                },
                {
                    id: 4,
                    title: 'Total Finished',
                    value: 0,
                    change: '0% this month',
                    changeValue: 0,
                    trend: 'neutral',
                    color: 'from-amber-400 to-amber-500',
                    icon: CheckCircle2,
                    iconBg: 'bg-amber-300'
                },
                {
                    id: 5,
                    title: 'Total Unfinished',
                    value: 0,
                    change: '0% this month',
                    changeValue: 0,
                    trend: 'neutral',
                    color: 'from-red-400 to-red-500',
                    icon: XCircle,
                    iconBg: 'bg-red-300'
                }
            ],
            mostAccessedCourses: [],
            averageResults: [],
            ebookStats: {
                total_ebook_on_library: 0,
                total_ebook_read: 0,
                total_hours_ebook_read: 0,
                average_ebook_read_month: 0
            }
        };
    };

    const transformApiData = (apiData) => {
        const summary = apiData?.summary || {};
        const mostAccessed = apiData?.most_accessed_courses || [];
        const avgResults = apiData?.average_course_result || [];
        const ebookStats = apiData?.statistik_ebook || {
            total_ebook_on_library: 0,
            total_ebook_read: 0,
            total_hours_ebook_read: 0,
            average_ebook_read_month: 0
        };

        const getTrend = (direction) => {
            if (direction === 'up') return 'up';
            if (direction === 'down') return 'down';
            return 'neutral';
        };

        const formatGrowth = (growth) => {
            if (!growth) return '0% this month';
            
            const { percentage, direction, is_new } = growth;
            
            if (is_new) {
                return '+100% (new)';
            }
            
            if (direction === 'up') {
                return `+${percentage}% this month`;
            } else if (direction === 'down') {
                return `-${percentage}% this month`;
            } else {
                return `${percentage}% this month`;
            }
        };

        const stats = [
            {
                id: 1,
                title: 'Total Course Active',
                value: summary.course_active?.value || 0,
                change: formatGrowth(summary.course_active?.growth),
                changeValue: summary.course_active?.value || 0,
                trend: getTrend(summary.course_active?.growth?.direction),
                color: 'from-slate-700 to-slate-800',
                icon: BookOpen,
                iconBg: 'bg-slate-600'
            },
            {
                id: 2,
                title: 'Total Course Inactive',
                value: summary.course_inactive?.value || 0,
                change: formatGrowth(summary.course_inactive?.growth),
                changeValue: summary.course_inactive?.value || 0,
                trend: getTrend(summary.course_inactive?.growth?.direction),
                color: 'from-blue-500 to-blue-600',
                icon: XCircle,
                iconBg: 'bg-blue-400'
            },
            {
                id: 3,
                title: 'Total Employee Enrolled',
                value: summary.employee_enrolled?.value || 0,
                change: formatGrowth(summary.employee_enrolled?.growth),
                changeValue: summary.employee_enrolled?.value || 0,
                trend: getTrend(summary.employee_enrolled?.growth?.direction),
                color: 'from-teal-500 to-teal-600',
                icon: Users,
                iconBg: 'bg-teal-400'
            },
            {
                id: 4,
                title: 'Total Finished',
                value: summary.finished?.value || 0,
                change: formatGrowth(summary.finished?.growth),
                changeValue: summary.finished?.value || 0,
                trend: getTrend(summary.finished?.growth?.direction),
                color: 'from-amber-400 to-amber-500',
                icon: CheckCircle2,
                iconBg: 'bg-amber-300'
            },
            {
                id: 5,
                title: 'Total Unfinished',
                value: summary.unfinished?.value || 0,
                change: formatGrowth(summary.unfinished?.growth),
                changeValue: summary.unfinished?.value || 0,
                trend: getTrend(summary.unfinished?.growth?.direction),
                color: 'from-red-400 to-red-500',
                icon: XCircle,
                iconBg: 'bg-red-300'
            }
        ];

        const colors = ['bg-teal-600', 'bg-amber-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500'];
        const transformedMostAccessed = mostAccessed
            .filter(course => course && course.percentage > 0)
            .map((course, index) => ({
                id: course.id_course,
                name: course.course_title || 'Unknown',
                percentage: course.percentage || 0,
                color: colors[index % colors.length]
            }));

        const transformedAvgResults = avgResults
            .filter(result => result && result.avg_score !== null && result.avg_score !== undefined)
            .map(result => ({
                course: result.course_title || 'Unknown',
                score: Math.round(result.avg_score || 0)
            }));

        return {
            stats,
            mostAccessedCourses: transformedMostAccessed,
            averageResults: transformedAvgResults,
            ebookStats
        };
    };

    const handleYearSelect = (year) => {
        setYearFilter(year);
        setShowYearDropdown(false);
    };

    const handleMonthSelect = (month) => {
        setMonthFilter(month);
        setShowMonthDropdown(false);
    };

    const handleCompanySelect = (companyId) => {
        setCompanyFilter(companyId);
        setShowCompanyDropdown(false);
    };

    const handleCoursePassSelect = (courseId) => {
        setCourseFilterPassPercentage(courseId);
        setShowCoursePassDropdown(false);
    };

    const clearFilters = () => {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                            'July', 'August', 'September', 'October', 'November', 'December'];
        const currentMonthName = monthNames[currentDate.getMonth()];
        
        setYearFilter(currentYear);
        setMonthFilter(currentMonthName);
        setCompanyFilter('All');
    };

    // ✅ HANDLE NO PERMISSION STATE
    if (!permissions.can_view) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
                    <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h3>
                    <p className="text-gray-600 mb-4">
                        You don't have permission to view this dashboard. Please contact your administrator for access.
                    </p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading analytics data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
                    <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button 
                        onClick={loadAnalyticsData}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!analyticsData) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <p className="text-gray-600">No analytics data available</p>
                    <button 
                        onClick={loadAnalyticsData}
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        Reload
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-50">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">DASHBOARD ANALYTICS</h1>
                
                {/* Filters */}
                <div className="flex gap-4 flex-wrap items-center">
                    {/* Year Filter Dropdown */}
                    <div className="relative" ref={yearDropdownRef}>
                        <button 
                            onClick={() => {
                                setShowYearDropdown(!showYearDropdown);
                                setShowMonthDropdown(false);
                                setShowCompanyDropdown(false);
                            }}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm min-w-[150px] justify-between"
                        >
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-medium text-gray-700">
                                    Year: {yearFilter}
                                </span>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${showYearDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {showYearDropdown && (
                            <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                                {yearOptions.map((year) => (
                                    <button
                                        key={year}
                                        onClick={() => handleYearSelect(year)}
                                        className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors text-sm ${
                                            yearFilter === year ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-700'
                                        }`}
                                    >
                                        {year}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Month Filter Dropdown */}
                    <div className="relative" ref={monthDropdownRef}>
                        <button 
                            onClick={() => {
                                setShowMonthDropdown(!showMonthDropdown);
                                setShowYearDropdown(false);
                                setShowCompanyDropdown(false);
                            }}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm min-w-[180px] justify-between"
                        >
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-medium text-gray-700">
                                    Month: {monthFilter}
                                </span>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${showMonthDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {showMonthDropdown && (
                            <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                                {monthOptions.map((month) => (
                                    <button
                                        key={month}
                                        onClick={() => handleMonthSelect(month)}
                                        className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors text-sm ${
                                            monthFilter === month ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-700'
                                        }`}
                                    >
                                        {month}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Company Filter Dropdown */}
                    <div className="relative" ref={companyDropdownRef}>
                        <button 
                            onClick={() => {
                                setShowCompanyDropdown(!showCompanyDropdown);
                                setShowYearDropdown(false);
                                setShowMonthDropdown(false);
                            }}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm min-w-[200px] justify-between"
                        >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Filter className="w-4 h-4 text-gray-600 flex-shrink-0" />
                                <span className="text-sm font-medium text-gray-700 truncate">
                                    {companyFilter === 'All' 
                                        ? 'Company: All' 
                                        : companiesList.find(c => c.id === companyFilter)?.company_name || companyFilter}
                                </span>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform flex-shrink-0 ${showCompanyDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {showCompanyDropdown && (
                            <div className="absolute top-full mt-2 w-full min-w-[250px] bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                                {companiesList.map((company) => (
                                    <button
                                        key={company.id}
                                        onClick={() => handleCompanySelect(company.id)}
                                        className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors text-sm ${
                                            companyFilter === company.id ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-700'
                                        }`}
                                        title={company.company_name}
                                    >
                                        <span className="line-clamp-2">{company.company_name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Clear Filters Button */}
                    {(() => {
                        const currentDate = new Date();
                        const currentYear = currentDate.getFullYear();
                        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                                            'July', 'August', 'September', 'October', 'November', 'December'];
                        const currentMonthName = monthNames[currentDate.getMonth()];
                        
                        const hasActiveFilters = yearFilter !== currentYear || 
                                                monthFilter !== currentMonthName || 
                                                companyFilter !== 'All';
                        
                        return hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                                Clear Filters
                            </button>
                        );
                    })()}

                    {/* Active Filters Badge */}
                    {(() => {
                        const currentDate = new Date();
                        const currentYear = currentDate.getFullYear();
                        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                                            'July', 'August', 'September', 'October', 'November', 'December'];
                        const currentMonthName = monthNames[currentDate.getMonth()];
                        
                        const hasActiveFilters = yearFilter !== currentYear || 
                                                monthFilter !== currentMonthName || 
                                                companyFilter !== 'All';
                        
                        return hasActiveFilters && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="font-medium">Active filters:</span>
                                {yearFilter !== currentYear && (
                                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-medium">
                                        {yearFilter}
                                    </span>
                                )}
                                {monthFilter !== currentMonthName && (
                                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md text-xs font-medium">
                                        {monthFilter}
                                    </span>
                                )}
                                {companyFilter !== 'All' && (
                                    <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded-md text-xs font-medium max-w-[200px] truncate" 
                                        title={companiesList.find(c => c.id === companyFilter)?.company_name || companyFilter}>
                                        {companiesList.find(c => c.id === companyFilter)?.company_name || companyFilter}
                                    </span>
                                )}
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* Stats Cards Grid */}
            <div className="grid lg:grid-cols-5 gap-6 mb-8">
                {analyticsData.stats.map((stat) => (
                    <div
                        key={stat.id}
                        className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`${stat.iconBg} p-3 rounded-xl`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                            <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                                {stat.trend === 'up' && <TrendingUp className="w-5 h-5 text-white" />}
                                {stat.trend === 'down' && <TrendingDown className="w-5 h-5 text-white" />}
                                {stat.trend === 'neutral' && <div className="w-5 h-0.5 bg-white"></div>}
                            </div>
                        </div>
                        
                        <h3 className="text-4xl font-bold mb-2">{stat.value}</h3>
                        <p className="text-sm opacity-90 mb-3">{stat.title}</p>
                        
                        <div className="flex items-center gap-2 text-xs">
                            {stat.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                            {stat.trend === 'down' && <TrendingDown className="w-3 h-3" />}
                            <span className={`font-semibold ${
                                stat.trend === 'up' ? 'text-green-200' : 
                                stat.trend === 'down' ? 'text-red-200' : 
                                'text-white'
                            }`}>
                                {stat.changeValue}
                            </span>
                            <span className="opacity-80">{stat.change}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid lg:grid-cols-3 gap-8 mb-8">
                {/* Overall Pass Percentage with Course Filter */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-indigo-600" />
                            Overall Pass Percentage
                        </h3>
                        
                        {/* Course Filter for Pass Percentage */}
                        <div className="relative" ref={coursePassDropdownRef}>
                            <button 
                                onClick={() => setShowCoursePassDropdown(!showCoursePassDropdown)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-xs"
                            >
                                <Filter className="w-3 h-3 text-gray-600" />
                                <span className="text-gray-700 font-medium max-w-[100px] truncate">
                                    {courseFilterPassPercentage === 'All' 
                                        ? 'All' 
                                        : coursesListWithId.find(c => c.id === courseFilterPassPercentage)?.name || 'Select'}
                                </span>
                                <ChevronDown className={`w-3 h-3 text-gray-600 transition-transform ${showCoursePassDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {showCoursePassDropdown && (
                                <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                                    {coursesListWithId.length > 0 ? (
                                        coursesListWithId.map((course) => (
                                            <button
                                                key={course.id}
                                                onClick={() => handleCoursePassSelect(course.id)}
                                                className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors text-xs ${
                                                    courseFilterPassPercentage === course.id ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-700'
                                                }`}
                                                title={course.name}
                                            >
                                                <span className="line-clamp-2">{course.name}</span>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-3 py-2 text-xs text-gray-500">
                                            No courses available
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* ✅ Loading State */}
                    {loadingPassPercentage ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                        </div>
                    ) : passPercentageData ? (
                        <>
                            {/* ✅ Use passPercentageData instead of analyticsData.passPercentage */}
                            <div className="flex items-center justify-center mb-6">
                                <div className="relative w-56 h-56">
                                    {(() => {
                                        const total = (passPercentageData.in_progress || 0) + 
                                                     (passPercentageData.passed || 0) + 
                                                     (passPercentageData.failed || 0);
                                        
                                        return (
                                            <>
                                                <svg className="w-full h-full transform -rotate-90">
                                                    <circle cx="112" cy="112" r="90" stroke="#f3f4f6" strokeWidth="30" fill="none" />
                                                    {total > 0 && (
                                                        <>
                                                            {/* Passed segment */}
                                                            {passPercentageData.passed > 0 && (
                                                                <circle
                                                                    cx="112" cy="112" r="90"
                                                                    stroke="#22c55e" strokeWidth="30" fill="none"
                                                                    strokeDasharray={`${(passPercentageData.passed / total) * 565} 565`}
                                                                    strokeLinecap="round"
                                                                    className="transition-all duration-1000"
                                                                />
                                                            )}
                                                            {/* In Progress segment */}
                                                            {passPercentageData.in_progress > 0 && (
                                                                <circle
                                                                    cx="112" cy="112" r="90"
                                                                    stroke="#eab308" strokeWidth="30" fill="none"
                                                                    strokeDasharray={`${(passPercentageData.in_progress / total) * 565} 565`}
                                                                    strokeDashoffset={`-${(passPercentageData.passed / total) * 565}`}
                                                                    strokeLinecap="round"
                                                                    className="transition-all duration-1000"
                                                                />
                                                            )}
                                                            {/* Failed segment */}
                                                            {passPercentageData.failed > 0 && (
                                                                <circle
                                                                    cx="112" cy="112" r="90"
                                                                    stroke="#ef4444" strokeWidth="30" fill="none"
                                                                    strokeDasharray={`${(passPercentageData.failed / total) * 565} 565`}
                                                                    strokeDashoffset={`-${((passPercentageData.passed + passPercentageData.in_progress) / total) * 565}`}
                                                                    strokeLinecap="round"
                                                                    className="transition-all duration-1000"
                                                                />
                                                            )}
                                                        </>
                                                    )}
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                                    <span className="text-5xl font-bold text-gray-900">{total}</span>
                                                    <span className="text-sm text-gray-600 mt-1">Total</span>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                {(() => {
                                    const total = (passPercentageData.in_progress || 0) + 
                                                 (passPercentageData.passed || 0) + 
                                                 (passPercentageData.failed || 0);
                                    
                                    return (
                                        <>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                                    <span className="text-sm text-gray-600">Passed</span>
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {passPercentageData.passed} ({total > 0 ? Math.round((passPercentageData.passed / total) * 100) : 0}%)
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                                    <span className="text-sm text-gray-600">In Progress</span>
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {passPercentageData.in_progress} ({total > 0 ? Math.round((passPercentageData.in_progress / total) * 100) : 0}%)
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                                    <span className="text-sm text-gray-600">Failed</span>
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {passPercentageData.failed} ({total > 0 ? Math.round((passPercentageData.failed / total) * 100) : 0}%)
                                                </span>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-64">
                            <p className="text-gray-400 text-sm">No pass percentage data available</p>
                        </div>
                    )}
                </div>

                {/* Most Accessed Courses */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-teal-600" />
                        Most Accessed Courses
                    </h3>
                    
                    {analyticsData.mostAccessedCourses.length > 0 ? (
                        <>
                            <div className="flex items-center justify-center mb-6">
                                <div className="relative w-56 h-56">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="112" cy="112" r="90" stroke="#f3f4f6" strokeWidth="30" fill="none" />
                                        {analyticsData.mostAccessedCourses.map((course, index) => {
                                            const circumference = 565;
                                            const strokeDasharray = (course.percentage / 100) * circumference;
                                            const previousPercentages = analyticsData.mostAccessedCourses
                                                .slice(0, index)
                                                .reduce((sum, c) => sum + c.percentage, 0);
                                            const strokeDashoffset = -(previousPercentages / 100) * circumference;
                                            
                                            const colorMap = {
                                                'bg-teal-600': '#0d9488',
                                                'bg-amber-500': '#f59e0b',
                                                'bg-blue-500': '#3b82f6',
                                                'bg-purple-500': '#a855f7',
                                                'bg-pink-500': '#ec4899'
                                            };
                                            
                                            return (
                                                <circle
                                                    key={index}
                                                    cx="112" cy="112" r="90"
                                                    stroke={colorMap[course.color]}
                                                    strokeWidth="30" fill="none"
                                                    strokeDasharray={`${strokeDasharray} ${circumference}`}
                                                    strokeDashoffset={strokeDashoffset}
                                                    strokeLinecap="round"
                                                />
                                            );
                                        })}
                                    </svg>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {analyticsData.mostAccessedCourses.map((course, index) => (
                                    <div key={index} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${course.color}`}></div>
                                            <span className="text-gray-700 truncate" title={course.name}>
                                                {course.name}
                                            </span>
                                        </div>
                                        <span className="font-semibold text-gray-900 ml-2 flex-shrink-0">{course.percentage}%</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-64">
                            <p className="text-gray-400 text-sm">No course access data available</p>
                        </div>
                    )}
                </div>

                {/* Average Courses Result */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-amber-600" />
                        Average Courses Result
                    </h3>
                    
                    {analyticsData.averageResults.length > 0 ? (
                        <>
                            <div className="relative h-52 mb-4">
                                <svg className="w-full h-full" viewBox="0 0 300 180">
                                    <text x="5" y="15" fontSize="10" fill="#9ca3af">100</text>
                                    <text x="10" y="60" fontSize="10" fill="#9ca3af">75</text>
                                    <text x="10" y="105" fontSize="10" fill="#9ca3af">50</text>
                                    <text x="10" y="150" fontSize="10" fill="#9ca3af">25</text>
                                    <text x="15" y="175" fontSize="10" fill="#9ca3af">0</text>
                                    
                                    <line x1="35" y1="10" x2="290" y2="10" stroke="#f3f4f6" strokeWidth="1" />
                                    <line x1="35" y1="55" x2="290" y2="55" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="3,3" />
                                    <line x1="35" y1="100" x2="290" y2="100" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="3,3" />
                                    <line x1="35" y1="145" x2="290" y2="145" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="3,3" />
                                    <line x1="35" y1="170" x2="290" y2="170" stroke="#f3f4f6" strokeWidth="1" />
                                    
                                    {analyticsData.averageResults.length > 1 && (
                                        <path
                                            d={analyticsData.averageResults.map((result, index) => {
                                                const spacing = 220 / (analyticsData.averageResults.length - 1);
                                                const x = 70 + (index * spacing);
                                                const y = 170 - (result.score * 1.6);
                                                return `${index === 0 ? 'M' : 'L'} ${x},${y}`;
                                            }).join(' ')}
                                            fill="none"
                                            stroke="#9ca3af"
                                            strokeWidth="2"
                                        />
                                    )}
                                    
                                    {analyticsData.averageResults.map((result, index) => {
                                        const spacing = analyticsData.averageResults.length > 1 
                                            ? 220 / (analyticsData.averageResults.length - 1) 
                                            : 0;
                                        const x = analyticsData.averageResults.length === 1 
                                            ? 150 
                                            : 70 + (index * spacing);
                                        const y = 170 - (result.score * 1.6);
                                        const colors = ['#6366f1', '#14b8a6', '#f59e0b', '#a855f7', '#ec4899'];
                                        
                                        return (
                                            <g key={index}>
                                                <circle 
                                                    cx={x} cy={y} r="5" 
                                                    fill={colors[index % colors.length]} 
                                                    stroke="white" strokeWidth="2" 
                                                />
                                                <text 
                                                    x={x} y={y - 8} 
                                                    fontSize="9" fill="#4b5563" 
                                                    textAnchor="middle"
                                                >
                                                    {result.score}
                                                </text>
                                            </g>
                                        );
                                    })}
                                </svg>
                            </div>

                            <div className="space-y-1">
                                {analyticsData.averageResults.map((result, index) => {
                                    const colors = ['bg-indigo-500', 'bg-teal-500', 'bg-amber-500', 'bg-purple-500', 'bg-pink-500'];
                                    return (
                                        <div key={index} className="flex items-center gap-2 text-xs">
                                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${colors[index % colors.length]}`}></div>
                                            <span className="text-gray-600 truncate" title={result.course}>
                                                {result.course}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-64">
                            <p className="text-gray-400 text-sm">No average results available</p>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Employee x Courses Result */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-indigo-600" />
                        Employee x Courses Result
                    </h3>
                    
                    {/* Course Filter Dropdown */}
                    <div className="relative" ref={courseEmployeeDropdownRef}>
                        <button 
                            onClick={() => setShowCourseEmployeeDropdown(!showCourseEmployeeDropdown)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-xs"
                        >
                            <Filter className="w-3 h-3 text-gray-600" />
                            <span className="text-gray-700 font-medium max-w-[150px] truncate">
                                {courseFilterEmployee === 'All' 
                                    ? 'All Courses' 
                                    : coursesListWithId.find(c => c.id === courseFilterEmployee)?.name || 'Select'}
                            </span>
                            <ChevronDown className={`w-3 h-3 text-gray-600 transition-transform ${showCourseEmployeeDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {showCourseEmployeeDropdown && (
                            <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                                {coursesListWithId.length > 0 ? (
                                    coursesListWithId.map((course) => (
                                        <button
                                            key={course.id}
                                            onClick={() => handleCourseEmployeeSelect(course.id)}
                                            className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors text-xs ${
                                                courseFilterEmployee === course.id ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-700'
                                            }`}
                                            title={course.name}
                                        >
                                            <span className="line-clamp-2">{course.name}</span>
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-3 py-2 text-xs text-gray-500">
                                        No courses available
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                
                {loadingEmployeeCourse ? (
                    <div className="flex items-center justify-center h-80">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    </div>
                ) : employeeCourseData && employeeCourseData.employee_groups?.length > 0 ? (
                    <>
                        {/* Summary Stats */}
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Users className="w-5 h-5 text-indigo-600" />
                                    <span className="text-sm text-gray-600">Total Employees:</span>
                                    <span className="text-lg font-bold text-gray-900">{employeeCourseData.total_employee}</span>
                                </div>
                            </div>
                        </div>

                        {/* Course Legend - Dynamic based on API data */}
                        {(() => {
                            // Collect all unique course names from all groups
                            const allCourses = new Set();
                            employeeCourseData.employee_groups.forEach(group => {
                                Object.keys(group.employees_by_course || {}).forEach(course => {
                                    allCourses.add(course);
                                });
                            });
                            const courseArray = Array.from(allCourses);
                            const colors = ['bg-pink-400', 'bg-purple-400', 'bg-indigo-500', 'bg-teal-400', 'bg-amber-400', 'bg-green-400'];
                            
                            return (
                                <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
                                    {courseArray.map((course, index) => (
                                        <div key={course} className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded ${colors[index % colors.length]}`}></div>
                                            <span className="text-xs text-gray-600 max-w-[150px] truncate" title={course}>
                                                {course}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}

                        {/* Chart */}
                        <div className="relative h-80 overflow-x-auto">
                            {(() => {
                                // Collect all unique course names
                                const allCourses = new Set();
                                employeeCourseData.employee_groups.forEach(group => {
                                    Object.keys(group.employees_by_course || {}).forEach(course => {
                                        allCourses.add(course);
                                    });
                                });
                                const courseArray = Array.from(allCourses);
                                const colors = ['#f472b6', '#a78bfa', '#6366f1', '#2dd4bf', '#fbbf24', '#4ade80'];
                                
                                // Find max value for scaling
                                let maxValue = 0;
                                employeeCourseData.employee_groups.forEach(group => {
                                    const total = Object.values(group.employees_by_course || {}).reduce((a, b) => a + b, 0);
                                    if (total > maxValue) maxValue = total;
                                });
                                maxValue = Math.max(maxValue, 10); // Minimum scale of 10
                                
                                const chartWidth = Math.max(600, employeeCourseData.employee_groups.length * 80 + 100);
                                
                                return (
                                    <svg className="w-full h-full" viewBox={`0 0 ${chartWidth} 300`} preserveAspectRatio="xMinYMid meet">
                                        {/* Y-axis labels */}
                                        {[0, 1, 2, 3, 4].map((i) => {
                                            const value = Math.round(maxValue - (maxValue / 4) * i);
                                            const y = 20 + i * 60;
                                            return (
                                                <g key={i}>
                                                    <text x="25" y={y + 5} fontSize="11" fill="#9ca3af" textAnchor="end">
                                                        {value}
                                                    </text>
                                                    <line x1="40" y1={y} x2={chartWidth - 20} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray={i > 0 ? "3,3" : "0"} />
                                                </g>
                                            );
                                        })}
                                        
                                        {/* X-axis line */}
                                        <line x1="40" y1="260" x2={chartWidth - 20} y2="260" stroke="#e5e7eb" strokeWidth="1" />
                                        
                                        {/* Bars */}
                                        {employeeCourseData.employee_groups.map((group, groupIndex) => {
                                            const barWidth = 50;
                                            const x = 60 + groupIndex * 70;
                                            const scale = 220 / maxValue;
                                            let currentY = 260;
                                            
                                            return (
                                                <g key={groupIndex}>
                                                    {/* Stacked bars for each course */}
                                                    {courseArray.map((course, courseIndex) => {
                                                        const value = group.employees_by_course?.[course] || 0;
                                                        if (value === 0) return null;
                                                        
                                                        const barHeight = value * scale;
                                                        currentY -= barHeight;
                                                        
                                                        return (
                                                            <g key={`${groupIndex}-${courseIndex}`}>
                                                                <rect
                                                                    x={x}
                                                                    y={currentY}
                                                                    width={barWidth}
                                                                    height={barHeight}
                                                                    fill={colors[courseIndex % colors.length]}
                                                                    rx="2"
                                                                />
                                                                {/* Value label inside bar if space allows */}
                                                                {barHeight > 15 && (
                                                                    <text
                                                                        x={x + barWidth / 2}
                                                                        y={currentY + barHeight / 2 + 4}
                                                                        fontSize="10"
                                                                        fill="white"
                                                                        textAnchor="middle"
                                                                    >
                                                                        {value}
                                                                    </text>
                                                                )}
                                                            </g>
                                                        );
                                                    })}
                                                    
                                                    {/* X-axis label (Score) */}
                                                    <text
                                                        x={x + barWidth / 2}
                                                        y="278"
                                                        fontSize="10"
                                                        fill="#6b7280"
                                                        textAnchor="middle"
                                                    >
                                                        Score: {group.best_score}
                                                    </text>
                                                </g>
                                            );
                                        })}
                                    </svg>
                                );
                            })()}
                        </div>
                        
                        {/* Data Table */}
                        <div className="mt-6 overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-2 px-3 font-semibold text-gray-700">Best Score</th>
                                        <th className="text-left py-2 px-3 font-semibold text-gray-700">Course</th>
                                        <th className="text-right py-2 px-3 font-semibold text-gray-700">Employees</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employeeCourseData.employee_groups.map((group, groupIndex) => (
                                        Object.entries(group.employees_by_course || {}).map(([course, count], courseIndex) => (
                                            <tr key={`${groupIndex}-${courseIndex}`} className="border-b border-gray-100 hover:bg-gray-50">
                                                {courseIndex === 0 && (
                                                    <td 
                                                        className="py-2 px-3 font-medium text-gray-900"
                                                        rowSpan={Object.keys(group.employees_by_course || {}).length}
                                                    >
                                                        {group.best_score}
                                                    </td>
                                                )}
                                                <td className="py-2 px-3 text-gray-600">{course}</td>
                                                <td className="py-2 px-3 text-right font-medium text-gray-900">{count}</td>
                                            </tr>
                                        ))
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-80">
                        <p className="text-gray-400 text-sm">No employee course data available</p>
                    </div>
                )}
            </div>

            {/* E-Book Statistics */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <BookMarked className="w-5 h-5 text-purple-600" />
                    E-Book Statistics
                </h3>

                <div className="grid md:grid-cols-4 lg:grid-cols-4 gap-6">
                    {/* Total E-Books in Library */}
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                        <div className="flex items-start justify-between mb-4">
                            <div className="bg-purple-400 p-3 rounded-lg">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <h4 className="text-3xl font-bold mb-2">{analyticsData.ebookStats.total_ebook_on_library}</h4>
                        <p className="text-sm opacity-90">Total E-Books in Library</p>
                    </div>

                    {/* Total E-Books Read */}
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                        <div className="flex items-start justify-between mb-4">
                            <div className="bg-blue-400 p-3 rounded-lg">
                                <BookMarked className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <h4 className="text-3xl font-bold mb-2">{analyticsData.ebookStats.total_ebook_read}</h4>
                        <p className="text-sm opacity-90">Total E-Books Read</p>
                    </div>

                    {/* Total Hours Read */}
                    <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-6 text-white">
                        <div className="flex items-start justify-between mb-4">
                            <div className="bg-teal-400 p-3 rounded-lg">
                                <Clock className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <h4 className="text-3xl font-bold mb-2">{analyticsData.ebookStats.total_hours_ebook_read}</h4>
                        <p className="text-sm opacity-90">Total Hours Reading</p>
                    </div>

                    {/* Average E-Books per Month */}
                    <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white">
                        <div className="flex items-start justify-between mb-4">
                            <div className="bg-amber-400 p-3 rounded-lg">
                                <Calendar className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <h4 className="text-3xl font-bold mb-2">{analyticsData.ebookStats.average_ebook_read_month}</h4>
                        <p className="text-sm opacity-90">Avg E-Books Read/Month</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

DashboardAnalytics.layout = Admin;