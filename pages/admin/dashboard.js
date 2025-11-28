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
    ChevronDown
} from 'lucide-react';
import Admin from "layouts/Admin.js";
import { useRoles } from "../../hooks/useRoles";

export default function DashboardAnalytics() {
    const { fetchAnalytics } = useRoles();
    
    // Filter states
    const [monthFilter, setMonthFilter] = useState('All');
    const [courseFilter, setCourseFilter] = useState('All');
    const [coursesList, setCoursesList] = useState([]);
    
    // Dropdown states
    const [showMonthDropdown, setShowMonthDropdown] = useState(false);
    const [showCourseDropdown, setShowCourseDropdown] = useState(false);
    
    // Refs for click outside
    const monthDropdownRef = useRef(null);
    const courseDropdownRef = useRef(null);
    
    // Data states
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Month options
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

    // Fetch data when filters change
    useEffect(() => {
        loadAnalyticsData();
    }, [monthFilter, courseFilter]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target)) {
                setShowMonthDropdown(false);
            }
            if (courseDropdownRef.current && !courseDropdownRef.current.contains(event.target)) {
                setShowCourseDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadAnalyticsData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('Fetching with filters:', { month: monthFilter, course: courseFilter });
            
            // Pass filters to API
            const filters = {};
            if (monthFilter !== 'All') {
                filters.month = monthFilter;
            }
            if (courseFilter !== 'All') {
                filters.course = courseFilter;
            }
            
            const result = await fetchAnalytics(filters);
            
            console.log('API Response:', result);
            
            if (!result) {
                throw new Error('No response from server');
            }
            
            if (result.data && Array.isArray(result.data) && result.data.length > 0) {
                const apiData = result.data[0];
                
                // Extract courses list for dropdown
                if (apiData.most_accessed_courses && Array.isArray(apiData.most_accessed_courses)) {
                    const courses = apiData.most_accessed_courses.map(c => c.name);
                    setCoursesList(['All', ...courses]);
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
            passPercentage: { passed: 0, failed: 0, total: 0 },
            mostAccessedCourses: [],
            averageResults: [],
            employeeCourseResults: []
        };
    };

    const transformApiData = (apiData) => {
        const summary = apiData?.summary || {};
        const passPercentage = apiData?.overall_pass_percentage || { passed: 0, failed: 0 };
        const mostAccessed = apiData?.most_accessed_courses || [];
        const avgResults = apiData?.average_course_result || [];

        const calculateTrend = (current, previous = 0) => {
            if (current > previous) return 'up';
            if (current < previous) return 'down';
            return 'neutral';
        };

        const stats = [
            {
                id: 1,
                title: 'Total Course Active',
                value: summary.course_active || 0,
                change: '+40.1% this month',
                changeValue: summary.course_active || 0,
                trend: calculateTrend(summary.course_active || 0),
                color: 'from-slate-700 to-slate-800',
                icon: BookOpen,
                iconBg: 'bg-slate-600'
            },
            {
                id: 2,
                title: 'Total Course Inactive',
                value: summary.course_inactive || 0,
                change: '0.0% this month',
                changeValue: 0,
                trend: 'neutral',
                color: 'from-blue-500 to-blue-600',
                icon: XCircle,
                iconBg: 'bg-blue-400'
            },
            {
                id: 3,
                title: 'Total Employee Enrolled',
                value: summary.employee_enrolled || 0,
                change: '+14.1% this month',
                changeValue: summary.employee_enrolled || 0,
                trend: calculateTrend(summary.employee_enrolled || 0),
                color: 'from-teal-500 to-teal-600',
                icon: Users,
                iconBg: 'bg-teal-400'
            },
            {
                id: 4,
                title: 'Total Finished',
                value: summary.finished || 0,
                change: '37.1% this month',
                changeValue: summary.finished || 0,
                trend: calculateTrend(summary.finished || 0),
                color: 'from-amber-400 to-amber-500',
                icon: CheckCircle2,
                iconBg: 'bg-amber-300'
            },
            {
                id: 5,
                title: 'Total Unfinished',
                value: summary.unfinished || 0,
                change: '-28.3% this month',
                changeValue: summary.unfinished || 0,
                trend: (summary.unfinished || 0) < (summary.finished || 0) ? 'down' : 'up',
                color: 'from-red-400 to-red-500',
                icon: XCircle,
                iconBg: 'bg-red-300'
            }
        ];

        const transformedPassPercentage = {
            passed: passPercentage.passed || 0,
            failed: passPercentage.failed || 0,
            total: summary.finished || 0
        };

        const colors = ['bg-teal-600', 'bg-amber-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500'];
        const transformedMostAccessed = mostAccessed
            .filter(course => course && course.percentage > 0)
            .map((course, index) => ({
                name: course.name || 'Unknown',
                percentage: course.percentage || 0,
                color: colors[index % colors.length]
            }));

        const transformedAvgResults = avgResults
            .filter(result => result && result.avg_score !== null && result.avg_score !== undefined)
            .map(result => ({
                course: result.name || 'Unknown',
                score: Math.round(result.avg_score || 0)
            }));

        const employeeCourseResults = Array.from({ length: 23 }, (_, i) => ({
            score: 95 - i,
            courses: [
                Math.floor(Math.random() * 15) + 5,
                Math.floor(Math.random() * 15) + 5,
                Math.floor(Math.random() * 15) + 5
            ]
        }));

        return {
            stats,
            passPercentage: transformedPassPercentage,
            mostAccessedCourses: transformedMostAccessed,
            averageResults: transformedAvgResults,
            employeeCourseResults
        };
    };

    const handleMonthSelect = (month) => {
        setMonthFilter(month);
        setShowMonthDropdown(false);
    };

    const handleCourseSelect = (course) => {
        setCourseFilter(course);
        setShowCourseDropdown(false);
    };

    const clearFilters = () => {
        setMonthFilter('All');
        setCourseFilter('All');
    };

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
                    {/* Month Filter Dropdown */}
                    <div className="relative" ref={monthDropdownRef}>
                        <button 
                            onClick={() => {
                                setShowMonthDropdown(!showMonthDropdown);
                                setShowCourseDropdown(false);
                            }}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm min-w-[180px] justify-between"
                        >
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-medium text-gray-700">
                                    {monthFilter === 'All' ? 'Month: All' : monthFilter}
                                </span>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${showMonthDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {/* Month Dropdown Menu */}
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

                    {/* Course Filter Dropdown */}
                    <div className="relative" ref={courseDropdownRef}>
                        <button 
                            onClick={() => {
                                setShowCourseDropdown(!showCourseDropdown);
                                setShowMonthDropdown(false);
                            }}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm min-w-[200px] justify-between"
                        >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Filter className="w-4 h-4 text-gray-600 flex-shrink-0" />
                                <span className="text-sm font-medium text-gray-700 truncate">
                                    {courseFilter === 'All' ? 'Course: All' : courseFilter}
                                </span>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform flex-shrink-0 ${showCourseDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {/* Course Dropdown Menu */}
                        {showCourseDropdown && (
                            <div className="absolute top-full mt-2 w-full min-w-[250px] bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                                {coursesList.length > 0 ? (
                                    coursesList.map((course) => (
                                        <button
                                            key={course}
                                            onClick={() => handleCourseSelect(course)}
                                            className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors text-sm ${
                                                courseFilter === course ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-700'
                                            }`}
                                            title={course}
                                        >
                                            <span className="line-clamp-2">{course}</span>
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-4 py-2.5 text-sm text-gray-500">
                                        No courses available
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Clear Filters Button */}
                    {(monthFilter !== 'All' || courseFilter !== 'All') && (
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                            Clear Filters
                        </button>
                    )}

                    {/* Active Filters Badge */}
                    {(monthFilter !== 'All' || courseFilter !== 'All') && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="font-medium">Active filters:</span>
                            {monthFilter !== 'All' && (
                                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md text-xs font-medium">
                                    {monthFilter}
                                </span>
                            )}
                            {courseFilter !== 'All' && (
                                <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded-md text-xs font-medium max-w-[200px] truncate" title={courseFilter}>
                                    {courseFilter}
                                </span>
                            )}
                        </div>
                    )}
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
                            <span className="font-semibold">{stat.changeValue}</span>
                            <span className="opacity-80">{stat.change}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid lg:grid-cols-3 gap-8 mb-8">
                {/* Overall Pass Percentage */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-indigo-600" />
                        Overall Pass Percentage
                    </h3>
                    
                    <div className="flex items-center justify-center mb-6">
                        <div className="relative w-56 h-56">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="112" cy="112" r="90" stroke="#f3f4f6" strokeWidth="30" fill="none" />
                                {analyticsData.passPercentage.passed > 0 && (
                                    <circle
                                        cx="112" cy="112" r="90"
                                        stroke="#818cf8" strokeWidth="30" fill="none"
                                        strokeDasharray={`${(analyticsData.passPercentage.passed / 100) * 565} 565`}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000"
                                    />
                                )}
                                {analyticsData.passPercentage.failed > 0 && (
                                    <circle
                                        cx="112" cy="112" r="90"
                                        stroke="#e5e7eb" strokeWidth="30" fill="none"
                                        strokeDasharray={`${(analyticsData.passPercentage.failed / 100) * 565} 565`}
                                        strokeDashoffset={`-${(analyticsData.passPercentage.passed / 100) * 565}`}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000"
                                    />
                                )}
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                <span className="text-5xl font-bold text-gray-900">{analyticsData.passPercentage.total}</span>
                                <span className="text-sm text-gray-600 mt-1">Finished</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-indigo-400"></div>
                            <span className="text-sm text-gray-600">Passed ({analyticsData.passPercentage.passed}%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                            <span className="text-sm text-gray-600">Failed ({analyticsData.passPercentage.failed}%)</span>
                        </div>
                    </div>
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
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                    Employee x Courses Result
                </h3>
                
                {analyticsData.employeeCourseResults.length > 0 ? (
                    <>
                        <div className="flex items-center justify-center gap-6 mb-6 text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-pink-400"></div>
                                <span className="text-gray-600">Course 1</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-purple-400"></div>
                                <span className="text-gray-600">Course 2</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-indigo-500"></div>
                                <span className="text-gray-600">Course 3</span>
                            </div>
                        </div>

                        <div className="relative h-80 overflow-x-auto">
                            <svg className="w-full h-full" viewBox="0 0 1100 300">
                                <text x="10" y="20" fontSize="11" fill="#9ca3af">40</text>
                                <text x="10" y="70" fontSize="11" fill="#9ca3af">35</text>
                                <text x="10" y="120" fontSize="11" fill="#9ca3af">30</text>
                                <text x="10" y="170" fontSize="11" fill="#9ca3af">25</text>
                                <text x="10" y="220" fontSize="11" fill="#9ca3af">20</text>
                                <text x="10" y="270" fontSize="11" fill="#9ca3af">15</text>
                                
                                <line x1="40" y1="280" x2="1080" y2="280" stroke="#e5e7eb" strokeWidth="1" />
                                
                                {analyticsData.employeeCourseResults.map((data, index) => {
                                    const x = 50 + index * 45;
                                    const scale = 200 / 40;
                                    let currentY = 280;
                                    
                                    return data.courses.map((courseValue, courseIndex) => {
                                        const barHeight = courseValue * scale;
                                        currentY -= barHeight;
                                        const colors = ['#f472b6', '#a78bfa', '#6366f1'];
                                        return (
                                            <rect
                                                key={`${index}-${courseIndex}`}
                                                x={x} y={currentY}
                                                width="30" height={barHeight}
                                                fill={colors[courseIndex]}
                                            />
                                        );
                                    });
                                })}
                            </svg>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-80">
                        <p className="text-gray-400 text-sm">No employee course data available</p>
                    </div>
                )}
            </div>
        </div>
    );
}

DashboardAnalytics.layout = Admin;