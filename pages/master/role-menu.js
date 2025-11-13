import React, { useState, useEffect, use } from 'react';
import { 
    Trash2, 
    Edit,
    Search,
    Menu,
    ChevronRight,
    ChevronDown,
    Plus,
    FileText,
    Settings,
    Users,
    Shield,
    Home,
    BarChart,
    Package,
    Folder,
    Grid,
    Copy,
    MoreVertical,
    Calendar,
    Book,
    MessageSquare,
    User
} from 'lucide-react';
import Admin from "layouts/Admin.js";
import { useRoles } from "../../hooks/useRoles";
export default function MenuManagement() {
    // State Management
    const [loading, setLoading] = useState(true);
    const [expandedRows, setExpandedRows] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedMenu, setSelectedMenu] = useState(null);
    const [formData, setFormData] = useState({ 
        menu_code: '',
        menu_name: '',
        menu_url: '',
        menu_icon: '',
        parent_id: null,
        menu_type: 'header',
        menu_order: 1,
        is_active: true,
        roles: []
    });

    // Available icons for menu
    const availableIcons = [
        { name: 'icon-home', icon: Home },
        { name: 'icon-user', icon: Users },
        { name: 'icon-shield', icon: Shield },
        { name: 'icon-setting', icon: Settings },
        { name: 'icon-dashboard', icon: BarChart },
        { name: 'icon-course', icon: Package },
        { name: 'icon-calendar', icon: Calendar },
        { name: 'icon-library', icon: Book },
        { name: 'icon-feedback', icon: MessageSquare },
        { name: 'icon-employee', icon: User },
        { name: 'icon-master', icon: Grid },
        { name: 'icon-report', icon: FileText },
        { name: 'icon-portal', icon: Menu },
        { name: 'icon-profile', icon: User },
        { name: 'icon-course-mgmt', icon: Folder }
    ];
    const {menus} = useRoles();
    useEffect(() => {
        setLoading(false);
    }, []);
    // Toggle row expansion
    const toggleRowExpansion = (menuId) => {
        if (expandedRows.includes(menuId)) {
            setExpandedRows(expandedRows.filter(id => id !== menuId));
        } else {
            setExpandedRows([...expandedRows, menuId]);
        }
    };

    // Get all parent menus for dropdown
    const getParentMenus = () => {
        return menus.filter(menu => menu.menu_type === 'header');
    };

    // Filter data based on search and filters
    const filterMenus = (menuList) => {
        return menuList.filter(menu => {
            const matchesSearch = 
                menu.menu_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                menu.menu_url.toLowerCase().includes(searchTerm.toLowerCase()) ||
                menu.menu_code.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesType = filterType === 'all' || menu.menu_type === filterType;
            const matchesStatus = filterStatus === 'all' || 
                (filterStatus === 'active' ? menu.is_active : !menu.is_active);
            
            return matchesSearch && matchesType && matchesStatus;
        });
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
    const handleAdd = (parentId = null) => {
        setModalMode('add');
        setFormData({ 
            menu_code: '',
            menu_name: '',
            menu_url: '',
            menu_icon: '',
            parent_id: parentId,
            menu_type: parentId ? 'submenu' : 'header',
            menu_order: 1,
            is_active: true,
            roles: []
        });
        setShowModal(true);
    };

    const handleEdit = (menu) => {
        setSelectedMenu(menu);
        setFormData({ 
            menu_code: menu.menu_code,
            menu_name: menu.menu_name,
            menu_url: menu.menu_url,
            menu_icon: menu.menu_icon || '',
            parent_id: menu.parent_id,
            menu_type: menu.menu_type,
            menu_order: menu.menu_order,
            is_active: menu.is_active,
            roles: menu.roles
        });
        setModalMode('edit');
        setShowModal(true);
    };

    const handleDelete = (menu) => {
        setSelectedMenu(menu);
        setModalMode('delete');
        setShowModal(true);
    };

    const handleDuplicate = (menu) => {
        setFormData({ 
            menu_code: `${menu.menu_code}_COPY`,
            menu_name: `${menu.menu_name} (Copy)`,
            menu_url: menu.menu_url,
            menu_icon: menu.menu_icon || '',
            parent_id: menu.parent_id,
            menu_type: menu.menu_type,
            menu_order: menu.menu_order + 1,
            is_active: menu.is_active,
            roles: menu.roles
        });
        setModalMode('add');
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (modalMode === 'add') {
            console.log('Adding menu:', formData);
        } else if (modalMode === 'edit') {
            console.log('Editing menu:', formData);
        } else if (modalMode === 'delete') {
            console.log('Deleting menu:', selectedMenu);
        }
        
        setShowModal(false);
        setFormData({ 
            menu_code: '',
            menu_name: '',
            menu_url: '',
            menu_icon: '',
            parent_id: null,
            menu_type: 'header',
            menu_order: 1,
            is_active: true,
            roles: []
        });
    };

    // Available roles
    const availableRoles = ['Administrator', 'Trainer', 'Learner A', 'Learner B'];

    // Get icon component
    const getIconComponent = (iconName) => {
        const icon = availableIcons.find(i => i.name === iconName);
        if (icon) {
            const IconComponent = icon.icon;
            return <IconComponent className="w-4 h-4" />;
        }
        return null;
    };

    // Render menu rows with hierarchy
    const renderMenuRow = (menu, level = 0) => {
        const hasChildren = menu.submenu && menu.submenu.length > 0;
        const isExpanded = expandedRows.includes(menu.id_menu);
        const filteredChildren = hasChildren ? filterMenus(menu.submenu) : [];

        return (
            <React.Fragment key={menu.id_menu}>
                <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                        <div className="flex items-center" style={{ paddingLeft: `${level * 24}px` }}>
                            {hasChildren && (
                                <button
                                    onClick={() => toggleRowExpansion(menu.id_menu)}
                                    className="mr-2 p-1 hover:bg-gray-200 rounded"
                                >
                                    {isExpanded ? (
                                        <ChevronDown className="w-4 h-4 text-gray-600" />
                                    ) : (
                                        <ChevronRight className="w-4 h-4 text-gray-600" />
                                    )}
                                </button>
                            )}
                            {!hasChildren && level > 0 && (
                                <span className="mr-6"></span>
                            )}
                            <div className="flex items-center gap-2">
                                {menu.menu_icon && getIconComponent(menu.menu_icon)}
                                <span className="text-sm font-medium text-gray-900">
                                    {menu.menu_name}
                                </span>
                            </div>
                        </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-600">
                        {menu.menu_code}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                        {menu.menu_url || '-'}
                    </td>
                    <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                            menu.menu_type === 'header' 
                                ? 'bg-purple-100 text-purple-800'
                                : menu.menu_type === 'submenu'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                        }`}>
                            {menu.menu_type}
                        </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-900">
                        {menu.menu_order}
                    </td>
                    <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                            {menu.roles.slice(0, 2).map(role => (
                                <span key={role} className="inline-flex px-1.5 py-0.5 text-xs rounded bg-gray-100 text-gray-600">
                                    {role}
                                </span>
                            ))}
                            {menu.roles.length > 2 && (
                                <span className="inline-flex px-1.5 py-0.5 text-xs rounded bg-gray-100 text-gray-600">
                                    +{menu.roles.length - 2}
                                </span>
                            )}
                        </div>
                    </td>
                    <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                            menu.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-600'
                        }`}>
                            {menu.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                            {menu.menu_type === 'header' && (
                                <button
                                    onClick={() => handleAdd(menu.id_menu)}
                                    className="p-1.5 text-gray-600 hover:text-green-600 transition-colors"
                                    title="Add Submenu"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            )}
                            <button
                                onClick={() => handleEdit(menu)}
                                className="p-1.5 text-gray-600 hover:text-blue-600 transition-colors"
                                title="Edit"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <div className="relative group">
                                <button
                                    className="p-1.5 text-gray-600 hover:text-gray-800 transition-colors"
                                    title="More Actions"
                                >
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                                <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 hidden group-hover:block z-10">
                                    <button
                                        onClick={() => handleDuplicate(menu)}
                                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <Copy className="w-3 h-3" /> Duplicate
                                    </button>
                                    <hr className="my-1" />
                                    <button
                                        onClick={() => handleDelete(menu)}
                                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                                    >
                                        <Trash2 className="w-3 h-3" /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
                {hasChildren && isExpanded && filteredChildren.map(child => 
                    renderMenuRow(child, level + 1)
                )}
            </React.Fragment>
        );
    };

    const filteredMenus = filterMenus(menus);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-[#5577B5] via-[#6B8BC5] to-[#7B9DD8] shadow-lg">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Menu Management</h1>
                        <p className="text-blue-100">Manage system navigation menus</p>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                        <Home className="w-4 h-4 text-blue-100" />
                        <span className="text-blue-100 text-sm">Home</span>
                        <ChevronRight className="w-4 h-4 text-blue-100" />
                        <span className="text-white text-sm font-medium">Menu Management</span>
                    </div>
                </div>
            </div>

            {/* Main Container */}
            <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                        {/* Filters */}
                        <div className="flex flex-wrap items-center gap-4">
                            <select
                                className="py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="all">All Types</option>
                                <option value="header">Header</option>
                                <option value="submenu">Submenu</option>
                            </select>

                            <select
                                className="py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>

                            <button
                                onClick={() => setExpandedRows(menus.map(m => m.id_menu))}
                                className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Expand All
                            </button>
                            
                            <button
                                onClick={() => setExpandedRows([])}
                                className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Collapse All
                            </button>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => handleAdd(null)}
                                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add New Menu
                            </button>

                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
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
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Menu Name
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Code
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            URL
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Order
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Roles
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredMenus.map(menu => renderMenuRow(menu, 0))}
                                    {filteredMenus.length === 0 && (
                                        <tr>
                                            <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                                                No data available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {modalMode === 'add' && 'Add New Menu'}
                                {modalMode === 'edit' && 'Edit Menu'}
                                {modalMode === 'delete' && 'Delete Menu'}
                            </h3>
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 max-h-[60vh] overflow-y-auto">
                                {modalMode === 'delete' ? (
                                    <div>
                                        <p className="text-gray-600">
                                            Are you sure you want to delete this menu?
                                        </p>
                                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                            <p className="font-semibold text-gray-900">
                                                {selectedMenu?.menu_name}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Code: {selectedMenu?.menu_code}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                URL: {selectedMenu?.menu_url}
                                            </p>
                                            {selectedMenu?.submenu && selectedMenu.submenu.length > 0 && (
                                                <p className="text-red-600 text-sm mt-2">
                                                    Warning: This menu has {selectedMenu.submenu.length} submenu(s). They will also be deleted.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Menu Code <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    value={formData.menu_code}
                                                    onChange={(e) => setFormData({ ...formData, menu_code: e.target.value.toUpperCase() })}
                                                    placeholder="e.g. MENU_DASHBOARD"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Menu Name <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    value={formData.menu_name}
                                                    onChange={(e) => setFormData({ ...formData, menu_name: e.target.value })}
                                                    placeholder="Enter menu name"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Menu URL
                                                </label>
                                                <input
                                                    type="text"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    value={formData.menu_url}
                                                    onChange={(e) => setFormData({ ...formData, menu_url: e.target.value })}
                                                    placeholder="e.g. /dashboard"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Icon
                                                </label>
                                                <select
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    value={formData.menu_icon}
                                                    onChange={(e) => setFormData({ ...formData, menu_icon: e.target.value })}
                                                >
                                                    <option value="">No Icon</option>
                                                    {availableIcons.map(icon => (
                                                        <option key={icon.name} value={icon.name}>
                                                            {icon.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {formData.menu_icon && (
                                                    <div className="mt-2 p-2 border rounded flex items-center gap-2">
                                                        Preview: {getIconComponent(formData.menu_icon)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Menu Type
                                                </label>
                                                <select
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    value={formData.menu_type}
                                                    onChange={(e) => setFormData({ ...formData, menu_type: e.target.value })}
                                                    disabled={formData.parent_id !== null}
                                                >
                                                    <option value="header">Header</option>
                                                    <option value="submenu">Submenu</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Parent Menu
                                                </label>
                                                <select
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    value={formData.parent_id || ''}
                                                    onChange={(e) => setFormData({ 
                                                        ...formData, 
                                                        parent_id: e.target.value ? parseInt(e.target.value) : null,
                                                        menu_type: e.target.value ? 'submenu' : 'header'
                                                    })}
                                                >
                                                    <option value="">None</option>
                                                    {getParentMenus().map(menu => (
                                                        <option key={menu.id_menu} value={menu.id_menu}>
                                                            {menu.menu_name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Order
                                                </label>
                                                <input
                                                    type="number"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    value={formData.menu_order}
                                                    onChange={(e) => setFormData({ ...formData, menu_order: parseInt(e.target.value) })}
                                                    min="1"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Status
                                            </label>
                                            <select
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                value={formData.is_active.toString()}
                                                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                                            >
                                                <option value="true">Active</option>
                                                <option value="false">Inactive</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Access Roles
                                            </label>
                                            <div className="space-y-2 p-3 border border-gray-200 rounded-md">
                                                {availableRoles.map(role => (
                                                    <label key={role} className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            className="mr-2"
                                                            checked={formData.roles.includes(role)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setFormData({ 
                                                                        ...formData, 
                                                                        roles: [...formData.roles, role]
                                                                    });
                                                                } else {
                                                                    setFormData({ 
                                                                        ...formData, 
                                                                        roles: formData.roles.filter(r => r !== role)
                                                                    });
                                                                }
                                                            }}
                                                        />
                                                        <span className="text-sm text-gray-700">{role}</span>
                                                    </label>
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
                                    {modalMode === 'add' && 'Add Menu'}
                                    {modalMode === 'edit' && 'Save Changes'}
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

MenuManagement.layout = Admin;