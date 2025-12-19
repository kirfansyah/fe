import React, { useState, useEffect } from 'react';
import { 
    Search,
    Home,
    ChevronRight,
    Eye,
    Filter,
    Calendar,
    User,
    Activity,
    Clock,
    AlertCircle,
    CheckCircle,
    XCircle,
    Edit,
    Trash2,
    Plus,
    Download,
    RefreshCw,
    FileText,
    Database,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import Admin from "layouts/Admin.js";

export default function AuditTrail() {
    const [loading, setLoading] = useState(false);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState('all');
    const [filterModule, setFilterModule] = useState('all');
    const [filterUser, setFilterUser] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);
    const [showFilters, setShowFilters] = useState(true); // ✅ State untuk toggle filter

    // Mock data - Replace with actual API call
    const auditData = [
        {
            id: 1,
            timestamp: '2025-12-19T10:30:45',
            user_name: 'MAULANA SAROWIS',
            employee_id: '33961',
            action: 'CREATE',
            module: 'User Management',
            table_name: 'users',
            record_id: 'USR-12345',
            description: 'Created new user account',
            ip_address: '192.168.1.100',
            device: 'Chrome 120.0 / Windows 10',
            status: 'success',
            old_value: null,
            new_value: { nama: 'John Doe', email: 'john@example.com', role: 'Trainer' },
            affected_fields: ['nama', 'email', 'role', 'is_active']
        },
        {
            id: 2,
            timestamp: '2025-12-19T10:25:30',
            user_name: 'ADMIN USER',
            employee_id: '10001',
            action: 'UPDATE',
            module: 'Menu Management',
            table_name: 'menus',
            record_id: 'MENU-14',
            description: 'Updated menu permissions',
            ip_address: '192.168.1.101',
            device: 'Firefox 121.0 / macOS',
            status: 'success',
            old_value: { menu_name: 'Mastering', is_active: true },
            new_value: { menu_name: 'Master Data', is_active: true },
            affected_fields: ['menu_name']
        },
        {
            id: 3,
            timestamp: '2025-12-19T10:20:15',
            user_name: 'TRAINER USER',
            employee_id: '20002',
            action: 'DELETE',
            module: 'Course Management',
            table_name: 'courses',
            record_id: 'CRS-567',
            description: 'Deleted course',
            ip_address: '192.168.1.102',
            device: 'Safari 17.0 / iOS',
            status: 'success',
            old_value: { course_name: 'Introduction to Python', status: 'draft' },
            new_value: null,
            affected_fields: []
        },
        {
            id: 4,
            timestamp: '2025-12-19T10:15:00',
            user_name: 'ADMIN USER',
            employee_id: '10001',
            action: 'UPDATE',
            module: 'User Management',
            table_name: 'users',
            record_id: 'USR-11111',
            description: 'Failed to update user - Invalid role',
            ip_address: '192.168.1.101',
            device: 'Firefox 121.0 / macOS',
            status: 'failed',
            old_value: { role: 'Learner A' },
            new_value: { role: 'InvalidRole' },
            affected_fields: ['role']
        },
        {
            id: 5,
            timestamp: '2025-12-19T10:10:30',
            user_name: 'MAULANA SAROWIS',
            employee_id: '33961',
            action: 'LOGIN',
            module: 'Authentication',
            table_name: 'auth_logs',
            record_id: 'AUTH-789',
            description: 'User logged in successfully',
            ip_address: '192.168.1.100',
            device: 'Chrome 120.0 / Windows 10',
            status: 'success',
            old_value: null,
            new_value: null,
            affected_fields: []
        }
    ];

    // Get unique values for filters
    const getUniqueActions = () => {
        return [...new Set(auditData.map(log => log.action))];
    };

    const getUniqueModules = () => {
        return [...new Set(auditData.map(log => log.module))];
    };

    const getUniqueUsers = () => {
        return [...new Set(auditData.map(log => log.user_name))];
    };

    // Filter data
    const filteredData = auditData.filter(log => {
        const matchesSearch = 
            log.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.record_id.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesAction = filterAction === 'all' || log.action === filterAction;
        const matchesModule = filterModule === 'all' || log.module === filterModule;
        const matchesUser = filterUser === 'all' || log.user_name === filterUser;
        const matchesStatus = filterStatus === 'all' || log.status === filterStatus;

        let matchesDate = true;
        if (dateFrom && dateTo) {
            const logDate = new Date(log.timestamp);
            matchesDate = logDate >= new Date(dateFrom) && logDate <= new Date(dateTo);
        }

        return matchesSearch && matchesAction && matchesModule && matchesUser && matchesStatus && matchesDate;
    });

    // Pagination
    const totalEntries = filteredData.length;
    const totalPages = Math.ceil(totalEntries / entriesPerPage);
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = Math.min(startIndex + entriesPerPage, totalEntries);
    const currentData = filteredData.slice(startIndex, endIndex);

    // Format datetime
    const formatDateTime = (dateTimeString) => {
        const date = new Date(dateTimeString);
        return date.toLocaleString('en-US', { 
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    // Get action icon
    const getActionIcon = (action) => {
        switch (action) {
            case 'CREATE':
                return <Plus className="w-4 h-4" />;
            case 'UPDATE':
                return <Edit className="w-4 h-4" />;
            case 'DELETE':
                return <Trash2 className="w-4 h-4" />;
            case 'LOGIN':
            case 'LOGOUT':
                return <User className="w-4 h-4" />;
            default:
                return <Activity className="w-4 h-4" />;
        }
    };

    // Get action badge color
    const getActionBadgeColor = (action) => {
        switch (action) {
            case 'CREATE':
                return 'bg-green-100 text-green-800';
            case 'UPDATE':
                return 'bg-blue-100 text-blue-800';
            case 'DELETE':
                return 'bg-red-100 text-red-800';
            case 'LOGIN':
                return 'bg-purple-100 text-purple-800';
            case 'LOGOUT':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Get status icon
    const getStatusIcon = (status) => {
        switch (status) {
            case 'success':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'failed':
                return <XCircle className="w-4 h-4 text-red-600" />;
            case 'warning':
                return <AlertCircle className="w-4 h-4 text-yellow-600" />;
            default:
                return <Clock className="w-4 h-4 text-gray-600" />;
        }
    };

    // Handle view detail
    const handleViewDetail = (log) => {
        setSelectedLog(log);
        setShowModal(true);
    };

    // Handle export
    const handleExport = () => {
        console.log('Exporting audit trail...');
    };

    // Handle refresh
    const handleRefresh = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    };

    // ✅ Check if any filter is active
    const hasActiveFilters = () => {
        return filterAction !== 'all' || 
               filterModule !== 'all' || 
               filterUser !== 'all' || 
               filterStatus !== 'all' || 
               dateFrom !== '' || 
               dateTo !== '';
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">Audit Trail</h1>
                        <p className="text-gray-600 text-sm">Track all system activities and changes</p>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                        <Home className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">Home</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">System</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900 font-medium">Audit Trail</span>
                    </div>
                </div>
            </div>

            {/* ✅ Filters Section - Collapsible */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
                {/* Filter Header - Always Visible */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-gray-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                            {hasActiveFilters() && (
                                <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                                    Active
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                        >
                            {showFilters ? (
                                <>
                                    <span>Hide Filters</span>
                                    <ChevronUp className="w-4 h-4" />
                                </>
                            ) : (
                                <>
                                    <span>Show Filters</span>
                                    <ChevronDown className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Filter Content - Collapsible */}
                {showFilters && (
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Date Range */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Calendar className="w-4 h-4 inline mr-1" />
                                    Date Range
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                    />
                                    <span className="flex items-center text-gray-500">to</span>
                                    <input
                                        type="date"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Action Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Action Type
                                </label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={filterAction}
                                    onChange={(e) => {
                                        setFilterAction(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="all">All Actions</option>
                                    {getUniqueActions().map(action => (
                                        <option key={action} value={action}>{action}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Module Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Module
                                </label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={filterModule}
                                    onChange={(e) => {
                                        setFilterModule(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="all">All Modules</option>
                                    {getUniqueModules().map(module => (
                                        <option key={module} value={module}>{module}</option>
                                    ))}
                                </select>
                            </div>

                            {/* User Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    User
                                </label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={filterUser}
                                    onChange={(e) => {
                                        setFilterUser(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="all">All Users</option>
                                    {getUniqueUsers().map(user => (
                                        <option key={user} value={user}>{user}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Status Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={filterStatus}
                                    onChange={(e) => {
                                        setFilterStatus(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="all">All Status</option>
                                    <option value="success">Success</option>
                                    <option value="failed">Failed</option>
                                    <option value="warning">Warning</option>
                                </select>
                            </div>
                        </div>

                        {/* Clear Filters Button */}
                        {hasActiveFilters() && (
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={() => {
                                        setFilterAction('all');
                                        setFilterModule('all');
                                        setFilterUser('all');
                                        setFilterStatus('all');
                                        setDateFrom('');
                                        setDateTo('');
                                        setSearchTerm('');
                                    }}
                                    className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Main Container */}
            <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6">
                    {/* Controls */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                        {/* Left Controls */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Show</span>
                                <select 
                                    className="py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={entriesPerPage}
                                    onChange={(e) => {
                                        setEntriesPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                                <span className="text-sm text-gray-600">entries</span>
                            </div>
                        </div>

                        {/* Right Controls */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleRefresh}
                                className="px-3 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2"
                                title="Refresh Data"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>

                            <button
                                onClick={handleExport}
                                className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Export
                            </button>

                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search logs..."
                                    className="w-64 pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Timestamp
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                User
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Action
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Module
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Description
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {currentData.map((log) => (
                                            <tr key={log.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2 text-sm text-gray-900">
                                                        <Clock className="w-4 h-4 text-gray-400" />
                                                        {formatDateTime(log.timestamp)}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {log.user_name}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            ID: {log.employee_id}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${getActionBadgeColor(log.action)}`}>
                                                        {getActionIcon(log.action)}
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <Database className="w-4 h-4 text-gray-400" />
                                                        <span className="text-sm text-gray-900">{log.module}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-sm text-gray-600 max-w-xs truncate" title={log.description}>
                                                        {log.description}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1">
                                                        {getStatusIcon(log.status)}
                                                        <span className={`text-xs font-medium ${
                                                            log.status === 'success' ? 'text-green-700' :
                                                            log.status === 'failed' ? 'text-red-700' :
                                                            'text-yellow-700'
                                                        }`}>
                                                            {log.status.toUpperCase()}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={() => handleViewDetail(log)}
                                                        className="p-1.5 text-gray-600 hover:text-blue-600 transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {currentData.length === 0 && (
                                            <tr>
                                                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                                                    No audit logs available
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
                                <div className="text-sm text-gray-600">
                                    Showing {totalEntries > 0 ? startIndex + 1 : 0} to {endIndex} of {totalEntries} entries
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Previous
                                    </button>
                                    
                                    {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = index + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = index + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + index;
                                        } else {
                                            pageNum = currentPage - 2 + index;
                                        }
                                        
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                                                    currentPage === pageNum
                                                        ? 'bg-blue-600 text-white'
                                                        : 'border border-gray-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                    
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages || totalPages === 0}
                                        className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Detail Modal - sama seperti sebelumnya */}
            {showModal && selectedLog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
                            <h3 className="text-lg font-semibold text-gray-900">Audit Log Details</h3>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                        <Clock className="w-3 h-3 inline mr-1" />
                                        Timestamp
                                    </label>
                                    <p className="text-sm text-gray-900">{formatDateTime(selectedLog.timestamp)}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                        <User className="w-3 h-3 inline mr-1" />
                                        User
                                    </label>
                                    <p className="text-sm text-gray-900">{selectedLog.user_name}</p>
                                    <p className="text-xs text-gray-500">ID: {selectedLog.employee_id}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                        Action Type
                                    </label>
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${getActionBadgeColor(selectedLog.action)}`}>
                                        {getActionIcon(selectedLog.action)}
                                        {selectedLog.action}
                                    </span>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                        <Database className="w-3 h-3 inline mr-1" />
                                        Module
                                    </label>
                                    <p className="text-sm text-gray-900">{selectedLog.module}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                        Table Name
                                    </label>
                                    <p className="text-sm text-gray-900 font-mono">{selectedLog.table_name}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                        Record ID
                                    </label>
                                    <p className="text-sm text-gray-900 font-mono">{selectedLog.record_id}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg col-span-2">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                        <FileText className="w-3 h-3 inline mr-1" />
                                        Description
                                    </label>
                                    <p className="text-sm text-gray-900">{selectedLog.description}</p>
                                </div>
                            </div>

                            {/* System Info */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-3">System Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                            IP Address
                                        </label>
                                        <p className="text-sm text-gray-900 font-mono">{selectedLog.ip_address}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                            Device / Browser
                                        </label>
                                        <p className="text-sm text-gray-900">{selectedLog.device}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Changed Data */}
                            {(selectedLog.old_value || selectedLog.new_value) && (
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Data Changes</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {selectedLog.old_value && (
                                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                                <label className="block text-xs font-medium text-red-700 mb-2">
                                                    Old Value
                                                </label>
                                                <pre className="text-xs text-gray-700 overflow-auto max-h-48">
                                                    {JSON.stringify(selectedLog.old_value, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                        {selectedLog.new_value && (
                                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                                <label className="block text-xs font-medium text-green-700 mb-2">
                                                    New Value
                                                </label>
                                                <pre className="text-xs text-gray-700 overflow-auto max-h-48">
                                                    {JSON.stringify(selectedLog.new_value, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Affected Fields */}
                            {selectedLog.affected_fields && selectedLog.affected_fields.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Affected Fields</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedLog.affected_fields.map((field, index) => (
                                            <span 
                                                key={index}
                                                className="inline-flex px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800 font-mono"
                                            >
                                                {field}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Status */}
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Execution Status
                                    </label>
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(selectedLog.status)}
                                        <span className={`text-sm font-semibold ${
                                            selectedLog.status === 'success' ? 'text-green-700' :
                                            selectedLog.status === 'failed' ? 'text-red-700' :
                                            'text-yellow-700'
                                        }`}>
                                            {selectedLog.status.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 rounded-b-lg">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

AuditTrail.layout = Admin;