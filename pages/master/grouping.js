import React, { useState, useEffect, useContext } from 'react';
import { 
    Trash2, 
    Edit,
    Search,
    Home, 
    ChevronRight,
    Users
} from 'lucide-react';
import Admin from "layouts/Admin.js";
import { ProfileContext } from '@/contexts/profile/ProfileContext';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { useCourses } from "@/hooks/useCourses";
export default function MasterGrouping() {
    
    const [loading, setLoading] = useState(true);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [formData, setFormData] = useState({ name_group: '' });
    
    const { getKaryawan, dataKaryawan } = useContext(ProfileContext);
    const dataKaryawans = dataKaryawan?.length ? dataKaryawan[0] : [];
    const { showLoading, showSuccess, showError, confirmAction } = useSweetAlert();
    const { 
            groupEnroll,
            addGroupEnroll
        } = useCourses();
    const groups = groupEnroll || [];
    useEffect(() => {
        setLoading(false);
        getKaryawan();
    }, []);


    // Filter data based on search
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

    // Generate page numbers
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

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
    };

    // Handle Edit
    const handleEdit = (group) => {
        setSelectedGroup(group);
        setFormData({ 
            name_group: group.name_group,
            id: group.id 
        });
        setModalMode('edit');
        setShowModal(true);
    };

    // Handle Delete
    const handleDelete = (group) => {
        setSelectedGroup(group);
        setModalMode('delete');
        setShowModal(true);
    };

    // Handle Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (modalMode === 'add') {
            const groupData = {
                name_group: formData.name_group,
                created_by: dataKaryawans.nama || 'System',
                created_device: 'web'
            };
            
            const result = await confirmAction('Are you sure you want to add this group?');
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
            const groupData = {
                name_group: formData.name_group,
                updated_by: dataKaryawans.nama || 'System',
                updated_device: 'web'
            };
            
            const result = await confirmAction('Are you sure you want to save changes to this group?');
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
            const result = await confirmAction('Are you sure you want to delete this group?');
            if (!result.isConfirmed) return;
            
            showLoading('Deleting group...');
            try {
                const response = await fetch(`/api/master/grouping/${selectedGroup.id}`, {
                    method: "DELETE"
                });

                const responseData = await response.json();

                if (responseData.success) {
                    await fetchGroups();
                    showSuccess('Group deleted successfully');
                    setShowModal(false);
                } else {
                    showError('Failed to delete group');
                }
            } catch (error) {
                showError(`Failed to delete group: ${error.message}`);
            }
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">Master Grouping</h1>
                        <p className="text-gray-600 text-sm">Manage employee grouping categories</p>
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
                                <option value="5">5</option>
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
                                    setFormData({ name_group: '' });
                                    setShowModal(true);
                                }}
                                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Add New Group
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
                                                <td className="px-4 py-3 text-sm">
                                                    {group.id}
                                                </td>
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
                                                <td className="px-4 py-3 text-sm">
                                                    {formatDate(group.created_at)}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    {formatDate(group.updated_at)}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => handleEdit(group)}
                                                            className="p-1.5 hover:text-blue-600 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(group)}
                                                            className="p-1.5 hover:text-red-600 transition-colors"
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