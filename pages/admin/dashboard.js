import { useState } from 'react';
import { 
    BookOpen, 
    Users, 
    CheckCircle2, 
    XCircle,
    TrendingUp,
    TrendingDown,
    Filter,
    BarChart3,
    PieChart
} from 'lucide-react';
import Admin from "layouts/Admin.js";
export default function DashboardAnalytics() {
    const [monthFilter, setMonthFilter] = useState('All');
    const [courseFilter, setCourseFilter] = useState('All');

    // Mock data
    const analyticsData = {
        stats: [
            {
                id: 1,
                title: 'Total Course Active',
                value: 4,
                change: '+40.1% this month',
                changeValue: 4,
                trend: 'up',
                color: 'from-slate-700 to-slate-800',
                icon: BookOpen,
                iconBg: 'bg-slate-600'
            },
            {
                id: 2,
                title: 'Total Course Inactive',
                value: 0,
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
                value: 663,
                change: '+14.1% this month',
                changeValue: 201,
                trend: 'up',
                color: 'from-teal-500 to-teal-600',
                icon: Users,
                iconBg: 'bg-teal-400'
            },
            {
                id: 4,
                title: 'Total Finished',
                value: 636,
                change: '37.1% this month',
                changeValue: 302,
                trend: 'up',
                color: 'from-amber-400 to-amber-500',
                icon: CheckCircle2,
                iconBg: 'bg-amber-300'
            },
            {
                id: 5,
                title: 'Total Unfinished',
                value: 27,
                change: '-28.3% this month',
                changeValue: 223,
                trend: 'down',
                color: 'from-red-400 to-red-500',
                icon: XCircle,
                iconBg: 'bg-red-300'
            }
        ],
        passPercentage: {
            passed: 81,
            failed: 19,
            total: 636
        },
        mostAccessedCourses: [
            { name: 'Pengenalan Lingkungan Kerja', percentage: 61, color: 'bg-teal-600' },
            { name: 'Keselamatan Kerja Tingkat Dasar', percentage: 30, color: 'bg-amber-500' },
            { name: 'Teknik Dasar Pengelasan', percentage: 9, color: 'bg-blue-500' }
        ],
        averageResults: [
            { course: 'Pengenalan Lingkungan Kerja', score: 90 },
            { course: 'Keselamatan Kerja Tingkat Dasar', score: 73 },
            { course: 'Teknik Dasar Pengelasan', score: 93 }
        ],
        employeeCourseResults: Array.from({ length: 23 }, (_, i) => ({
            score: 95 - i,
            courses: [
                Math.floor(Math.random() * 15) + 5,
                Math.floor(Math.random() * 15) + 5,
                Math.floor(Math.random() * 15) + 5
            ]
        }))
    };

    return (
        <div className="p-8 bg-gray-50">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">DASHBOARD ANALYTICS</h1>
                
                {/* Filters */}
                <div className="flex gap-4">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                        <Filter className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Month Filter</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                        <Filter className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Course Filter</span>
                    </button>
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
                            {/* Donut Chart */}
                            <svg className="w-full h-full transform -rotate-90">
                                {/* Background circle */}
                                <circle
                                    cx="112"
                                    cy="112"
                                    r="90"
                                    stroke="#f3f4f6"
                                    strokeWidth="30"
                                    fill="none"
                                />
                                {/* Passed segment (81%) */}
                                <circle
                                    cx="112"
                                    cy="112"
                                    r="90"
                                    stroke="#818cf8"
                                    strokeWidth="30"
                                    fill="none"
                                    strokeDasharray={`${(analyticsData.passPercentage.passed / 100) * 565} 565`}
                                    strokeLinecap="round"
                                    className="transition-all duration-1000"
                                />
                                {/* Failed segment (19%) */}
                                <circle
                                    cx="112"
                                    cy="112"
                                    r="90"
                                    stroke="#e5e7eb"
                                    strokeWidth="30"
                                    fill="none"
                                    strokeDasharray={`${(analyticsData.passPercentage.failed / 100) * 565} 565`}
                                    strokeDashoffset={`-${(analyticsData.passPercentage.passed / 100) * 565}`}
                                    strokeLinecap="round"
                                    className="transition-all duration-1000"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                <span className="text-5xl font-bold text-gray-900">{analyticsData.passPercentage.total}</span>
                                <span className="text-sm text-gray-600 mt-1">Finished</span>
                            </div>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-indigo-400"></div>
                            <span className="text-sm text-gray-600">Passed</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                            <span className="text-sm text-gray-600">Failed</span>
                        </div>
                    </div>
                </div>

                {/* Most Accessed Courses */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-teal-600" />
                        Most Accessed Courses
                    </h3>
                    
                    <div className="flex items-center justify-center mb-6">
                        <div className="relative w-56 h-56">
                            {/* Donut Chart */}
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="112" cy="112" r="90" stroke="#f3f4f6" strokeWidth="30" fill="none" />
                                {/* Course 1 - 61% */}
                                <circle
                                    cx="112" cy="112" r="90"
                                    stroke="#0d9488"
                                    strokeWidth="30" fill="none"
                                    strokeDasharray="345 565"
                                    strokeLinecap="round"
                                />
                                {/* Course 2 - 30% */}
                                <circle
                                    cx="112" cy="112" r="90"
                                    stroke="#f59e0b"
                                    strokeWidth="30" fill="none"
                                    strokeDasharray="170 565"
                                    strokeDashoffset="-345"
                                    strokeLinecap="round"
                                />
                                {/* Course 3 - 9% */}
                                <circle
                                    cx="112" cy="112" r="90"
                                    stroke="#3b82f6"
                                    strokeWidth="30" fill="none"
                                    strokeDasharray="50 565"
                                    strokeDashoffset="-515"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="space-y-2">
                        {analyticsData.mostAccessedCourses.map((course, index) => (
                            <div key={index} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${course.color}`}></div>
                                    <span className="text-gray-700">{course.name}</span>
                                </div>
                                <span className="font-semibold text-gray-900">{course.percentage}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Average Courses Result */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-amber-600" />
                        Average Courses Result
                    </h3>
                    
                    <div className="relative h-52 mb-4">
                        <svg className="w-full h-full" viewBox="0 0 300 180">
                            {/* Y-axis labels */}
                            <text x="5" y="15" fontSize="10" fill="#9ca3af">100</text>
                            <text x="10" y="60" fontSize="10" fill="#9ca3af">75</text>
                            <text x="10" y="105" fontSize="10" fill="#9ca3af">50</text>
                            <text x="10" y="150" fontSize="10" fill="#9ca3af">25</text>
                            <text x="15" y="175" fontSize="10" fill="#9ca3af">0</text>
                            
                            {/* Grid lines */}
                            <line x1="35" y1="10" x2="290" y2="10" stroke="#f3f4f6" strokeWidth="1" />
                            <line x1="35" y1="55" x2="290" y2="55" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="3,3" />
                            <line x1="35" y1="100" x2="290" y2="100" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="3,3" />
                            <line x1="35" y1="145" x2="290" y2="145" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="3,3" />
                            <line x1="35" y1="170" x2="290" y2="170" stroke="#f3f4f6" strokeWidth="1" />
                            
                            {/* Line chart */}
                            <path
                                d="M 70,26 L 165,92 L 260,20"
                                fill="none"
                                stroke="#9ca3af"
                                strokeWidth="2"
                            />
                            
                            {/* Points */}
                            <circle cx="70" cy="26" r="5" fill="#6366f1" stroke="white" strokeWidth="2" />
                            <circle cx="165" cy="92" r="5" fill="#14b8a6" stroke="white" strokeWidth="2" />
                            <circle cx="260" cy="20" r="5" fill="#f59e0b" stroke="white" strokeWidth="2" />
                            
                            {/* Labels */}
                            <text x="68" y="18" fontSize="9" fill="#4b5563" textAnchor="middle">90</text>
                            <text x="165" y="110" fontSize="9" fill="#4b5563" textAnchor="middle">73</text>
                            <text x="260" y="12" fontSize="9" fill="#4b5563" textAnchor="middle">93</text>
                        </svg>
                    </div>

                    {/* Legend */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                            <span className="text-gray-600">Pengenalan Lingkungan Kerja</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                            <span className="text-gray-600">Keselamatan Kerja Tingkat Dasar</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                            <span className="text-gray-600">Teknik Dasar Pengelasan</span>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Employee x Courses Result - Stacked Bar Chart */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                    Employee x Courses Result
                </h3>
                
                {/* Legend */}
                <div className="flex items-center justify-center gap-6 mb-6 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-pink-400"></div>
                        <span className="text-gray-600">Teknik Dasar Pengelasan</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-purple-400"></div>
                        <span className="text-gray-600">Keselamatan Kerja Tingkat Dasar</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-indigo-500"></div>
                        <span className="text-gray-600">Pengenalan Lingkungan Kerja</span>
                    </div>
                </div>

                {/* Stacked Bar Chart */}
                <div className="relative h-80">
                    <svg className="w-full h-full" viewBox="0 0 1100 300">
                        {/* Y-axis labels */}
                        <text x="10" y="20" fontSize="11" fill="#9ca3af">40</text>
                        <text x="10" y="70" fontSize="11" fill="#9ca3af">35</text>
                        <text x="10" y="120" fontSize="11" fill="#9ca3af">30</text>
                        <text x="10" y="170" fontSize="11" fill="#9ca3af">25</text>
                        <text x="10" y="220" fontSize="11" fill="#9ca3af">20</text>
                        <text x="10" y="270" fontSize="11" fill="#9ca3af">15</text>
                        
                        {/* Grid */}
                        <line x1="40" y1="280" x2="1080" y2="280" stroke="#e5e7eb" strokeWidth="1" />
                        
                        {/* Stacked Bars */}
                        {analyticsData.employeeCourseResults.map((data, index) => {
                            const x = 50 + index * 45;
                            const total = data.courses.reduce((a, b) => a + b, 0);
                            const scale = 200 / 40; // max height / max value
                            
                            let currentY = 280;
                            
                            return data.courses.map((courseValue, courseIndex) => {
                                const barHeight = courseValue * scale;
                                currentY -= barHeight;
                                const colors = ['#f472b6', '#a78bfa', '#6366f1']; // pink, purple, indigo
                                return (<rect
                                    key={`${index}-${courseIndex}`}
                                    x={x}
                                    y={currentY}
                                    width="30"
                                    height={barHeight}
                                    fill={colors[courseIndex]}
                                />);
                            }
                            );
                        }
                        )}
                    </svg>
                </div>
            </div>
            
        </div>
    );
}
DashboardAnalytics.layout = Admin;