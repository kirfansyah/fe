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
    EyeOff
} from 'lucide-react';
import Admin from "layouts/Admin.js";
export default function UserManagement() {
    // State Management
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ 
        username: '',
        email: '',
        full_name: '',
        phone: '',
        department: '',
        role: '',
        status: 'Active',
        password: '',
        confirm_password: ''
    });

    // Sample data
    useEffect(() => {
        setTimeout(() => {
            setUsers([
                { 
                    id: 1, 
                    username: 'john.doe',
                    email: 'john.doe@company.com',
                    full_name: 'John Doe',
                    phone: '+62 812-3456-7890',
                    department: 'IT Department',
                    role: 'Admin',
                    status: 'Active',
                    last_login: '2024-03-15 09:30:00',
                    created_at: '2024-01-15'
                },
                { 
                    id: 2, 
                    username: 'jane.smith',
                    email: 'jane.smith@company.com',
                    full_name: 'Jane Smith',
                    phone: '+62 812-9876-5432',
                    department: 'HR Department',
                    role: 'Manager',
                    status: 'Active',
                    last_login: '2024-03-14 14:20:00',
                    created_at: '2024-01-20'
                },
                { 
                    id: 3, 
                    username: 'mike.johnson',
                    email: 'mike.johnson@company.com',
                    full_name: 'Mike Johnson',
                    phone: '+62 813-1111-2222',
                    department: 'Finance',
                    role: 'Staff',
                    status: 'Active',
                    last_login: '2024-03-13 10:15:00',
                    created_at: '2024-02-01'
                },
                { 
                    id: 4, 
                    username: 'sarah.wilson',
                    email: 'sarah.wilson@company.com',
                    full_name: 'Sarah Wilson',
                    phone: '+62 813-3333-4444',
                    department: 'Marketing',
                    role: 'Manager',
                    status: 'Active',
                    last_login: '2024-03-12 16:45:00',
                    created_at: '2024-02-10'
                },
                { 
                    id: 5, 
                    username: 'david.brown',
                    email: 'david.brown@company.com',
                    full_name: 'David Brown',
                    phone: '+62 813-5555-6666',
                    department: 'Operations',
                    role: 'Staff',
                    status: 'Inactive',
                    last_login: '2024-02-28 11:30:00',
                    created_at: '2024-02-15'
                },
                { 
                    id: 6, 
                    username: 'emily.davis',
                    email: 'emily.davis@company.com',
                    full_name: 'Emily Davis',
                    phone: '+62 813-7777-8888',
                    department: 'Sales',
                    role: 'Staff',
                    status: 'Active',
                    last_login: '2024-03-15 08:00:00',
                    created_at: '2024-03-01'
                },
                { 
                    id: 7, 
                    username: 'robert.miller',
                    email: 'robert.miller@company.com',
                    full_name: 'Robert Miller',
                    phone: '+62 813-9999-0000',
                    department: 'IT Department',
                    role: 'Super Admin',
                    status: 'Active',
                    last_login: '2024-03-15 10:00:00',
                    created_at: '2024-01-10'
                },
                { 
                    id: 8, 
                    username: 'lisa.garcia',
                    email: 'lisa.garcia@company.com',
                    full_name: 'Lisa Garcia',
                    phone: '+62 814-1111-2222',
                    department: 'HR Department',
                    role: 'Staff',
                    status: 'Active',
                    last_login: '2024-03-14 13:30:00',
                    created_at: '2024-03-05'
                },
                { 
                    id: 9, 
                    username: 'james.martinez',
                    email: 'james.martinez@company.com',
                    full_name: 'James Martinez',
                    phone: '+62 814-3333-4444',
                    department: 'Finance',
                    role: 'Manager',
                    status: 'Suspended',
                    last_login: '2024-03-01 09:00:00',
                    created_at: '2024-02-20'
                },
                { 
                    id: 10, 
                    username: 'mary.anderson',
                    email: 'mary.anderson@company.com',
                    full_name: 'Mary Anderson',
                    phone: '+62 814-5555-6666',
                    department: 'Marketing',
                    role: 'Staff',
                    status: 'Active',
                    last_login: '2024-03-15 11:45:00',
                    created_at: '2024-03-10'
                }
            ]);

            setRoles([
                'Super Admin',
                'Admin',
                'Manager',
                'Staff',
                'Viewer'
            ]);

            setDepartments([
                'IT Department',
                'HR Department',
                'Finance',
                'Marketing',
                'Sales',
                'Operations'
            ]);

            setLoading(false);
        }, 500);
    }, []);

    // Filter data based on search and filters
    const filteredData = users.filter(user => {
        const matchesSearch = 
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.department.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
        
        return matchesSearch && matchesRole && matchesStatus;
    });

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

    // Handle functions
    const handleView = (user) => {
        setSelectedUser(user);
        setModalMode('view');
        setShowModal(true);
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setFormData({ 
            username: user.username,
            email: user.email,
            full_name: user.full_name,
            phone: user.phone,
            department: user.department,
            role: user.role,
            status: user.status,
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

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (modalMode === 'add') {
            const newUser = {
                id: users.length + 1,
                ...formData,
                last_login: null,
                created_at: new Date().toISOString()
            };
            setUsers([...users, newUser]);
        } else if (modalMode === 'edit') {
            setUsers(users.map(u => 
                u.id === selectedUser.id 
                    ? { ...u, ...formData }
                    : u
            ));
        } else if (modalMode === 'delete') {
            setUsers(users.filter(u => u.id !== selectedUser.id));
        }
        
        setShowModal(false);
        setFormData({ 
            username: '',
            email: '',
            full_name: '',
            phone: '',
            department: '',
            role: '',
            status: 'Active',
            password: '',
            confirm_password: ''
        });
    };

    // Export users
    const handleExport = () => {
        console.log('Exporting users...');
        // Implementation for export functionality
    };

    // Import users
    const handleImport = () => {
        console.log('Importing users...');
        // Implementation for import functionality
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
                                onChange={(e) => setFilterRole(e.target.value)}
                            >
                                <option value="all">All Roles</option>
                                {roles.map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>

                            <select
                                className="py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Suspended">Suspended</option>
                            </select>
                        </div>

                        {/* Right Controls */}
                        <div className="flex items-center gap-4">
                            {/* Add Button */}
                            <button
                                onClick={() => {
                                    setModalMode('add');
                                    setFormData({ 
                                        username: '',
                                        email: '',
                                        full_name: '',
                                        phone: '',
                                        department: '',
                                        role: '',
                                        status: 'Active',
                                        password: '',
                                        confirm_password: ''
                                    });
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
                                                User
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Contact
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Department
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Role
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
                                            <tr key={user.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center">
                                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                                            <span className="text-xs font-medium text-gray-600">
                                                                {user.full_name.split(' ').map(n => n[0]).join('')}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {user.full_name}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                @{user.username}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-sm text-gray-900">{user.email}</div>
                                                    <div className="text-xs text-gray-500">{user.phone}</div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                    {user.department}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                                                        user.status === 'Active' 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : user.status === 'Inactive'
                                                            ? 'bg-gray-100 text-gray-600'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {user.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                    {formatDateTime(user.last_login)}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex items-center justify-center gap-2">
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
                    <div className={`bg-white rounded-lg shadow-xl w-full ${modalMode === 'view' ? 'max-w-2xl' : 'max-w-lg'}`}>
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
                                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                            <p className="font-semibold text-gray-900">
                                                {selectedUser?.full_name}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                @{selectedUser?.username}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {selectedUser?.email}
                                            </p>
                                        </div>
                                    </div>
                                ) : modalMode === 'view' ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Username
                                                </label>
                                                <p className="text-sm text-gray-900">@{selectedUser?.username}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Full Name
                                                </label>
                                                <p className="text-sm text-gray-900">{selectedUser?.full_name}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Email
                                                </label>
                                                <p className="text-sm text-gray-900">{selectedUser?.email}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Phone
                                                </label>
                                                <p className="text-sm text-gray-900">{selectedUser?.phone}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Department
                                                </label>
                                                <p className="text-sm text-gray-900">{selectedUser?.department}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Role
                                                </label>
                                                <p className="text-sm text-gray-900">{selectedUser?.role}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Status
                                                </label>
                                                <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                                                    selectedUser?.status === 'Active' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : selectedUser?.status === 'Inactive'
                                                        ? 'bg-gray-100 text-gray-600'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {selectedUser?.status}
                                                </span>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Last Login
                                                </label>
                                                <p className="text-sm text-gray-900">{formatDateTime(selectedUser?.last_login)}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Created Date
                                                </label>
                                                <p className="text-sm text-gray-900">{formatDate(selectedUser?.created_at)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : modalMode === 'reset-password' ? (
                                    <div>
                                        <p className="text-gray-600 mb-4">
                                            Reset password for user:
                                        </p>
                                        <div className="p-3 bg-gray-50 rounded-lg mb-4">
                                            <p className="font-semibold text-gray-900">
                                                {selectedUser?.full_name}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                @{selectedUser?.username}
                                            </p>
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
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-2 top-2"
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
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Username
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    value={formData.username}
                                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                    placeholder="Enter username"
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
                                                    value={formData.full_name}
                                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                                    placeholder="Enter full name"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Email
                                                </label>
                                                <input
                                                    type="email"
                                                    required
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    placeholder="Enter email"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Phone
                                                </label>
                                                <input
                                                    type="tel"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    placeholder="Enter phone number"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Department
                                                </label>
                                                <select
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    value={formData.department}
                                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                                    required
                                                >
                                                    <option value="">Select Department</option>
                                                    {departments.map(dept => (
                                                        <option key={dept} value={dept}>{dept}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Role
                                                </label>
                                                <select
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    value={formData.role}
                                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                                    required
                                                >
                                                    <option value="">Select Role</option>
                                                    {roles.map(role => (
                                                        <option key={role} value={role}>{role}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Status
                                            </label>
                                            <select
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            >
                                                <option value="Active">Active</option>
                                                <option value="Inactive">Inactive</option>
                                                <option value="Suspended">Suspended</option>
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