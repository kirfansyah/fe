import { useState } from "react";
import { Users, Search, ChevronDown } from "lucide-react";
export default function ListEmployee() {
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [pageSize, setPageSize] = useState(5);
    const employees = [
        {
        id: 1,
        name: 'Rury Illenia P',
        employeeId: '0123456789',
        position: 'Talent Management Head',
        department: 'Human Resources',
        companyUnit: 'Pulau Sambu Jakarta',
        groupings: ['All Employee', 'Department', 'Position']
        },
        {
        id: 2,
        name: 'Rury Illenia P',
        employeeId: '0123456789',
        position: 'Talent Management Head',
        department: 'Human Resources',
        companyUnit: 'Pulau Sambu Jakarta',
        groupings: ['All Employee', 'Department', 'Position']
        },
        {
        id: 3,
        name: 'Alfin Sari',
        employeeId: '2323111234',
        position: 'HR Officer',
        department: 'Human Resources',
        companyUnit: 'Pulau Sambu Jakarta',
        groupings: ['All Employee', 'Department', 'Position']
        }
    ];
    const getGroupingColor = (grouping) => {
        switch (grouping) {
        case 'All Employee':
            return 'bg-gray-500 text-white';
        case 'Department':
            return 'bg-red-500 text-white';
        case 'Position':
            return 'bg-blue-500 text-white';
        default:
            return 'bg-gray-400 text-white';
        }
    };
    const filteredEmployees = employees.filter(employee =>
        employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.employeeId.includes(searchQuery) ||
        employee.position.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const handleSelectAll = (checked) => {
        if (checked) {
        setSelectedEmployees(filteredEmployees.map(emp => emp.id));
        } else {
        setSelectedEmployees([]);
        }
    };
    return (
        <div className="mt-6 ml-2 grid grid-cols-1 gap-6 relative">
        {/* Header */}
            <div className="flex items-center justify-between mb-6 gap-6">
                <div className="flex items-center gap-6 flex-1 min-w-0">
                    <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    <Users size={20} />
                    Create Grouping
                    </button>
                    <div className="relative flex-1 max-w-2xl min-w-0">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"     
                            placeholder="Search employees..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                        />
                        
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    
                    {/* Filter Buttons */}
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <span>Company Unit</span>
                        <ChevronDown size={16} />
                    </button>
                    
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <span>Department</span>
                        <ChevronDown size={16} />
                    </button>
                    
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <span>Position</span>
                        <ChevronDown size={16} />
                    </button>
                    
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <span>Grouping</span>
                        <ChevronDown size={16} />
                    </button>
                </div>
            </div>

        {/* Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                        <th className="w-12 px-4 py-3">
                            <input
                            type="checkbox"
                            checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                        </th>
                        <th className="text-left px-4 py-3 font-medium text-gray-700">Name</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-700">Employee ID</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-700">Position</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-700">Department</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-700">Company Unit</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-700">Grouping List</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEmployees.map((employee) => (
                        <tr key={employee.id} className="border-t border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-3">
                            <input
                                type="checkbox"
                                checked={selectedEmployees.includes(employee.id)}
                                onChange={(e) => handleSelectEmployee(employee.id, e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            </td>
                            <td className="px-4 py-3 text-gray-900">{employee.name}</td>
                            <td className="px-4 py-3 text-gray-600">{employee.employeeId}</td>
                            <td className="px-4 py-3 text-gray-900">{employee.position}</td>
                            <td className="px-4 py-3 text-gray-600">{employee.department}</td>
                            <td className="px-4 py-3 text-gray-600">{employee.companyUnit}</td>
                            <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                                {employee.groupings.map((grouping, index) => (
                                <span
                                    key={index}
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${getGroupingColor(grouping)}`}
                                >
                                    {grouping}
                                </span>
                                ))}
                            </div>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        {/* Footer */}
            <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 p-1">page view</span>
                <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="rounded border-gray-300 text-gray-600 focus:ring-blue-500 py-1 "
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                </select>
                </div>
                
                <div className="text-sm text-gray-600">
                1 to {Math.min(pageSize, filteredEmployees.length)} of {filteredEmployees.length}
                </div>
            </div>
            
        </div>
    );
}