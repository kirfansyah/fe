import { useState, useEffect, useCallback } from "react";
import RoleService from '../services/RoleService';


export function useRoles() {
    const [roles, setRoles] = useState([]);
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // ✅ Get all roles
    const fetchRoles = useCallback(async () => {
        setLoading(true);
        setError(null);

        const result = await RoleService.getAllRoles();

        if (result.success) {
            setRoles(result.data);
        } else {
            setError(result.message);
        }

        setLoading(false);
    }, []);

    // ✅ Create or Update role
    const handleCreateRoles = useCallback(async (rolesData) => {
        setLoading(true);
        setError(null);

        let result;
        if (rolesData.id_role) {
            result = await RoleService.updateRoles(rolesData);
        } else {
            result = await RoleService.createRoles(rolesData);
        }

        if (result.success) {
            await fetchRoles(); // Refresh list
        } else {
            setError(result.message);
        }

        setLoading(false);
        return result;
    }, [fetchRoles]);

    // ✅ Get role by ID
    const fetchRoleByID = useCallback(async (roleId) => {
        if (!roleId) {
            console.warn('fetchRoleByID: roleId is required');
            return { success: false, data: null, message: 'Role ID is required' };
        }

        setLoading(true);
        setError(null);

        const result = await RoleService.getRoleById(roleId);

        if (!result.success) {
            setError(result.message);
        }

        setLoading(false);
        return result;
    }, []);

    // ✅ Get all menus
    const fetchMenus = useCallback(async () => {
        setLoading(true);
        setError(null);

        const result = await RoleService.getAllMenus();

        if (result.success) {
            setMenus(result.data);
        } else {
            setError(result.message);
        }

        setLoading(false);
    }, []);

    // ✅ Create or Update menu
    const handleCreateMenus = useCallback(async (menusData) => {
        setLoading(true);
        setError(null);

        let result;
        if (menusData.id_menu) {
            result = await RoleService.updateMenus(menusData); // ⚠️ Check if this should be updateMenus
        } else {
            result = await RoleService.createMenus(menusData);
        }

        if (result.success) {
            await fetchMenus(); // Refresh list
        } else {
            setError(result.message);
        }

        setLoading(false);
        return result;
    }, [fetchMenus]);

    // ✅ Update role permissions
    const handleUpdateRolePermissions = useCallback(async (permissionsData) => {
        setLoading(true);
        setError(null);

        const result = await RoleService.updateRolesConfig(permissionsData);

        if (result.success) {
            await fetchRoles(); // Refresh list
        } else {
            setError(result.message);
        }

        setLoading(false);
        return result;
    }, [fetchRoles]);

    // ✅ Create category
    const handleCreateCategory = useCallback(async (categoryData) => {
        setLoading(true);
        setError(null);

        let result;
        if (categoryData.id_category) {
            result = await RoleService.updateCategory(categoryData);
        } else {
            result = await RoleService.createCategory(categoryData);
        }

        if (result.success) {
        } else {
            setError(result.message);
        }

        setLoading(false);
        return result;
    }, []);

    // ✅ Create subcategory
    const handleCreateSubCategory = useCallback(async (subCategoryData) => {
        setLoading(true);
        setError(null);

        let result;
        if (subCategoryData.id_subcategory) {
            result = await RoleService.updateSubCategory(subCategoryData);
        } else {
            result = await RoleService.createSubCategory(subCategoryData);
        }

        if (result.success) {
        } else {
            setError(result.message);
        }

        setLoading(false);
        return result;
    }, []);

    // ✅ Update user permissions
    const handleUpdateUser = useCallback(async (userData) => {
        setLoading(true);
        setError(null);

        const result = await RoleService.updateUsers(userData);
        if (result.success) {
            await fetchRoles(); // Refresh list
        } else {
            setError(result.message);
        }

        setLoading(false);
        return result;
    }, [fetchRoles]);
    
    // Dashboard Analytics ********************************** Home  \\
    const fetchAnalytics = useCallback(async (filters = {}) => {
        setLoading(true);
        setError(null);

        const result = await RoleService.getAnalytics(filters);

        if (!result.success) {
            setError(result.message);
        }

        setLoading(false);
        return result;
    }, []);

    const fetchSchedule = useCallback(async () => {
        setLoading(true);
        setError(null);

        const result = await RoleService.getSchedule();

        if (!result.success) {
            setError(result.message);
        }

        setLoading(false);
        return result;
    }, []);

    // ✅ Initial load
    useEffect(() => {
        Promise.all([fetchRoles(), fetchMenus()]);
    }, [fetchRoles, fetchMenus]);

    return {
        roles,
        menus,
        loading,
        error,
        fetchRoles,
        handleCreateRoles,
        fetchRoleByID,
        fetchMenus,
        handleCreateMenus,
        handleUpdateRolePermissions,
        fetchAnalytics,
        fetchSchedule,
        handleCreateCategory,
        handleCreateSubCategory,
        handleUpdateUser
    };
}