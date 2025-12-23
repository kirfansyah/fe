import React, { useState, useEffect, useContext } from 'react';
import { 
    Edit,
    Search,
    Home, 
    ChevronRight,
    Settings,
    Check,
    X,
    Lock,
    Shield,
    PowerOff
} from 'lucide-react';
import Admin from "layouts/Admin.js";
import { useRoles } from "../../hooks/useRoles";
import { ProfileContext } from '@/contexts/profile/ProfileContext';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { getDeviceInfo } from '@/lib/deviceHelper';
import { useMenuPermissions } from '@/hooks/useMenuPermissions'; // ✅ Import

export default function RoleManagement() {
    // ✅ ALL HOOKS FIRST
    const permissions = useMenuPermissions();
    const { roles, fetchRoleByID, handleCreateRoles, handleUpdateRolePermissions } = useRoles();
    const {dataKaryawan} = useContext(ProfileContext);
    const { showLoading, showSuccess, showError, closeLoading, confirmAction } = useSweetAlert();
    
    const [loading, setLoading] = useState(true);
    const [loadingPermissions, setLoadingPermissions] = useState(false);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showPermissionsModal, setShowPermissionsModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [formData, setFormData] = useState({ role_name: '' });
    const [permissionsData, setPermissionsData] = useState(null);
    
    const deviceInfo = getDeviceInfo();
    const groups = roles || [];

    useEffect(() => {
        setLoading(false);
    }, []);

    // Filter data
    const filteredData = groups.filter(group =>
        group.role_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (group.role_description && group.role_description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (group.is_active.toString().toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Pagination
    const totalEntries = filteredData.length;
    const totalPages = Math.ceil(totalEntries / entriesPerPage);
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = Math.min(startIndex + entriesPerPage, totalEntries);
    const currentData = filteredData.slice(startIndex, endIndex);

    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
        
        if (endPage - startPage < maxPagesToShow - 1) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
    };

    // ✅ Configure Permissions - Check permission
    const handleConfigurePermissions = async (group) => {
        if (!permissions.can_edit) {
            showError('You do not have permission to configure permissions');
            return;
        }

        setSelectedGroup(group);
        setLoadingPermissions(true);
        setShowPermissionsModal(true);
        
        try {
            showLoading('Loading permissions...');
            const response = await fetchRoleByID(group.id_role);
            closeLoading();
            if (response?.data) {
                setPermissionsData(response.data);
                showSuccess('Permissions loaded successfully');
            }
        } catch (error) {
            showError('Failed to load permissions: ' + error.message);
            setShowPermissionsModal(false);
        } finally {
            setLoadingPermissions(false);
        }
    };

    const togglePermission = (menuIndex, permissionType) => {
        setPermissionsData(prev => {
            const updated = { ...prev };
            const accessConfig = [...updated.accessConfiguration];
            accessConfig[menuIndex] = {
                ...accessConfig[menuIndex],
                permissions: {
                    ...accessConfig[menuIndex].permissions,
                    [permissionType]: !accessConfig[menuIndex].permissions[permissionType]
                }
            };
            updated.accessConfiguration = accessConfig;
            return updated;
        });
    };

    // ✅ Save Permissions - Check permission
    const handleSavePermissions = async () => {
        if (!permissions.can_edit) {
            showError('You do not have permission to save permissions');
            return;
        }

        const result = await confirmAction(
            'Save Permissions',
            'Are you sure you want to save these permission changes?'
        );
        
        if (!result.isConfirmed) return;
        
        showLoading('Saving permissions...');
        
        try {
            const payload = {
                id_role: permissionsData.id_role,
                accessConfiguration: permissionsData.accessConfiguration.map(config => ({
                    id_role_menu: config.id_role_menu,
                    id_menu: config.id_menu,
                    permissions: {
                        view: config.permissions.view,
                        create: config.permissions.create,
                        edit: config.permissions.edit,
                        delete: config.permissions.delete,
                        approve: config.permissions.approve
                    },
                    updated_by: dataKaryawan.nama || 'System',
                    updated_device: deviceInfo.device
                }))
            };
            
            await handleUpdateRolePermissions(payload);
            showSuccess('Permissions updated successfully!');
            setShowPermissionsModal(false);
        } catch (error) {
            showError('Failed to update permissions: ' + error.message);
        }
    };

    // ✅ Handle Edit - Check permission
    const handleEdit = (group) => {
        if (!permissions.can_edit) {
            showError('You do not have permission to edit roles');
            return;
        }

        setSelectedGroup(group);
        setFormData({ 
            role_name: group.role_name, 
            role_description: group.role_description, 
            id_role: group.id_role 
        });
        setModalMode('edit');
        setShowModal(true);
    };

    // ✅ Handle Delete - Check permission
    const handleDelete = (group) => {
        if (!permissions.can_delete) {
            showError('You do not have permission to delete roles');
            return;
        }

        setSelectedGroup(group);
        setModalMode('delete');
        setShowModal(true);
    };

    // ✅ Handle Add - Check permission
    const handleAdd = () => {
        if (!permissions.can_create) {
            showError('You do not have permission to create roles');
            return;
        }

        setModalMode('add');
        setFormData({ role_name: '' });
        setShowModal(true);
    };

    // ✅ Handle Submit - Check permission based on mode
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (modalMode === 'add') {
            if (!permissions.can_create) {
                showError('You do not have permission to create roles');
                return;
            }

            const rolesData = {
                role_name: formData.role_name,
                role_description: formData.role_description,
                is_active: true,
                created_by: dataKaryawan.nama || 'System',
                created_device: deviceInfo.device
            };
            
            const result = await confirmAction('Are you sure you want to add this role?');
            if (!result.isConfirmed) return;
            
            showLoading('Adding new role...');
            try {
                await handleCreateRoles(rolesData);
                showSuccess('Role added successfully');
            } catch (error) {
                showError(`Failed to add role: ${error.message}`);
            }
        } else if (modalMode === 'edit') {
            if (!permissions.can_edit) {
                showError('You do not have permission to edit roles');
                return;
            }

            const rolesData = {
                id_role: selectedGroup.id_role,
                role_name: formData.role_name,
                role_description: formData.role_description,
                is_active: true,
                updated_by: dataKaryawan.nama || 'System',
                updated_device: deviceInfo.device
            };
            
            const result = await confirmAction('Are you sure you want to save changes to this role?');
            if (!result.isConfirmed) return;
            
            showLoading('Saving changes...');
            try {
                await handleCreateRoles(rolesData);
                showSuccess('Role updated successfully');
            } catch (error) {
                showError(`Failed to update role: ${error.message}`);
            }
        } else if (modalMode === 'delete') {
            if (!permissions.can_delete) {
                showError('You do not have permission to delete roles');
                return;
            }

            const rolesData = {
                id_role: selectedGroup.id_role,
                role_name: selectedGroup.role_name,
                is_active: false,
                updated_by: dataKaryawan.nama || 'System',
                updated_device: deviceInfo.device
            };
            
            const result = await confirmAction('Are you sure you want to inactive this role?');
            if (!result.isConfirmed) return;
            
            showLoading('Saving changes...');
            try {
                await handleCreateRoles(rolesData);
                showSuccess('Role updated successfully');
            } catch (error) {
                showError(`Failed to update role: ${error.message}`);
            }
        }
        
        setShowModal(false);
        setFormData({ role_name: '' });
    };

    // ✅ AFTER all hooks, check view permission
    if (!permissions.can_view) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="max-w-md text-center p-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600 mb-6">
                        You do not have permission to view role management.
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
                            <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
                            {/* ✅ Permission Badge */}
                            {!permissions.can_edit && !permissions.can_create && !permissions.can_delete && (
                                <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                    <Lock className="w-3 h-3" />
                                    View Only
                                </span>
                            )}
                        </div>
                        <p className="text-gray-600 text-sm mt-1">
                            {permissions.can_edit 
                                ? 'Manage roles and permissions'
                                : 'View roles and permissions (read-only mode)'
                            }
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                        <Home className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">Home</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900 font-medium">Role Management</span>
                    </div>
                </div>
            </div>

            {/* ✅ Permission Warning Banner */}
            {!permissions.can_edit && !permissions.can_create && !permissions.can_delete && (
                <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
                    <div className="flex items-center gap-3">
                        <Shield className="w-6 h-6 text-blue-600 flex-shrink-0" />
                        <div>
                            <h4 className="text-sm font-bold text-blue-900 mb-1">View-Only Mode</h4>
                            <p className="text-sm text-blue-700">
                                You can view roles and permissions but cannot make changes. Contact your administrator for edit access.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Container */}
            <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6">
                    <div className="flex sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
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
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                            <span className="text-sm text-gray-600">entries</span>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* ✅ Add Button - Conditional */}
                            {permissions.can_create ? (
                                <button
                                    onClick={handleAdd}
                                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Add New Role
                                </button>
                            ) : (
                                <button
                                    disabled
                                    className="px-4 py-2 bg-gray-300 text-gray-500 text-sm rounded-md cursor-not-allowed flex items-center gap-2"
                                    title="No create permission"
                                >
                                    <Lock className="w-4 h-4" />
                                    Add New Role
                                </button>
                            )}

                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                                Role Name
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Role Description
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Role Status
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Created Date
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Updated Date
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {currentData.map((group) => (
                                            <tr key={group.id_role} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm">{group.role_name}</td>
                                                <td className="px-4 py-3 text-sm">{group.role_description || '-'}</td>
                                                <td className="px-4 py-3 text-sm">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        group.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {group.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm">{formatDate(group.created_at)}</td>
                                                <td className="px-4 py-3 text-sm">{formatDate(group.updated_at)}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {/* ✅ Configure - Conditional */}
                                                        {permissions.can_edit ? (
                                                            <button
                                                                onClick={() => handleConfigurePermissions(group)}
                                                                className="p-1.5 hover:text-purple-600 transition-colors"
                                                                title="Configure Permissions"
                                                            >
                                                                <Settings className="w-4 h-4" />
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
                                                        
                                                        {/* ✅ Edit - Conditional */}
                                                        {permissions.can_edit ? (
                                                            <button
                                                                onClick={() => handleEdit(group)}
                                                                className="p-1.5 hover:text-blue-600 transition-colors"
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
                                                        
                                                        {/* ✅ Delete - Conditional */}
                                                        {permissions.can_delete ? (
                                                            <button
                                                                onClick={() => handleDelete(group)}
                                                                className="p-1.5 hover:text-red-600 transition-colors"
                                                                title="Inactive"
                                                            >
                                                                <PowerOff className="w-4 h-4" />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                disabled
                                                                className="p-1.5 text-gray-400 cursor-not-allowed"
                                                                title="No delete permission"
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
                                                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                                                    No data available
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex sm:flex-row justify-between items-center gap-4 mt-6">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Previous
                                    </button>
                                    
                                    {getPageNumbers().map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`px-3 py-1 rounded-md text-sm transition-colors ${
                                                currentPage === page
                                                    ? 'bg-blue-600 text-white'
                                                    : 'border border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>

                                <div className="text-sm text-gray-600">
                                    Showing {startIndex + 1} to {endIndex} of {totalEntries} entries
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Role Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {modalMode === 'add' && 'Add New Role'}
                                {modalMode === 'edit' && 'Edit Role'}
                                {modalMode === 'delete' && 'Delete Role'}
                            </h3>
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="p-6">
                                {modalMode === 'delete' ? (
                                    <div>
                                        <p className="text-gray-600">
                                            Are you sure you want to delete this role?
                                        </p>
                                        <p className="font-semibold text-gray-900 mt-2">
                                            {selectedGroup?.role_name}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Role Name
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                value={formData.role_name}
                                                onChange={(e) => setFormData({ ...formData, role_name: e.target.value })}
                                                placeholder="Enter role name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Role Description
                                            </label>
                                            <textarea
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                value={formData.role_description}
                                                onChange={(e) => setFormData({ ...formData, role_description: e.target.value })}
                                                placeholder="Enter role description"
                                            ></textarea>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`px-4 py-2 text-sm text-white rounded-md transition-colors ${
                                        modalMode === 'delete'
                                            ? 'bg-red-600 hover:bg-red-700'
                                            : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                                >
                                    {modalMode === 'add' && 'Add'}
                                    {modalMode === 'edit' && 'Save'}
                                    {modalMode === 'delete' && 'Delete'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Permissions Modal */}
            {showPermissionsModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Configure Permissions - {permissionsData?.role_name}
                            </h3>
                        </div>
                        
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                            {loadingPermissions ? (
                                <div className="flex justify-center items-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Menu
                                                </th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    View
                                                </th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Create
                                                </th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Edit
                                                </th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Delete
                                                </th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Approve
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {permissionsData?.accessConfiguration?.map((config, index) => (
                                                <tr key={config.id_role_menu} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                        {config.menu}
                                                    </td>
                                                    {['view', 'create', 'edit', 'delete', 'approve'].map(permission => (
                                                        <td key={permission} className="px-4 py-3 text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => togglePermission(index, permission)}
                                                                className={`p-2 rounded-lg transition-colors ${
                                                                    config.permissions[permission]
                                                                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                                                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                                }`}
                                                            >
                                                                {config.permissions[permission] ? (
                                                                    <Check className="w-5 h-5" />
                                                                ) : (
                                                                    <X className="w-5 h-5" />
                                                                )}
                                                            </button>
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                        
                        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => setShowPermissionsModal(false)}
                                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSavePermissions}
                                disabled={loadingPermissions}
                                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Save Permissions
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

RoleManagement.layout = Admin;