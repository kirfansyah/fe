import React, { useState, useEffect, useContext } from 'react';
import { 
    Trash2, 
    Edit,
    Search,
    Home, 
    ChevronRight,
    Users,
    Lock,
    Shield
} from 'lucide-react';
import Admin from "layouts/Admin.js";
import { ProfileContext } from '@/contexts/profile/ProfileContext';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { useCourses } from "@/hooks/useCourses";
import { useMenuPermissions } from '@/hooks/useMenuPermissions'; // ✅ Import
import { getDeviceInfo } from '@/lib/deviceHelper';
export default function MasterGrouping() {
    // ✅ ALL HOOKS FIRST
    useEffect(() => {
        setLoading(false);
    }, []);
    const permissions = useMenuPermissions();
    const { dataKaryawan } = useContext(ProfileContext);
    const { showLoading, showSuccess, showError, confirmAction } = useSweetAlert();
    const { groupEnroll, addGroupEnroll, deleteGroupEnroll } = useCourses();
    
    const [loading, setLoading] = useState(true);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [formData, setFormData] = useState({ name_group: '' });
    
    const groups = groupEnroll || [];
    const deviceInfo = getDeviceInfo();

    // Filter data
    const filteredData = groups.filter(group =>
        group.name_group.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (group.id && group.id.toString().includes(searchTerm))
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

    // ✅ Handle Add - Check permission
    const handleAdd = () => {
        if (!permissions.can_create) {
            showError('You do not have permission to create groups');
            return;
        }

        setModalMode('add');
        setFormData({ name_group: '' });
        setShowModal(true);
    };

    // ✅ Handle Edit - Check permission
    const handleEdit = (group) => {
        if (!permissions.can_edit) {
            showError('You do not have permission to edit groups');
            return;
        }

        setSelectedGroup(group);
        setFormData({ 
            name_group: group.name_group,
            id: group.id 
        });
        setModalMode('edit');
        setShowModal(true);
    };

    // ✅ Handle Delete - Check permission
    const handleDelete = (group) => {
        if (!permissions.can_delete) {
            showError('You do not have permission to delete groups');
            return;
        }

        setSelectedGroup(group);
        setFormData({ 
            id: group.id 
        });
        setModalMode('delete');
        setShowModal(true);
    };

    // ✅ Handle Submit - Check permission based on mode
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (modalMode === 'add') {
            if (!permissions.can_create) {
                showError('You do not have permission to create groups');
                return;
            }

            const groupData = {
                name_group: formData.name_group,
                created_by: dataKaryawan.nama || 'System',
                created_device: deviceInfo.device
            };
            
            const result = await confirmAction({
                title: 'Add New Group',
                text: 'Are you sure you want to add this group?',
                icon: 'question'
            });
            if (!result.isConfirmed) return;
            
            showLoading('Adding new group...');
            try {
                await addGroupEnroll(groupData);
                showSuccess('Group added successfully');
                setShowModal(false);
                setFormData({ name_group: '' });
            } catch (error) {
                showError(`Failed to add group: ${error.message}`);
            }
        } else if (modalMode === 'edit') {
            if (!permissions.can_edit) {
                showError('You do not have permission to edit groups');
                return;
            }

            const groupData = {
                id: formData.id,
                name_group: formData.name_group,
                updated_by: dataKaryawan.nama || 'System',
                updated_device: deviceInfo.device
            };
            
            const result = await confirmAction({
                title: 'Update Group',
                text: 'Are you sure you want to save changes to this group?',
                icon: 'question'
            });
            if (!result.isConfirmed) return;
            
            showLoading('Saving changes...');
            try {
                await addGroupEnroll(groupData);
                showSuccess('Group updated successfully');
                setShowModal(false);
                setFormData({ name_group: '' });
            } catch (error) {
                showError(`Failed to update group: ${error.message}`);
            }
        } else if (modalMode === 'delete') {
            if (!permissions.can_delete) {
                showError('You do not have permission to delete groups');
                return;
            }
            const groupId = formData.id;
            const result = await confirmAction({
                title: 'Delete Group',
                text: 'Are you sure you want to delete this group?',
                icon: 'warning'
            });
            if (!result.isConfirmed) return;
            
            showLoading('Deleting group...');
            try {
                await deleteGroupEnroll(groupId);
                showSuccess('Group deleted successfully');
                setShowModal(false);
            } catch (error) {
                showError(`Failed to delete group: ${error.message}`);
            }
        }
    };

    // ✅ AFTER all hooks - Check view permission
    if (!permissions.can_view) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="max-w-md text-center p-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600 mb-6">
                        You do not have permission to view master grouping.
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
                            <h1 className="text-2xl font-bold text-gray-900">Master Grouping</h1>
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
                                ? 'Manage employee grouping categories'
                                : 'View employee grouping categories (read-only mode)'
                            }
                        </p>
                    </div>
                    
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm">
                        <Home className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">Home</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900 font-medium">Master Grouping</span>
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
                                You can view grouping data but cannot make changes. Contact your administrator for edit access.
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
                                    Add New Group
                                </button>
                            ) : (
                                <button
                                    disabled
                                    className="px-4 py-2 bg-gray-300 text-gray-500 text-sm rounded-md cursor-not-allowed flex items-center gap-2"
                                    title="No create permission"
                                >
                                    <Lock className="w-4 h-4" />
                                    Add New Group
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
                                                ID
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Group Name
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
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
                                            <tr key={group.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm">{group.id}</td>
                                                <td className="px-4 py-3 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="w-4 h-4 text-gray-400" />
                                                        <span>{group.name_group}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        !group.deleted_status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {!group.deleted_status ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm">{formatDate(group.created_at)}</td>
                                                <td className="px-4 py-3 text-sm">{formatDate(group.updated_at)}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex items-center justify-center gap-2">
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
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
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

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {modalMode === 'add' && 'Add New Group'}
                                {modalMode === 'edit' && 'Edit Group'}
                                {modalMode === 'delete' && 'Delete Group'}
                            </h3>
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="p-6">
                                {modalMode === 'delete' ? (
                                    <div>
                                        <p className="text-gray-600">
                                            Are you sure you want to delete this group?
                                        </p>
                                        <p className="font-semibold text-gray-900 mt-2">
                                            {selectedGroup?.name_group}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Group Name
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                value={formData.name_group}
                                                onChange={(e) => setFormData({ ...formData, name_group: e.target.value })}
                                                placeholder="Enter group name"
                                            />
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
        </div>
    );
}

MasterGrouping.layout = Admin;