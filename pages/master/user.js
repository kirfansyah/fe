import React, { useState, useEffect } from 'react';
import { 
    Trash2, 
    Edit,
    Search,
    Home,
    ChevronRight,
    Lock,
    UserPlus,
    Eye,
    EyeOff,
    Building,
    Users,
    RefreshCw
} from 'lucide-react';
import Admin from "layouts/Admin.js";
import { useCourses } from "@/hooks/useCourses";
import { useSweetAlert } from '@/hooks/useSweetAlert';

export default function UserManagement() {
    const { employeeData, fetchEmployeeData, loading: apiLoading } = useCourses();
    const { showLoading, showSuccess, showError, confirmAction } = useSweetAlert();
    
    const [loading, setLoading] = useState(true);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterCompany, setFilterCompany] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ 
        employee_id: '',
        nama: '',
        no_ktp: '',
        dept_abbr: '',
        company_id: '',
        roles: [],
        groupings: [],
        user_is_active: true,
        password: '',
        confirm_password: ''
    });

    // Get unique values for filters
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

    const getUniqueDepartments = () => {
        if (!employeeData?.data) return [];
        const depts = new Set();
        employeeData.data.forEach(emp => {
            if (emp.dept_abbr) depts.add(emp.dept_abbr);
        });
        return Array.from(depts);
    };

    useEffect(() => {
        if (employeeData) {
            setLoading(false);
        }
    }, [employeeData]);

    // Filter data based on search and filters
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

    // Pagination
    const totalEntries = filteredData.length;
    const totalPages = Math.ceil(totalEntries / entriesPerPage);
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = Math.min(startIndex + entriesPerPage, totalEntries);
    const currentData = filteredData.slice(startIndex, endIndex);

    // Format datetime
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

    // Get initials from name
    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    // Handle functions
    const handleView = (user) => {
        setSelectedUser(user);
        setModalMode('view');
        setShowModal(true);
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setFormData({ 
            employee_id: user.employee_id,
            nama: user.nama,
            no_ktp: user.no_ktp,
            dept_abbr: user.dept_abbr || '',
            company_id: user.company_id,
            roles: user.roles?.map(r => r.id_role) || [],
            groupings: user.groupings?.map(g => g.id_grouping) || [],
            user_is_active: user.user_is_active,
            password: '',
            confirm_password: ''
        });
        setModalMode('edit');
        setShowModal(true);
    };

    const handleDelete = (user) => {
        setSelectedUser(user);
        setModalMode('delete');
        setShowModal(true);
    };

    const handleResetPassword = (user) => {
        setSelectedUser(user);
        setModalMode('reset-password');
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
        
        try {
            if (modalMode === 'add') {
                const result = await confirmAction({
                    title: 'Add New User',
                    text: 'Are you sure you want to add this new user?',
                    icon: 'question'
                });
                
                if (!result.isConfirmed) return;
                
                showLoading('Adding new user...');
                // await handleCreateUser(formData);
                showSuccess('User added successfully');
                
            } else if (modalMode === 'edit') {
                const result = await confirmAction({
                    title: 'Update User',
                    text: 'Are you sure you want to update this user?',
                    icon: 'question'
                });
                
                if (!result.isConfirmed) return;
                
                showLoading('Updating user...');
                // await handleUpdateUser(formData, selectedUser.employee_id);
                showSuccess('User updated successfully');
                
            } else if (modalMode === 'delete') {
                const result = await confirmAction({
                    title: 'Delete User',
                    text: 'Are you sure you want to delete this user?',
                    icon: 'warning',
                    confirmButtonText: 'Yes, delete it!'
                });
                
                if (!result.isConfirmed) return;
                
                showLoading('Deleting user...');
                // await handleDeleteUser(selectedUser.employee_id);
                showSuccess('User deleted successfully');
                
            } else if (modalMode === 'reset-password') {
                if (formData.password !== formData.confirm_password) {
                    showError('Passwords do not match');
                    return;
                }
                
                const result = await confirmAction({
                    title: 'Reset Password',
                    text: 'Are you sure you want to reset password for this user?',
                    icon: 'warning'
                });
                
                if (!result.isConfirmed) return;
                
                showLoading('Resetting password...');
                // await handleResetUserPassword(selectedUser.employee_id, formData.password);
                showSuccess('Password reset successfully');
            }
            
            setShowModal(false);
            setSelectedUser(null);
            resetFormData();
            
        } catch (error) {
            console.error('Error:', error);
            showError(error.message || `Failed to ${modalMode} user`);
        }
    };

    const resetFormData = () => {
        setFormData({ 
            employee_id: '',
            nama: '',
            no_ktp: '',
            dept_abbr: '',
            company_id: '',
            roles: [],
            groupings: [],
            user_is_active: true,
            password: '',
            confirm_password: ''
        });
    };

    // Render role badges
    const renderRoles = (roles) => {
        if (!roles || roles.length === 0) return <span className="text-gray-400">-</span>;
        
        return (
            <div className="flex flex-wrap gap-1">
                {roles.slice(0, 2).map(role => (
                    <span 
                        key={role.id_role} 
                        className={`inline-flex px-1.5 py-0.5 text-xs rounded-full ${
                            role.role_name === 'Administrator' 
                                ? 'bg-red-100 text-red-800'
                                : role.role_name === 'Trainer'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                        }`}
                    >
                        {role.role_name}
                    </span>
                ))}
                {roles.length > 2 && (
                    <span className="inline-flex px-1.5 py-0.5 text-xs rounded bg-gray-100 text-gray-600">
                        +{roles.length - 2}
                    </span>
                )}
            </div>
        );
    };

    // Render groupings
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

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl  font-bold text-gray-900 mb-1">User Management</h1>
                        <p className="text-gray-600 text-sm">Manage system users and their access</p>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                        <Home className="w-4 h-4 text-gray-400" />
                        <span className="text-gray text-sm">Home</span>
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-500 text-sm">Master</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900 text-sm font-medium">User Management</span>
                    </div>
                </div>
            </div>

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
                                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
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

                            <button
                                onClick={() => {
                                    setModalMode('add');
                                    resetFormData();
                                    setShowModal(true);
                                }}
                                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <UserPlus className="w-4 h-4" />
                                Add New User
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
                                                Roles
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
                                                        <button
                                                            onClick={() => handleView(user)}
                                                            className="p-1.5 text-gray-600 hover:text-green-600 transition-colors"
                                                            title="View"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEdit(user)}
                                                            className="p-1.5 text-gray-600 hover:text-blue-600 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleResetPassword(user)}
                                                            className="p-1.5 text-gray-600 hover:text-orange-600 transition-colors"
                                                            title="Reset Password"
                                                        >
                                                            <Lock className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(user)}
                                                            className="p-1.5 text-gray-600 hover:text-red-600 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
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

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className={`bg-white rounded-lg shadow-xl w-full ${modalMode === 'view' ? 'max-w-3xl' : 'max-w-lg'}`}>
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {modalMode === 'add' && 'Add New User'}
                                {modalMode === 'edit' && 'Edit User'}
                                {modalMode === 'delete' && 'Delete User'}
                                {modalMode === 'view' && 'User Details'}
                                {modalMode === 'reset-password' && 'Reset Password'}
                            </h3>
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 max-h-[60vh] overflow-y-auto">
                                {modalMode === 'delete' ? (
                                    <div>
                                        <p className="text-gray-600">
                                            Are you sure you want to delete this user?
                                        </p>
                                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                                    <span className="text-sm font-medium text-white">
                                                        {getInitials(selectedUser?.nama)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        {selectedUser?.nama}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        ID: {selectedUser?.employee_id}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {selectedUser?.company_name}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : modalMode === 'view' ? (
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
                                                <p className="text-sm text-gray-600">ID Karyawan: {selectedUser?.employee_id}</p>
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

                                        {/* Roles */}
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <label className="block text-xs font-medium text-gray-500 mb-2">
                                                <Users className="w-3 h-3 inline mr-1" />
                                                Roles
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedUser?.roles?.map(role => (
                                                    <span 
                                                        key={role.id_role}
                                                        className={`inline-flex px-2 py-1 text-xs rounded-full ${
                                                            role.role_name === 'Administrator' 
                                                                ? 'bg-red-100 text-red-800'
                                                                : role.role_name === 'Trainer'
                                                                ? 'bg-purple-100 text-purple-800'
                                                                : 'bg-blue-100 text-blue-800'
                                                        }`}
                                                    >
                                                        {role.role_name}
                                                    </span>
                                                )) || <span className="text-gray-400">-</span>}
                                            </div>
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
                                ) : modalMode === 'reset-password' ? (
                                    <div>
                                        <p className="text-gray-600 mb-4">
                                            Reset password for user:
                                        </p>
                                        <div className="p-4 bg-gray-50 rounded-lg mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                                    <span className="text-xs font-medium text-white">
                                                        {getInitials(selectedUser?.nama)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        {selectedUser?.nama}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        ID: {selectedUser?.employee_id}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    New Password
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        required
                                                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                        placeholder="Enter new password"
                                                        value={formData.password}
                                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-2 top-2.5"
                                                    >
                                                        {showPassword ? (
                                                            <EyeOff className="w-4 h-4 text-gray-400" />
                                                        ) : (
                                                            <Eye className="w-4 h-4 text-gray-400" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Confirm Password
                                                </label>
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    required
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    placeholder="Confirm new password"
                                                    value={formData.confirm_password}
                                                    onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Add/Edit form fields */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                ID Karyawan
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                value={formData.employee_id}
                                                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                                                placeholder="Enter employee ID"
                                                disabled={modalMode === 'edit'}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Full Name
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                value={formData.nama}
                                                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                                placeholder="Enter full name"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                No KTP
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                value={formData.no_ktp}
                                                onChange={(e) => setFormData({ ...formData, no_ktp: e.target.value })}
                                                placeholder="Enter KTP number"
                                            />
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

                                        {modalMode === 'add' && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Password
                                                    </label>
                                                    <input
                                                        type="password"
                                                        required
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                        value={formData.password}
                                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                        placeholder="Enter password"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Confirm Password
                                                    </label>
                                                    <input
                                                        type="password"
                                                        required
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                        value={formData.confirm_password}
                                                        onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                                                        placeholder="Confirm password"
                                                    />
                                                </div>
                                            </div>
                                        )}
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
                                {modalMode !== 'view' && (
                                    <button
                                        type="submit"
                                        className={`px-4 py-2 text-sm text-white rounded-md transition-colors ${
                                            modalMode === 'delete'
                                                ? 'bg-red-600 hover:bg-red-700'
                                                : modalMode === 'reset-password'
                                                ? 'bg-orange-600 hover:bg-orange-700'
                                                : 'bg-blue-600 hover:bg-blue-700'
                                        }`}
                                    >
                                        {modalMode === 'add' && 'Add User'}
                                        {modalMode === 'edit' && 'Save Changes'}
                                        {modalMode === 'delete' && 'Delete'}
                                        {modalMode === 'reset-password' && 'Reset Password'}
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