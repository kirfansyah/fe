// hooks/useReport.js
import { useState, useEffect, useCallback } from "react";
import API from "../services/ReportService";

export function useReport() {
    // Online Learning State
    const [onlineLearningData, setOnlineLearningData] = useState({ 
      data: [], 
      pagination: null 
    });
    const [loadingOnline, setLoadingOnline] = useState(false);
    const [errorOnline, setErrorOnline] = useState(null);

    // Offline Learning State
    const [offlineLearningData, setOfflineLearningData] = useState({ 
      data: [], 
      pagination: null 
    });
    const [loadingOffline, setLoadingOffline] = useState(false);
    const [errorOffline, setErrorOffline] = useState(null);

    // Master Data State
    const [position, setPosition] = useState([]);
    const [dept, setDept] = useState([]);
    const [company, setCompany] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // ✅ Fetch Online Learning with Pagination & Filters
    const fetchOnlineLearning = useCallback(async (page = 1, pageSize = 10, filters = {}) => {
      setLoadingOnline(true);
      setErrorOnline(null);

      try {
        const params = {
          page,
          limit: pageSize,
          search: filters.search || '',
          company_id: filters.company_id || [],
          dept_id: filters.dept_id || [],
          course_id: filters.course_id || [],
          status: filters.status || '',
          issue_date: filters.issue_date || ''
        };

        const response = await API.getAllOnlineLearning(params);
        
        setOnlineLearningData({
          data: response.data || [],
          pagination: response.pagination || {
            currentPage: page,
            pageSize: pageSize,
            totalCount: 0,
            totalPages: 1,
            hasNext: false,
            hasPrevious: false
          }
        });
      } catch (err) {
        console.error("Error fetch OnlineLearning:", err);
        const msg = err?.message || "Failed to fetch OnlineLearning";
        setErrorOnline(msg);
        setOnlineLearningData({ data: [], pagination: null });
      } finally {
        setLoadingOnline(false);
      }
    }, []);

    // ✅ Fetch Offline Learning with Pagination & Filters
    const fetchOfflineLearning = useCallback(async (page = 1, pageSize = 10, filters = {}) => {
      setLoadingOffline(true);
      setErrorOffline(null);

      try {
        const params = {
          page,
          limit: pageSize,
          search: filters.search || '',
          company_id: filters.company_id || [],
          dept_id: filters.dept_id || [],
          training_title: filters.training_title || '',
          provider: filters.provider || '',
          status: filters.status || ''
        };

        const response = await API.getAllOfflineLearning(params);
        
        setOfflineLearningData({
          data: response.data || [],
          pagination: response.pagination || {
            currentPage: page,
            pageSize: pageSize,
            totalCount: 0,
            totalPages: 1,
            hasNext: false,
            hasPrevious: false
          }
        });
      } catch (err) {
        console.error("Error fetch OfflineLearning:", err);
        const msg = err?.message || "Failed to fetch OfflineLearning";
        setErrorOffline(msg);
        setOfflineLearningData({ data: [], pagination: null });
      } finally {
        setLoadingOffline(false);
      }
    }, []);

    // ✅ Create Offline Learning
    const addOfflineLearning = useCallback(async (offlineLearningData) => {
      setLoadingOffline(true);
      setErrorOffline(null);

      try {
        const response = await API.createOfflineLearning(offlineLearningData);
        return response.data;
      } catch (err) {
        const errorMessage = err.message || "Failed to create offline learning";
        setErrorOffline(errorMessage);
        console.error("Error creating offline learning:", err);
        throw err;
      } finally {
        setLoadingOffline(false);
      }
    }, []);

    // ✅ Update Offline Learning
    const updateOfflineLearning = useCallback(async (id, offlineLearningData) => {
      setLoadingOffline(true);
      setErrorOffline(null);

      try {
        const response = await API.updateOfflineLearning(id, offlineLearningData);
        return response.data;
      } catch (err) {
        const errorMessage = err.message || "Failed to update certificate";
        setErrorOffline(errorMessage);
        console.error("Error updating certificate:", err);
        throw err;
      } finally {
        setLoadingOffline(false);
      }
    }, []);

    // ✅ Delete Offline Learning
    const deleteOfflineLearning = useCallback(async (id) => {
      setLoadingOffline(true);
      setErrorOffline(null);

      try {
        await API.deleteOfflineLearning(id);
        return { success: true };
      } catch (err) {
        const errorMessage = err.message || "Failed to delete certificate";
        setErrorOffline(errorMessage);
        console.error("Error deleting certificate:", err);
        throw err;
      } finally {
        setLoadingOffline(false);
      }
    }, []);

    // ✅ Fetch Position
    const fetchPosition = useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await API.getAllPosition();
        setPosition(res.data || []);
      } catch (err) {
        setError(err.message || "Failed to fetch Position");
        console.error("Error fetching Position:", err);
        setPosition([]);
      } finally {
        setLoading(false);
      }
    }, []);

    // ✅ Fetch Department
    const fetchDept = useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await API.getAllDept();
        setDept(res.data || []);
      } catch (err) {
        setError(err.message || "Failed to fetch Department");
        console.error("Error fetching Dept:", err);
        setDept([]);
      } finally {
        setLoading(false);
      }
    }, []);

    // ✅ Fetch Company
    const fetchCompany = useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await API.getAllCompany();
        setCompany(res.data || []);
      } catch (err) {
        setError(err.message || "Failed to fetch Company");
        console.error("Error fetching Company:", err);
        setCompany([]);
      } finally {
        setLoading(false);
      }
    }, []);

    // ✅ Fetch Single Employee
    const fetchEmployee = useCallback(async (companyId, employeeId) => {
      if (!companyId || !employeeId) return null;

      setLoading(true);
      setError(null);

      try {
        const res = await API.getEmployee(companyId, employeeId);
        return res;
      } catch (err) {
        setError(err.message || "Employee not found");
        throw err;
      } finally {
        setLoading(false);
      }
    }, []);

    // ✅ Initial Load - Only Master Data
    useEffect(() => {
      fetchPosition();
      fetchDept();
      fetchCompany();
    }, [fetchPosition, fetchDept, fetchCompany]);

    // ✅ Refetch function for manual refresh
    const refetch = useCallback(() => {
      fetchPosition();
      fetchDept();
      fetchCompany();
    }, [fetchPosition, fetchDept, fetchCompany]);

    return {
      // Online Learning
      onlineLearning: onlineLearningData.data,
      onlineLearningPagination: onlineLearningData.pagination,
      loadingOnline,
      errorOnline,
      fetchOnlineLearning,

      // Offline Learning
      offlineLearning: offlineLearningData.data,
      offlineLearningPagination: offlineLearningData.pagination,
      loadingOffline,
      errorOffline,
      fetchOfflineLearning,
      addOfflineLearning,
      updateOfflineLearning,
      deleteOfflineLearning,

      // Master Data
      position,
      dept,
      company,
      loading,
      error,
      fetchEmployee,
      refetch
    };
}