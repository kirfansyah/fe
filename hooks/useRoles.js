import { useState, useEffect, useCallback, use} from "react";
import API from '../services/RoleService';

export function useRoles(){
    const [roles, setRoles] = useState([]);
    const [menus, setMenus] = useState([]);
    const [menuData, setMenuData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null); 
   
    // get semua data course
    const fetchRoles = useCallback(async () => {
        setLoading(true);
        setError(null); 
        
        try {
            const res = await API.getAllRoles();
            setRoles(res.data);
        } catch (err) {
            setError(err.message || 'Failed to fetch courses');
        } finally {
            setLoading(false);
        }
    }, []);

    // save data roles
    const handleCreateRoles = useCallback(async (rolesData) => {    
        setLoading(true);
        setError(null);
        
        try {
            let response;
            if (rolesData.id_role) {
                response = await API.updateRoles(rolesData);
            } else {
                response = await API.createRoles(rolesData);
            }
            await fetchRoles();
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchRoles]);

    //get data role by id
    const fetchRoleByID = useCallback(async (roleId) => {
         if (!roleId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await API.getRoleById(roleId);
            return res
        } catch (err) {
            setError(err.message || 'Failed to fetch roles');
            console.error('Error fetching roles:', err);
            throw err;
        } finally {
            setLoading(false);
        }  
    }, []);

    // get semua data course
    const fetchMenus = useCallback(async () => {
        setLoading(true);
        setError(null); 
        
        try {
            const res = await API.getAllMenus();
            setMenus(res.data);
        } catch (err) {
            setError(err.message || 'Failed to fetch courses');
        } finally {
            setLoading(false);
        }
    }, []);

    // save data roles
    const handleCreateMenus = useCallback(async (menusData) => {    
        setLoading(true);
        setError(null);
        
        try {
            let response;
            if (menusData.id_menu) {
                response = await API.updateRoles(menusData);
            } else {
                response = await API.createMenus(menusData);
            }
            await fetchMenus();
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchMenus]);

    const handleUpdateRolePermissions = useCallback(async (permissionsData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await API.updateRolesConfig(permissionsData);
            await fetchRoles();
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchRoles]);

    const fetchAnalytics = useCallback(async (filters = {}) => {
        setLoading(true);
        setError(null); 
        
        try {
            const res = await API.getAnalytics(filters);
            return res;
        } catch (err) {
            setError(err.message || 'Failed to fetch analytics');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const handleCreateCategory = useCallback(async (categoryData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await API.createCategory(categoryData);
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    },[]);

    const handleCreateSubCategory = useCallback(async (subCategoryData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await API.createSubCategory(subCategoryData);
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    },[]);


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
    handleCreateCategory,
    handleCreateSubCategory,
  };
}
