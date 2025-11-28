import React, { useState, useEffect } from 'react';
import { 
    Trash2, 
    Edit,
    Search,
    Shield,
    Check,
    X,
    Eye,
    Home,
    ChevronRight
} from 'lucide-react';
import Admin from "layouts/Admin.js";
export default function RoleAccessManagement() {
    // State Management
    const [roles, setRoles] = useState([]);
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedRole, setSelectedRole] = useState(null);
    const [formData, setFormData] = useState({ 
        role_name: '',
        description: '',
        permissions: {}
    });

    // Sample modules/features
    const availableModules = [
        { id: 'dashboard', name: 'Dashboard', permissions: ['view', 'create', 'edit', 'delete'] },
        { id: 'users', name: 'User Management', permissions: ['view', 'create', 'edit', 'delete'] },
        { id: 'roles', name: 'Role Management', permissions: ['view', 'create', 'edit', 'delete'] },
        { id: 'products', name: 'Products', permissions: ['view', 'create', 'edit', 'delete'] },
        { id: 'orders', name: 'Orders', permissions: ['view', 'create', 'edit', 'delete'] },
        { id: 'reports', name: 'Reports', permissions: ['view', 'export'] },
        { id: 'settings', name: 'Settings', permissions: ['view', 'edit'] },
        { id: 'logs', name: 'Audit Logs', permissions: ['view', 'export'] },
    ];

    // Sample data
    useEffect(() => {
        setTimeout(() => {
            setRoles([
                { 
                    id: 1, 
                    role_name: 'Super Admin', 
                    description: 'Full system access',
                    users_count: 2,
                    status: 'Active',
                    created_at: '2024-01-15',
                    permissions: {
                        dashboard: ['view', 'create', 'edit', 'delete'],
                        users: ['view', 'create', 'edit', 'delete'],
                        roles: ['view', 'create', 'edit', 'delete'],
                        products: ['view', 'create', 'edit', 'delete'],
                        orders: ['view', 'create', 'edit', 'delete'],
                        reports: ['view', 'export'],
                        settings: ['view', 'edit'],
                        logs: ['view', 'export']
                    }
                },
                { 
                    id: 2, 
                    role_name: 'Admin', 
                    description: 'Administrative access',
                    users_count: 5,
                    status: 'Active',
                    created_at: '2024-01-20',
                    permissions: {
                        dashboard: ['view'],
                        users: ['view', 'create', 'edit'],
                        roles: ['view'],
                        products: ['view', 'create', 'edit', 'delete'],
                        orders: ['view', 'create', 'edit'],
                        reports: ['view', 'export'],
                        settings: ['view']
                    }
                },
                { 
                    id: 3, 
                    role_name: 'Manager', 
                    description: 'Management level access',
                    users_count: 12,
                    status: 'Active',
                    created_at: '2024-02-01',
                    permissions: {
                        dashboard: ['view'],
                        products: ['view', 'create', 'edit'],
                        orders: ['view', 'create', 'edit'],
                        reports: ['view', 'export']
                    }
                },
                { 
                    id: 4, 
                    role_name: 'Staff', 
                    description: 'Basic staff access',
                    users_count: 45,
                    status: 'Active',
                    created_at: '2024-02-10',
                    permissions: {
                        dashboard: ['view'],
                        products: ['view'],
                        orders: ['view', 'create']
                    }
                },
                { 
                    id: 5, 
                    role_name: 'Viewer', 
                    description: 'Read-only access',
                    users_count: 28,
                    status: 'Active',
                    created_at: '2024-02-15',
                    permissions: {
                        dashboard: ['view'],
                        products: ['view'],
                        orders: ['view'],
                        reports: ['view']
                    }
                },
                { 
                    id: 6, 
                    role_name: 'Guest', 
                    description: 'Limited guest access',
                    users_count: 0,
                    status: 'Inactive',
                    created_at: '2024-03-01',
                    permissions: {
                        dashboard: ['view']
                    }
                }
            ]);
            setModules(availableModules);
            setLoading(false);
        }, 500);
    }, []);

    // Filter data based on search
    const filteredData = roles.filter(role =>
        role.role_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination
    const totalEntries = filteredData.length;
    const totalPages = Math.ceil(totalEntries / entriesPerPage);
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = Math.min(startIndex + entriesPerPage, totalEntries);
    const currentData = filteredData.slice(startIndex, endIndex);

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
    };

    // Count total permissions
    const countPermissions = (permissions) => {
        let count = 0;
        Object.values(permissions).forEach(perms => {
            count += perms.length;
        });
        return count;
    };

    // Handle functions
    const handleView = (role) => {
        setSelectedRole(role);
        setModalMode('view');
        setShowModal(true);
    };

    const handleEdit = (role) => {
        setSelectedRole(role);
        setFormData({ 
            role_name: role.role_name,
            description: role.description,
            permissions: role.permissions || {}
        });
        setModalMode('edit');
        setShowModal(true);
    };

    const handleDelete = (role) => {
        setSelectedRole(role);
        setModalMode('delete');
        setShowModal(true);
    };

    const handlePermissionChange = (moduleId, permission, checked) => {
        setFormData(prev => {
            const newPermissions = { ...prev.permissions };
            if (!newPermissions[moduleId]) {
                newPermissions[moduleId] = [];
            }
            
            if (checked) {
                if (!newPermissions[moduleId].includes(permission)) {
                    newPermissions[moduleId].push(permission);
                }
            } else {
                newPermissions[moduleId] = newPermissions[moduleId].filter(p => p !== permission);
                if (newPermissions[moduleId].length === 0) {
                    delete newPermissions[moduleId];
                }
            }
            
            return { ...prev, permissions: newPermissions };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (modalMode === 'add') {
            const newRole = {
                id: roles.length + 1,
                role_name: formData.role_name,
                description: formData.description,
                permissions: formData.permissions,
                users_count: 0,
                status: 'Active',
                created_at: new Date().toISOString()
            };
            setRoles([...roles, newRole]);
        } else if (modalMode === 'edit') {
            setRoles(roles.map(r => 
                r.id === selectedRole.id 
                    ? { ...r, ...formData }
                    : r
            ));
        } else if (modalMode === 'delete') {
            setRoles(roles.filter(r => r.id !== selectedRole.id));
        }
        
        setShowModal(false);
        setFormData({ role_name: '', description: '', permissions: {} });
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-[#5577B5] via-[#6B8BC5] to-[#7B9DD8] shadow-lg">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Master</h1>
                        <p className="text-blue-100">Manage your master</p>
                    </div>
                    
                    {/* Modern Breadcrumb */}
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                        <Home className="w-4 h-4 text-blue-100" />
                        <span className="text-blue-100 text-sm">Home</span>
                        <ChevronRight className="w-4 h-4 text-blue-100" />
                        <span className="text-white text-sm font-medium">Mastering</span>
                    </div>
                </div>
            </div>
            {/* Main Container */}
            <div className="bg-white rounded-lg shadow-sm">
                {/* Controls */}
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
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                            <span className="text-sm text-gray-600">entries</span>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Add Button */}
                            <button
                                onClick={() => {
                                    setModalMode('add');
                                    setFormData({ role_name: '', description: '', permissions: {} });
                                    setShowModal(true);
                                }}
                                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Add New Role
                            </button>

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
                                                Description
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Users
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Permissions
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Created Date
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {currentData.map((role) => (
                                            <tr key={role.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center">
                                                        <Shield className="w-4 h-4 text-gray-400 mr-2" />
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {role.role_name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                    {role.description}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="text-sm text-gray-900 font-medium">
                                                        {role.users_count}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="inline-flex px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                                        {countPermissions(role.permissions)} permissions
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                                                        role.status === 'Active' 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                        {role.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                    {formatDate(role.created_at)}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => handleView(role)}
                                                            className="p-1.5 text-gray-600 hover:text-green-600 transition-colors"
                                                            title="View"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEdit(role)}
                                                            className="p-1.5 text-gray-600 hover:text-blue-600 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(role)}
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
                                                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
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
                                    
                                    {[...Array(totalPages)].map((_, index) => (
                                        <button
                                            key={index + 1}
                                            onClick={() => setCurrentPage(index + 1)}
                                            className={`px-3 py-1 rounded-md text-sm transition-colors ${
                                                currentPage === index + 1
                                                    ? 'bg-blue-600 text-white'
                                                    : 'border border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            {index + 1}
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

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className={`bg-white rounded-lg shadow-xl w-full ${modalMode === 'view' || modalMode === 'edit' || modalMode === 'add' ? 'max-w-4xl' : 'max-w-md'}`}>
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {modalMode === 'add' && 'Add New Role'}
                                {modalMode === 'edit' && 'Edit Role'}
                                {modalMode === 'delete' && 'Delete Role'}
                                {modalMode === 'view' && 'View Role Details'}
                            </h3>
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 max-h-[60vh] overflow-y-auto">
                                {modalMode === 'delete' ? (
                                    <div>
                                        <p className="text-gray-600">
                                            Are you sure you want to delete this role?
                                        </p>
                                        <p className="font-semibold text-gray-900 mt-2">
                                            {selectedRole?.role_name}
                                        </p>
                                        {selectedRole?.users_count > 0 && (
                                            <p className="text-red-600 text-sm mt-2">
                                                Warning: This role is assigned to {selectedRole.users_count} users.
                                            </p>
                                        )}
                                    </div>
                                ) : modalMode === 'view' ? (
                                    <div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Role Name
                                            </label>
                                            <p className="text-sm text-gray-900">{selectedRole?.role_name}</p>
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Description
                                            </label>
                                            <p className="text-sm text-gray-900">{selectedRole?.description}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Permissions
                                            </label>
                                            <div className="space-y-3">
                                                {modules.map(module => (
                                                    <div key={module.id} className="border rounded-lg p-3">
                                                        <div className="font-medium text-sm text-gray-900 mb-2">
                                                            {module.name}
                                                        </div>
                                                        <div className="flex flex-wrap gap-3">
                                                            {module.permissions.map(permission => (
                                                                <div key={permission} className="flex items-center">
                                                                    {selectedRole?.permissions[module.id]?.includes(permission) ? (
                                                                        <Check className="w-4 h-4 text-green-600 mr-1" />
                                                                    ) : (
                                                                        <X className="w-4 h-4 text-gray-300 mr-1" />
                                                                    )}
                                                                    <span className={`text-xs ${
                                                                        selectedRole?.permissions[module.id]?.includes(permission)
                                                                            ? 'text-gray-900'
                                                                            : 'text-gray-400'
                                                                    }`}>
                                                                        {permission}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="mb-4">
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
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Description
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                placeholder="Enter role description"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Permissions
                                            </label>
                                            <div className="space-y-3">
                                                {modules.map(module => (
                                                    <div key={module.id} className="border rounded-lg p-3">
                                                        <div className="font-medium text-sm text-gray-900 mb-2">
                                                            {module.name}
                                                        </div>
                                                        <div className="flex flex-wrap gap-3">
                                                            {module.permissions.map(permission => (
                                                                <label key={permission} className="flex items-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="mr-2"
                                                                        checked={formData.permissions[module.id]?.includes(permission) || false}
                                                                        onChange={(e) => handlePermissionChange(module.id, permission, e.target.checked)}
                                                                    />
                                                                    <span className="text-xs text-gray-700">
                                                                        {permission}
                                                                    </span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
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
                                    {modalMode === 'view' ? 'Close' : 'Cancel'}
                                </button>
                                {modalMode !== 'view' && (
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
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
RoleAccessManagement.layout = Admin;