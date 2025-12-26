import React, { useState, useEffect, useContext } from 'react';
import { 
    Edit,
    Search,
    Home,
    ChevronRight,
    Eye,
    Building,
    Users,
    RefreshCw,
    Lock,
    Shield
} from 'lucide-react';
import Admin from "layouts/Admin.js";
import { useCourses } from "@/hooks/useCourses";
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { useRoles } from "../../hooks/useRoles";
import { ProfileContext } from '@/contexts/profile/ProfileContext';
import { getDeviceInfo } from '@/lib/deviceHelper';
import { useMenuPermissions } from '@/hooks/useMenuPermissions';

export default function UserManagement() {
    // ✅ ALL HOOKS FIRST (before any conditional returns)
    const { employeeData, fetchEmployeeData, loading: apiLoading } = useCourses();
    const { roles: masterRoles, handleUpdateUser } = useRoles();
    const { showLoading, showSuccess, showError, confirmAction } = useSweetAlert();
    const { dataKaryawan } = useContext(ProfileContext);
    const permissions = useMenuPermissions();
    
    const [loading, setLoading] = useState(true);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterCompany, setFilterCompany] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('view');
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({ 
        employee_id: '',
        nama: '',
        no_ktp: '',
        id_role: null,
        user_is_active: true,
    });

    const availableRoles = masterRoles || [];

    // ✅ ALL useEffect hooks
    useEffect(() => {
        if (employeeData) {
            setLoading(false);
        }
    }, [employeeData]);

    // ✅ ALL FUNCTIONS
    const getUniqueRoles = () => {
        if (!employeeData?.data) return [];
        const roles = new Set();
        employeeData.data.forEach(emp => {
            emp.roles?.forEach(role => roles.add(role.role_name));
        });
        return Array.from(roles);
    };

    const getUniqueCompanies = () => {
        if (!employeeData?.data) return [];
        const companies = new Map();
        employeeData.data.forEach(emp => {
            if (emp.company_id && emp.company_name) {
                companies.set(emp.company_id, emp.company_name);
            }
        });
        return Array.from(companies, ([id, name]) => ({ id, name }));
    };

    const filteredData = (employeeData?.data || []).filter(user => {
        const matchesSearch = 
            user.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.no_ktp?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.dept_abbr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesRole = filterRole === 'all' || 
            user.roles?.some(r => r.role_name === filterRole);
        
        const matchesStatus = filterStatus === 'all' || 
            (filterStatus === 'active' ? user.user_is_active : !user.user_is_active);
        
        const matchesCompany = filterCompany === 'all' || 
            user.company_id?.toString() === filterCompany;
        
        return matchesSearch && matchesRole && matchesStatus && matchesCompany;
    });

    const totalEntries = filteredData.length;
    const totalPages = Math.ceil(totalEntries / entriesPerPage);
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = Math.min(startIndex + entriesPerPage, totalEntries);
    const currentData = filteredData.slice(startIndex, endIndex);

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return '-';
        const date = new Date(dateTimeString);
        return date.toLocaleString('en-US', { 
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const handleView = (user) => {
        setSelectedUser(user);
        setModalMode('view');
        setShowModal(true);
    };

    const handleEdit = (user) => {
        if (!permissions.can_edit) {
            showError('You do not have permission to edit users');
            return;
        }

        setSelectedUser(user);
        setFormData({ 
            employee_id: user.employee_id,
            nama: user.nama,
            no_ktp: user.no_ktp,
            id_role: user.roles?.[0]?.id_role || null,
            user_is_active: user.user_is_active ?? true,
        });
        setModalMode('edit');
        setShowModal(true);
    };

    const handleRefresh = async () => {
        try {
            showLoading('Refreshing data...');
            await fetchEmployeeData();
            showSuccess('Data refreshed successfully');
        } catch (error) {
            showError('Failed to refresh data');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!permissions.can_edit) {
            showError('You do not have permission to edit users');
            return;
        }

        try {
            if (!formData.id_role) {
                showError('Please select a role');
                return;
            }
            
            const deviceInfo = getDeviceInfo();
            const result = await confirmAction({
                title: 'Update User',
                text: 'Are you sure you want to update this user?',
                icon: 'question'
            });
            
            if (!result.isConfirmed) return;
            
            showLoading('Updating user...');
            
            const updateData = {
                id_role: [formData.id_role],
                no_ktp: formData.no_ktp,
                is_active: formData.user_is_active,
                updated_by: dataKaryawan.nama || 'System',
                updated_device: deviceInfo.device,
            };
           
            await handleUpdateUser(updateData);
            showSuccess('User updated successfully');
            
            setShowModal(false);
            setSelectedUser(null);
            await fetchEmployeeData();
            
        } catch (error) {
            console.error('Error:', error);
            showError(error.message || 'Failed to update user');
        }
    };

    const getRoleBadgeColor = (roleName) => {
        switch (roleName) {
            case 'Administrator':
            case 'Super Admin':
            case 'Super Admin update':
                return 'bg-red-100 text-red-800';
            case 'Trainer':
                return 'bg-purple-100 text-purple-800';
            case 'Learner A':
                return 'bg-blue-100 text-blue-800';
            case 'Learner B':
                return 'bg-teal-100 text-teal-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const renderRoles = (roles) => {
        if (!roles || roles.length === 0) return <span className="text-gray-400">-</span>;
        
        const role = roles[0];
        return (
            <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getRoleBadgeColor(role.role_name)}`}>
                {role.role_name}
            </span>
        );
    };

    const renderGroupings = (groupings) => {
        if (!groupings || groupings.length === 0) return <span className="text-gray-400">-</span>;
        
        return (
            <div className="flex flex-wrap gap-1">
                {groupings.slice(0, 2).map(group => (
                    <span 
                        key={group.id_grouping} 
                        className="inline-flex px-1.5 py-0.5 text-xs rounded bg-green-100 text-green-800"
                    >
                        {group.grouping_name}
                    </span>
                ))}
                {groupings.length > 2 && (
                    <span className="inline-flex px-1.5 py-0.5 text-xs rounded bg-gray-100 text-gray-600">
                        +{groupings.length - 2}
                    </span>
                )}
            </div>
        );
    };

    // ✅ NOW do conditional return AFTER all hooks
    if (!permissions.can_view) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="max-w-md text-center p-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600 mb-6">
                        You do not have permission to view user management.
                    </p>
                    <button
                        onClick={() => window.history.back()}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Go Back
                    </button>
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
                            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                            {/* ✅ Read-Only Badge */}
                            {!permissions.can_edit && (
                                <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                    <Lock className="w-3 h-3" />
                                    View Only
                                </span>
                            )}
                        </div>
                        <p className="text-gray-600 text-sm mt-1">
                            {permissions.can_edit 
                                ? 'Manage system users and their access'
                                : 'View system users (read-only mode)'
                            }
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                        <Home className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">Home</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">Master</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900 font-medium">User Management</span>
                    </div>
                </div>
            </div>

            {/* ✅ Permission Warning Banner */}
            {!permissions.can_edit && (
                <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
                    <div className="flex items-center gap-3">
                        <Shield className="w-6 h-6 text-blue-600 flex-shrink-0" />
                        <div>
                            <h4 className="text-sm font-bold text-blue-900 mb-1">View-Only Mode</h4>
                            <p className="text-sm text-blue-700">
                                You can view user information but cannot make changes. Contact your administrator for edit access.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Container */}
            <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6">
                    {/* Controls */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                        {/* Left Controls */}
                        <div className="flex flex-wrap items-center gap-4">
                            {/* Entries Selector */}
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

                            {/* Filters */}
                            <select
                                className="py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={filterRole}
                                onChange={(e) => {
                                    setFilterRole(e.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="all">All Roles</option>
                                {getUniqueRoles().map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>

                            <select
                                className="py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={filterCompany}
                                onChange={(e) => {
                                    setFilterCompany(e.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="all">All Companies</option>
                                {getUniqueCompanies().map(company => (
                                    <option key={company.id} value={company.id}>{company.name}</option>
                                ))}
                            </select>

                            <select
                                className="py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={filterStatus}
                                onChange={(e) => {
                                    setFilterStatus(e.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
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

                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search name, ID, KTP..."
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
                    {loading || apiLoading ? (
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
                                                Employee
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Company
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Department
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Role
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Groupings
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Last Login
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {currentData.map((user) => (
                                            <tr key={user.employee_id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-3">
                                                            <span className="text-xs font-medium text-white">
                                                                {getInitials(user.nama)}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {user.nama}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                ID: {user.employee_id}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-sm text-gray-900 max-w-[200px] truncate" title={user.company_name}>
                                                        {user.company_name || '-'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex px-2 py-1 text-xs rounded ${
                                                        user.dept_abbr 
                                                            ? 'bg-gray-100 text-gray-800' 
                                                            : 'text-gray-400'
                                                    }`}>
                                                        {user.dept_abbr || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {renderRoles(user.roles)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {renderGroupings(user.groupings)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                                                        user.user_is_active 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                        {user.user_is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                    {formatDateTime(user.last_login)}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        {/* ✅ View Button - Always visible */}
                                                        <button
                                                            onClick={() => handleView(user)}
                                                            className="p-1.5 text-gray-600 hover:text-green-600 transition-colors"
                                                            title="View"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        
                                                        {/* ✅ Edit Button - Conditional */}
                                                        {permissions.can_edit ? (
                                                            <button
                                                                onClick={() => handleEdit(user)}
                                                                className="p-1.5 text-gray-600 hover:text-blue-600 transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                disabled
                                                                className="p-1.5 text-gray-400 cursor-not-allowed"
                                                                title="No edit permission"
                                                            >
                                                                <Lock className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {currentData.length === 0 && (
                                            <tr>
                                                <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                                                    No data available
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Controls */}
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

            {/* ✅ Modal - View & Edit with Permission Check */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className={`bg-white rounded-lg shadow-xl w-full ${modalMode === 'view' ? 'max-w-3xl' : 'max-w-lg'}`}>
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {modalMode === 'edit' ? 'Edit User' : 'User Details'}
                                </h3>
                                {/* ✅ Modal Permission Badge */}
                                {modalMode === 'view' && !permissions.can_edit && (
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                        View Only
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            {/* Modal body */}
                            <div className="p-6 max-h-[60vh] overflow-y-auto">
                                {modalMode === 'view' ? (
                                    <div className="space-y-6">
                                        {/* User Header */}
                                        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                                <span className="text-xl font-medium text-white">
                                                    {getInitials(selectedUser?.nama)}
                                                </span>
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-semibold text-gray-900">{selectedUser?.nama}</h4>
                                                <p className="text-sm text-gray-600">ID: {selectedUser?.employee_id}</p>
                                                <p className="text-sm text-gray-600">KTP: {selectedUser?.no_ktp}</p>
                                            </div>
                                        </div>

                                        {/* Details Grid */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                                    <Building className="w-3 h-3 inline mr-1" />
                                                    Company
                                                </label>
                                                <p className="text-sm text-gray-900">{selectedUser?.company_name || '-'}</p>
                                            </div>
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                                    Department
                                                </label>
                                                <p className="text-sm text-gray-900">{selectedUser?.dept_abbr || '-'}</p>
                                            </div>
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                                    Position
                                                </label>
                                                <p className="text-sm text-gray-900">{selectedUser?.position_name || '-'}</p>
                                            </div>
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                                    Status
                                                </label>
                                                <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                                                    selectedUser?.user_is_active 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {selectedUser?.user_is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                                    Last Login
                                                </label>
                                                <p className="text-sm text-gray-900">{formatDateTime(selectedUser?.last_login)}</p>
                                            </div>
                                        </div>

                                        {/* Role */}
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <label className="block text-xs font-medium text-gray-500 mb-2">
                                                <Users className="w-3 h-3 inline mr-1" />
                                                Role
                                            </label>
                                            {renderRoles(selectedUser?.roles)}
                                        </div>

                                        {/* Groupings */}
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <label className="block text-xs font-medium text-gray-500 mb-2">
                                                Groupings
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedUser?.groupings?.map(group => (
                                                    <span 
                                                        key={group.id_grouping}
                                                        className="inline-flex px-2 py-1 text-xs rounded-full bg-green-100 text-green-800"
                                                    >
                                                        {group.grouping_name}
                                                    </span>
                                                )) || <span className="text-gray-400">-</span>}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Edit form */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                ID Karyawan
                                            </label>
                                            <input
                                                type="text"
                                                disabled
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                                                value={formData.employee_id}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Full Name
                                            </label>
                                            <input
                                                type="text"
                                                disabled
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                                                value={formData.nama}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                No KTP <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                value={formData.no_ktp}
                                                onChange={(e) => setFormData({ ...formData, no_ktp: e.target.value })}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <Users className="w-4 h-4 inline mr-1" />
                                                Role <span className="text-red-500">*</span>
                                            </label>
                                            <div className="border border-gray-200 rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                                                {availableRoles.length === 0 ? (
                                                    <p className="text-sm text-gray-500">Loading roles...</p>
                                                ) : (
                                                    availableRoles.filter(role => role.is_active).map(role => (
                                                        <label 
                                                            key={role.id_role} 
                                                            className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${
                                                                formData.id_role === role.id_role
                                                                    ? 'bg-blue-50 border border-blue-200'
                                                                    : 'hover:bg-gray-50 border border-transparent'
                                                            }`}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name="role"
                                                                className="w-4 h-4 text-blue-600 mr-3"
                                                                checked={formData.id_role === role.id_role}
                                                                onChange={() => setFormData({ ...formData, id_role: role.id_role })}
                                                            />
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`inline-flex px-2 py-0.5 text-xs rounded-full ${getRoleBadgeColor(role.role_name)}`}>
                                                                        {role.role_name}
                                                                    </span>
                                                                    <span className="text-xs text-gray-500">({role.role_code})</span>
                                                                </div>
                                                                {role.role_description && (
                                                                    <p className="text-xs text-gray-500 mt-1">{role.role_description}</p>
                                                                )}
                                                            </div>
                                                        </label>
                                                    ))
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Status
                                            </label>
                                            <select
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                value={formData.user_is_active}
                                                onChange={(e) => setFormData({ ...formData, user_is_active: e.target.value === 'true' })}
                                            >
                                                <option value="true">Active</option>
                                                <option value="false">Inactive</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 rounded-b-lg">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    {modalMode === 'view' ? 'Close' : 'Cancel'}
                                </button>
                                
                                {/* ✅ Save Button - Only show if can edit */}
                                {modalMode === 'edit' && permissions.can_edit && (
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

UserManagement.layout = Admin;