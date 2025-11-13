import { useState, useEffect, useCallback, use} from "react";
import API from '../services/RoleService';

export function useRoles(contentId = null){
    const [roles, setRoles] = useState([]);
    const [rolesData, setRolesData] = useState(null);

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
            setRolesData(res.data);    
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


    useEffect(() => {
        Promise.all([fetchRoles(), fetchMenus()]);
    }, [fetchRoles, fetchMenus]);
    
  return {
    roles, 
    menus,
    rolesData,
    loading, 
    error,           
    fetchRoles, 
    handleCreateRoles,
    fetchRoleByID,
    fetchMenus
  };
}
