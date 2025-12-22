import { useState, useEffect, useCallback } from "react";
import API from "../services/ReportService";

export function useReport() {
  const [onlineLearning, setOnlineLearning] = useState([]);
  const [offlineLearning, setOfflineLearning] = useState([]);

  const [loadingOnline, setLoadingOnline] = useState(false);
  const [loadingOffline, setLoadingOffline] = useState(false);

  const [errorOnline, setErrorOnline] = useState(null);
  const [errorOffline, setErrorOffline] = useState(null);

  const [position, setPosition] = useState([]);
  const [dept, setDept] = useState([]);
  const [company, setCompany] = useState([]);
  const [employee, setEmployee] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOnlineLearning = useCallback(async () => {
    setLoadingOnline(true);
    setErrorOnline(null);

    try {
      const res = await API.getAllOnlineLearning();
      const data = res?.data || [];
      setOnlineLearning(data);
    } catch (err) {
      console.error("Error fetch OnlineLearning:", err);
      const msg = err?.message || "Failed to fetch OnlineLearning";
      setErrorOnline(msg);

      if (msg.includes("401")) {
        console.warn("⚠ Using dummy data (unauthenticated)");
        setOnlineLearning([]);
        setErrorOnline("Using demo data (not authenticated)");
      }
    } finally {
      setLoadingOnline(false);
    }
  }, []);

  const fetchOfflineLearning = useCallback(async () => {
    setLoadingOffline(true);
    setErrorOffline(null);

    try {
      const res = await API.getAllOfflineLearning();
      const data = res?.data || [];
      setOfflineLearning(data);
    } catch (err) {
      console.error("Error fetch OfflineLearning:", err);
      const msg = err?.message || "Failed to fetch OfflineLearning";
      setErrorOffline(msg);

      if (msg.includes("401")) {
        console.warn("⚠ Using dummy data (unauthenticated)");
        setOfflineLearning([]);
        setErrorOffline("Using demo data (not authenticated)");
      }
    } finally {
      setLoadingOffline(false);
    }
  }, []);

  // save data certificate
  const addOfflineLearning = useCallback(
    async (offlineLearningData) => {
      setLoadingOffline(true);
      setErrorOffline(null);

      try {
        const newOfflineLearning = await API.createOfflineLearning(
          offlineLearningData
        );
        // Refresh list
        await fetchOfflineLearning();

        return newOfflineLearning.data;
      } catch (err) {
        const errorMessage = err.message || "Failed to create offline learning";
        setErrorOffline(errorMessage);
        console.error("Error creating offline learning:", err);

        // Show alert to user
        alert(`Failed to create offline learning: ${errorMessage}`);

        throw err;
      } finally {
        setLoadingOffline(false);
      }
    },
    [fetchOfflineLearning]
  );

  // Update certificate
  const updateOfflineLearning = useCallback(
    async (id, offlineLearningData) => {
      setLoading(true);
      setError(null);

      try {
        const updateOfflineLearning = await API.updateOfflineLearning(
          id,
          offlineLearningData
        );

        await fetchOfflineLearning();

        return updateOfflineLearning.data;
      } catch (err) {
        const errorMessage = err.message || "Failed to update certificate";
        setError(errorMessage);
        console.error("Error updating certificate:", err);

        alert(`Failed to update certificate: ${errorMessage}`);

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchOfflineLearning]
  );

  //  get all data Department
  const fetchPosition = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await API.getAllPosition();
      setPosition(res.data);
    } catch (err) {
      setError(err.message || "Failed to fetch Position");
      console.error("Error fetching Position:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  //  get all data Department
  const fetchDept = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await API.getAllDept();
      setDept(res.data);
    } catch (err) {
      setError(err.message || "Failed to fetch Department");
      console.error("Error fetching Dept:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompany = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await API.getAllCompany();
      setCompany(res.data);
    } catch (err) {
      setError(err.message || "Failed to fetch Department");
      console.error("Error fetching Company:", err);
    } finally {
      setLoading(false);
    }
  }, []);

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

  useEffect(() => {
    fetchOnlineLearning();
    fetchOfflineLearning();
    fetchPosition();
    fetchDept();
    fetchCompany();
  }, [
    fetchOnlineLearning,
    fetchOfflineLearning,
    fetchPosition,
    fetchDept,
    fetchCompany,
  ]);

  return {
    onlineLearning,
    offlineLearning,

    loadingOnline,
    loadingOffline,

    errorOnline,
    errorOffline,

    position,
    dept,
    company,
    employee,
    loading,
    error,

    fetchEmployee,
    fetchOnlineLearning,
    fetchOfflineLearning,
    addOfflineLearning,
    updateOfflineLearning,
  };
}
