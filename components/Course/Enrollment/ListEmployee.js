import { useState,useEffect } from "react";
import { Users, Search, ChevronDown, X, Plus, Check } from "lucide-react";
import { useCourses } from "../../../hooks/useCourses";
import { useSweetAlert } from '../../../hooks/useSweetAlert';
export default function ListEmployee(
    { created_by }
) {
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [showGroupingModal, setShowGroupingModal] = useState(false);
    const [selectedGroupings, setSelectedGroupings] = useState([]);
    const { employeeData, groupEnroll, fetchEmployeeData, loading,error, handleSaveAssignEmployeeGrouping } = useCourses();
    const { showLoading, showSuccess, showError, confirmAction, showWarning } = useSweetAlert();
    
    const employees = employeeData?.data || [];
    const pagination = employeeData?.pagination || {
        totalCount: 0,
        pageSize: 10,
        currentPage: 1,
        totalPages: 1
    };

    useEffect(() => {
        fetchEmployeeData(currentPage, pageSize);
    }, [fetchEmployeeData,currentPage, pageSize]);


    
    const availableGroupings = groupEnroll || [];

    const getGroupingColor = (groupingId) => {
        // Map warna berdasarkan nama grouping
        const colorMap = {
            '1': 'bg-gray-500 text-white',
            '2': 'bg-red-500 text-white',
            '3': 'bg-blue-500 text-white',
            '4': 'bg-green-500 text-white',
            '5': 'bg-purple-500 text-white',
            '6': 'bg-yellow-500 text-white',
        };

        return colorMap[groupingId] || 'bg-gray-400 text-white';
    };

    const filteredEmployees = employees.filter(employee =>
        employee.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.no_ktp.includes(searchQuery) ||
        employee.position_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.dept_abbr.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedEmployees(filteredEmployees.map(emp => emp.id));
        } else {
            setSelectedEmployees([]);
        }
    };

    const handleSelectEmployee = (id, checked) => {
        if (checked) {
            setSelectedEmployees([...selectedEmployees, id]);
        } else {
            setSelectedEmployees(selectedEmployees.filter(empId => empId !== id));
        }
    };

    const handleOpenGroupingModal = () => {
        if (selectedEmployees.length === 0) {
            alert('Please select at least one employee');
            return;
        }
        setShowGroupingModal(true);
        setSelectedGroupings([]);
    };

    const handleToggleGrouping = (groupingId) => {
        if (selectedGroupings.includes(groupingId)) {
            setSelectedGroupings(selectedGroupings.filter(id => id !== groupingId));
        } else {
            setSelectedGroupings([...selectedGroupings, groupingId]);
        }
    };

    const handleSaveGroupings = async () => {
        if (selectedGroupings.length === 0) {
            showWarning('Please select at least one grouping');
            return;
        }

        const payload = [];
        
        selectedEmployees.forEach(no_ktp => {
            selectedGroupings.forEach(id_grouping => {
                payload.push({
                    no_ktp: no_ktp,
                    id_grouping: id_grouping,
                    assigned_by:created_by
                });
            });
        });

        const result = await confirmAction(
            'Are you sure you want to assign the selected groupings to the selected employees?',
            'This action cannot be undone.'
        );
        if (!result.isConfirmed) {
            return;
        }

        try {
            showLoading('Saving groupings...');
            setTimeout(() => {
                showSuccess('Groupings assigned successfully');
            }, 1000);
            await handleSaveAssignEmployeeGrouping(payload);
            setShowGroupingModal(false);
            setSelectedEmployees([]);
            setSelectedGroupings([]);
            
            // Refresh employee list
            fetchEmployeeData(currentPage, pageSize);
        } catch (error) {
            showError('Failed to assign groupings: ' + error.message);
        }
    };

    // Pagination handlers
    const handlePageSizeChange = (newSize) => {
        setPageSize(newSize);
        setCurrentPage(1); // Reset to first page
    };

    const handleNextPage = () => {
        if (currentPage < pagination.totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Show error if any
    useEffect(() => {
        if (error) {
            console.error('Employee fetch error:', error);
        }
    }, [error]);

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex items-center justify-between gap-4">
                {/* Left side */}
                <div className="flex items-center gap-4">
                    <button 
                        onClick={handleOpenGroupingModal}
                        disabled={selectedEmployees.length === 0}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Users size={20} />
                        Assign Grouping
                        {selectedEmployees.length > 0 && (
                            <span className="ml-1 px-2 py-0.5 bg-green-700 rounded-full text-xs">
                                {selectedEmployees.length}
                            </span>
                        )}
                    </button>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"     
                            placeholder="Search employees..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-96"
                        />
                    </div>
                </div>

                {/* Right side - Filters */}
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                        <span>Company Unit</span>
                        <ChevronDown size={16} />
                    </button>
                    
                    <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                        <span>Department</span>
                        <ChevronDown size={16} />
                    </button>
                    
                    <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                        <span>Position</span>
                        <ChevronDown size={16} />
                    </button>
                    
                    <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                        <span>Grouping</span>
                        <ChevronDown size={16} />
                    </button>
                </div>
            </div>

            {/* Selected info */}
            {selectedEmployees.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
                    <span className="text-sm text-blue-800 font-medium">
                        {selectedEmployees.length} employee(s) selected
                    </span>
                    <button 
                        onClick={() => setSelectedEmployees([])}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Clear selection
                    </button>
                </div>
            )}

            {/* Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="w-12 px-6 py-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                    />
                                </th>
                                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Name</th>
                                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Employee ID</th>
                                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Position</th>
                                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Department</th>
                                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Company Unit</th>
                                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Groupings</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredEmployees.slice(0, pageSize).map((employee) => (
                                <tr 
                                    key={employee.no_ktp} 
                                    className={`hover:bg-gray-50 transition-colors ${
                                        selectedEmployees.includes(employee.id) ? 'bg-blue-50' : ''
                                    }`}
                                >
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedEmployees.includes(employee.no_ktp)}
                                            onChange={(e) => handleSelectEmployee(employee.no_ktp, e.target.checked)}
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{employee.nama}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-600">{employee.no_ktp}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">{employee.position_name}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-600">{employee.dept_abbr}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-600">{employee.company_name}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {employee.groupings?.map((grouping, index) => (
                                                <span
                                                    key={index}
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${getGroupingColor(grouping.id_grouping)}`}
                                                >
                                                    {grouping.grouping_name}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Empty state */}
                {filteredEmployees.length === 0 && (
                    <div className="text-center py-12">
                        <Users className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">No employees found</h3>
                        <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters</p>
                    </div>
                )}
            </div>

            {/* Footer - Pagination */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Rows per page:</span>
                        <select
                            value={pageSize}
                            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                            className="py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                        Showing {pagination.totalCount > 0 ? pagination.offset + 1 : 0} to {Math.min(pagination.offset + pageSize, pagination.totalCount)} of {pagination.totalCount} employees
                    </div>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrevPage}
                        disabled={!pagination.hasPrevious}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Previous
                    </button>
                    
                    <span className="text-sm text-gray-600">
                        Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    
                    <button
                        onClick={handleNextPage}
                        disabled={!pagination.hasNext}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* Grouping Modal */}
            {showGroupingModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Assign Groupings
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Select groupings for {selectedEmployees.length} selected employee(s)
                                </p>
                            </div>
                            <button
                                onClick={() => setShowGroupingModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="space-y-3">
                                {availableGroupings.map((grouping) => (
                                    <label
                                        key={grouping.id}
                                        className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                            selectedGroupings.includes(grouping.id)
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedGroupings.includes(grouping.id)}
                                            onChange={() => handleToggleGrouping(grouping.id)}
                                            className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900">
                                                    {grouping.name_group}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getGroupingColor(grouping.id)}`}>
                                                    {grouping.name_group}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {grouping.description}
                                            </p>
                                        </div>
                                        {selectedGroupings.includes(grouping.id) && (
                                            <Check size={20} className="text-blue-600 mt-0.5" />
                                        )}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 bg-gray-50">
                            <div className="text-sm text-gray-600">
                                {selectedGroupings.length} grouping(s) selected
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowGroupingModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveGroupings}
                                    disabled={selectedGroupings.length === 0}
                                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Check size={20} />
                                    Assign Groupings
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}