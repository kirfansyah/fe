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
    ChevronUp,
    Lock,
    ShieldAlert
} from 'lucide-react';
import Admin from "layouts/Admin.js";
import { useDebounce } from '@/hooks/useDebounce';
import API from '@/services/api';
import { useMenuPermissions } from '@/hooks/useMenuPermissions';

export default function AuditTrail() {
    // ✅ GET PERMISSIONS FIRST
    const permissions = useMenuPermissions();
    
    const [loading, setLoading] = useState(false);
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 500);
    
    const [filterLevel, setFilterLevel] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);
    const [showFilters, setShowFilters] = useState(true);

    const [auditData, setAuditData] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 10,
        totalCount: 0,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false
    });

    

    // Fetch audit logs dengan server-side filtering
    const fetchAuditLogs = async () => {
        try {
            setLoading(true);
            
            const params = {
                page: currentPage,
                limit: pageSize,
                search: debouncedSearch,
                action_type: filterLevel === 'all' ? '' : filterLevel,
                start_date: dateFrom || '',
                end_date: dateTo || ''
            };

            const response = await API.get('/audit-trails', { params });
            
            setAuditData(response.data?.data || []);
            setPagination(response.data?.pagination || {
                currentPage: 1,
                pageSize: 10,
                totalCount: 0,
                totalPages: 1,
                hasNext: false,
                hasPrevious: false
            });
        } catch (error) {
            console.error('Error fetching audit logs:', error);
            setAuditData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuditLogs();
    }, [currentPage, pageSize, debouncedSearch, filterLevel, dateFrom, dateTo]);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, filterLevel, dateFrom, dateTo]);

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return '-';
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

    const getActionIcon = (level) => {
        switch (level) {
            case 'INFO':
                return <Activity className="w-4 h-4" />;
            case 'WARN':
                return <AlertCircle className="w-4 h-4" />;
            case 'ERROR':
                return <XCircle className="w-4 h-4" />;
            default:
                return <Activity className="w-4 h-4" />;
        }
    };

    const getActionBadgeColor = (level) => {
        switch (level) {
            case 'INFO':
                return 'bg-blue-100 text-blue-800';
            case 'WARN':
                return 'bg-yellow-100 text-yellow-800';
            case 'ERROR':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (level) => {
        switch (level) {
            case 'INFO':
                return <CheckCircle className="w-4 h-4 text-blue-600" />;
            case 'WARN':
                return <AlertCircle className="w-4 h-4 text-yellow-600" />;
            case 'ERROR':
                return <XCircle className="w-4 h-4 text-red-600" />;
            default:
                return <Clock className="w-4 h-4 text-gray-600" />;
        }
    };

    const handleViewDetail = (log) => {
        setSelectedLog(log);
        setShowModal(true);
    };

    // ✅ PERMISSION CHECK: Export hanya untuk yang punya view permission
    const handleExport = async () => {
        if (!permissions.can_view) {
            alert('You do not have permission to export audit logs');
            return;
        }

        try {
            setLoading(true);
            const params = {
                page: 1,
                limit: 99999,
                search: debouncedSearch,
                action_type: filterLevel === 'all' ? '' : filterLevel,
                start_date: dateFrom || '',
                end_date: dateTo || ''
            };

            const response = await API.get('/audit-trails', { params });
            const data = response.data?.data || [];

            const headers = ['ID', 'Date', 'Level', 'User (NIK)', 'Message', 'IP Address', 'Method'];
            const csvData = data.map(log => [
                log.id,
                formatDateTime(log.log_date),
                log.level,
                `${log.nik || 'N/A'}`,
                log.message,
                log.ip_address,
                log.method_name
            ]);

            const csv = [
                headers.join(','),
                ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n');

            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `audit-trail-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        fetchAuditLogs();
    };

    const hasActiveFilters = () => {
        return filterLevel !== 'all' || dateFrom !== '' || dateTo !== '';
    };

    const clearAllFilters = () => {
        setFilterLevel('all');
        setDateFrom('');
        setDateTo('');
        setSearchQuery('');
    };

    const handlePageSizeChange = (newSize) => {
        setPageSize(newSize);
        setCurrentPage(1);
    };

    const handleNextPage = () => {
        if (pagination.hasNext) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (pagination.hasPrevious) {
            setCurrentPage(currentPage - 1);
        }
    };
    // ✅ PERMISSION GUARD - Block entire page if no view permission
    if (!permissions.can_view) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md border border-red-200">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldAlert className="w-10 h-10 text-red-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h3>
                    <p className="text-gray-600 mb-4">
                        You do not have permission to view the Audit Trail. This section is restricted to authorized personnel only.
                    </p>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                        <p className="text-sm text-red-700 flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            Please contact your system administrator if you believe you should have access.
                        </p>
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900">Audit Trail</h1>
                            {/* ✅ VIEW ONLY BADGE if no other permissions */}
                            {permissions.can_view && !permissions.can_create && !permissions.can_edit && !permissions.can_delete && (
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full flex items-center gap-1">
                                    <Eye className="w-3 h-3" />
                                    View Only
                                </span>
                            )}
                        </div>
                        <p className="text-gray-600 text-sm mt-1">Track all system activities and changes</p>
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

            {/* Filters Section */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
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

                {showFilters && (
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Log Level
                                </label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={filterLevel}
                                    onChange={(e) => setFilterLevel(e.target.value)}
                                >
                                    <option value="all">All Levels</option>
                                    <option value="INFO">INFO</option>
                                    <option value="WARN">WARNING</option>
                                    <option value="ERROR">ERROR</option>
                                </select>
                            </div>
                        </div>

                        {hasActiveFilters() && (
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={clearAllFilters}
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
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Show</span>
                                <select 
                                    className="py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={pageSize}
                                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                                >
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                                <span className="text-sm text-gray-600">entries</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleRefresh}
                                disabled={loading}
                                className="px-3 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                                title="Refresh Data"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            </button>

                            {/* ✅ PERMISSION CHECK: Export button */}
                            {permissions.can_view && (
                                <button
                                    onClick={handleExport}
                                    disabled={loading}
                                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    <Download className="w-4 h-4" />
                                    Export
                                </button>
                            )}

                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search logs..."
                                    className="w-64 pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery !== debouncedSearch && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                    </div>
                                )}
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
                                                Level
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Method
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Message
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                IP Address
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {auditData.map((log) => (
                                            <tr key={log.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2 text-sm text-gray-900">
                                                        <Clock className="w-4 h-4 text-gray-400" />
                                                        {formatDateTime(log.log_date)}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {log.full_name || 'Unknown User'}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                NIK: {log.nik || 'N/A'}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {log.company_name || 'No Company'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${getActionBadgeColor(log.level)}`}>
                                                        {getActionIcon(log.level)}
                                                        {log.level}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <Database className="w-4 h-4 text-gray-400" />
                                                        <span className="text-sm text-gray-900 font-mono">{log.method_name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-sm text-gray-600 max-w-xs truncate" title={log.message}>
                                                        {log.message}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-xs text-gray-600 font-mono">
                                                        {log.ip_address}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {/* ✅ PERMISSION CHECK: View detail button */}
                                                    {permissions.can_view && (
                                                        <button
                                                            onClick={() => handleViewDetail(log)}
                                                            className="p-1.5 text-gray-600 hover:text-blue-600 transition-colors"
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {auditData.length === 0 && (
                                            <tr>
                                                <td colSpan="7" className="px-4 py-12 text-center">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                            <FileText className="w-8 h-8 text-gray-400" />
                                                        </div>
                                                        <p className="text-gray-500 font-medium mb-1">No audit logs available</p>
                                                        <p className="text-sm text-gray-400">
                                                            {hasActiveFilters() || searchQuery 
                                                                ? 'Try adjusting your filters or search query'
                                                                : 'System activities will appear here'
                                                            }
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
                                <div className="text-sm text-gray-600">
                                    Showing {pagination.totalCount > 0 ? ((pagination.currentPage - 1) * pagination.pageSize) + 1 : 0} to {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)} of {pagination.totalCount} entries
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handlePrevPage}
                                        disabled={!pagination.hasPrevious}
                                        className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Previous
                                    </button>
                                    
                                    <span className="text-sm text-gray-600">
                                        Page {pagination.currentPage} of {pagination.totalPages || 1}
                                    </span>
                                    
                                    <button
                                        onClick={handleNextPage}
                                        disabled={!pagination.hasNext}
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

            {/* Detail Modal */}
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
                                    <p className="text-sm text-gray-900">{formatDateTime(selectedLog.log_date)}</p>
                                </div>
                               <div className="p-4 bg-gray-50 rounded-lg">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                        <User className="w-3 h-3 inline mr-1" />
                                        User Information
                                    </label>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-900">
                                            {selectedLog.full_name || 'Unknown User'}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            NIK: {selectedLog.nik || 'N/A'}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            {selectedLog.company_name || 'No Company'}
                                        </p>
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                        Log Level
                                    </label>
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${getActionBadgeColor(selectedLog.level)}`}>
                                        {getActionIcon(selectedLog.level)}
                                        {selectedLog.level}
                                    </span>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                        Logger
                                    </label>
                                    <p className="text-sm text-gray-900 font-mono">{selectedLog.logger}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                        Method Name
                                    </label>
                                    <p className="text-sm text-gray-900 font-mono">{selectedLog.method_name}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                        Thread
                                    </label>
                                    <p className="text-sm text-gray-900 font-mono">{selectedLog.thread}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg col-span-2">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                        <FileText className="w-3 h-3 inline mr-1" />
                                        Message
                                    </label>
                                    <p className="text-sm text-gray-900">{selectedLog.message}</p>
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
                                            Device ID
                                        </label>
                                        <p className="text-sm text-gray-900">{selectedLog.device_id}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Exception */}
                            {selectedLog.exception && (
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Exception Details</h4>
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <pre className="text-xs text-gray-700 overflow-auto max-h-48 whitespace-pre-wrap">
                                            {selectedLog.exception}
                                        </pre>
                                    </div>
                                </div>
                            )}

                            {/* Status */}
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Log Level
                                    </label>
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(selectedLog.level)}
                                        <span className={`text-sm font-semibold ${
                                            selectedLog.level === 'INFO' ? 'text-blue-700' :
                                            selectedLog.level === 'WARN' ? 'text-yellow-700' :
                                            'text-red-700'
                                        }`}>
                                            {selectedLog.level}
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