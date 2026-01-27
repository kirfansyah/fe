import { useState, useCallback } from "react";
import EbookServiceEmployee from "../services/EbookServiceEmployee";

const useEbookEmployee = () => {
  const [ebooks, setEbooks] = useState([]);
  const [selectedEbook, setSelectedEbook] = useState(null);
  const [ebookDescription, setEbookDescription] = useState(null);

  const [readingHistory, setReadingHistory] = useState([]);
  const [readingProgress, setReadingProgress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [reviews, setReviews] = useState([]);

  /**
   * Fetch all ebooks
   */
  const fetchEbooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await EbookServiceEmployee.getAllEbook();
      if (response.success) {
        setEbooks(response.data);
        setPagination(response.pagination);
      }
      return response;
    } catch (err) {
      setError(err.message);
      console.error("useEbookEmployee.fetchEbooks Error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch ebook detail by ID
   */
  const fetchEbookById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await EbookServiceEmployee.getEbookById(id);
      if (response.success) {
        setSelectedEbook(response.data);
      }
      return response;
    } catch (err) {
      setError(err.message);
      console.error("useEbookEmployee.fetchEbookById Error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Check if user has reading progress for this ebook
   * Returns { hasProgress: boolean, lastPage: number, logId: number }
   */
  const checkReadingProgress = useCallback(async (ebookId) => {
    try {
      const response = await EbookServiceEmployee.getReadingProgress(ebookId);
      if (response.success && response.data.id_log != 0) {
        return {
          hasProgress: true,
          lastPage: response.data.last_page || 1,
          logId: response.data.id_log,
          statusRead: response.data.status_read,
        };
      }
      return { hasProgress: false, lastPage: 1, logId: null };
    } catch (err) {
      console.error("useEbookEmployee.checkReadingProgress Error:", err);
      return { hasProgress: false, lastPage: 1, logId: null };
    }
  }, []);

  /**
   * Start reading ebook (create log)
   * Now checks for existing progress first
   */
  const startReading = useCallback(
    async (ebookId, userData = {}) => {
      setLoading(true);
      setError(null);
      try {
        // First check if user has reading progress
        const progress = await checkReadingProgress(ebookId);

        if (progress.hasProgress && progress.statusRead !== "Done") {
          // User has unfinished reading, return existing log
          return {
            success: true,
            id_log: progress.logId,
            last_page: progress.lastPage,
            is_resume: true,
            message: "Resuming previous reading session",
          };
        }

        // No progress or completed, start new reading session
        const payload = {
          id_ebook: ebookId,
          last_page: 1,
          start_time: new Date().toISOString(),
          created_device: userData.device || getDeviceInfo(),
          created_by: userData.userId || "system",
        };

        const response = await EbookServiceEmployee.openEbook(payload);
        return {
          ...response,
          last_page: 1,
          is_resume: false,
        };
      } catch (err) {
        setError(err.message);
        console.error("useEbookEmployee.startReading Error:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [checkReadingProgress],
  );

  /**
   * Update reading progress
   */
  const updateProgress = useCallback(
    async (logId, currentPage, totalPages, userData = {}) => {
      setLoading(true);
      setError(null);
      try {
        const isCompleted = currentPage >= totalPages;

        const payload = {
          id_log: logId,
          last_page: currentPage,
          status_read: isCompleted ? "Done" : "In Progress",
          updated_by: userData.userId || "system",
          updated_device: userData.device || getDeviceInfo(),
        };

        const response = await EbookServiceEmployee.updateProgress(payload);
        return response;
      } catch (err) {
        setError(err.message);
        console.error("useEbookEmployee.updateProgress Error:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Complete reading (mark as done)
   */
  const completeReading = useCallback(
    async (logId, lastPage, userData = {}) => {
      setLoading(true);
      setError(null);
      try {
        const payload = {
          id_log: logId,
          last_page: lastPage,
          status_read: "Done",
          updated_by: userData.userId || "system",
          updated_device: userData.device || getDeviceInfo(),
        };

        const response = await EbookServiceEmployee.completeReading(payload);
        return response;
      } catch (err) {
        setError(err.message);
        console.error("useEbookEmployee.completeReading Error:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Fetch reading history
   */
  const fetchReadingHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await EbookServiceEmployee.getReadingHistory();
      if (response.success) {
        setReadingHistory(response.data);
      }
      return response;
    } catch (err) {
      setError(err.message);
      console.error("useEbookEmployee.fetchReadingHistory Error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch reading progress for specific ebook
   */
  const fetchReadingProgress = useCallback(async (ebookId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await EbookServiceEmployee.getReadingProgress(ebookId);
      if (response.success) {
        setReadingProgress(response.data);
      }
      return response;
    } catch (err) {
      setError(err.message);
      console.error("useEbookEmployee.fetchReadingProgress Error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setEbooks([]);
    setSelectedEbook(null);
    setReadingHistory([]);
    setReadingProgress(null);
    setError(null);
    setPagination(null);
  }, []);

  /**
   * Submit ebook review
   */
  const submitReview = useCallback(
    async (ebookId, rating, comment, userData = {}) => {
      setLoading(true);
      setError(null);
      try {
        const payload = {
          id_ebook: ebookId,
          rating: rating,
          comment: comment,
          created_by: userData.userId || "system",
          created_device: userData.device || getDeviceInfo(),
        };

        const response = await EbookServiceEmployee.submitReview(payload);
        return response;
      } catch (err) {
        setError(err.message);
        console.error("useEbookEmployee.submitReview Error:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Get ebook reviews
   */
  const fetchEbookReviews = useCallback(async (ebookId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await EbookServiceEmployee.getEbookReviews(ebookId);
      if (response.success) {
        setReviews(response.data);
      }
      return response;
    } catch (err) {
      setError(err.message);
      console.error("useEbookEmployee.fetchEbookReviews Error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch ebook detail by ID (with reading progress)
   */
  const fetchEbookDetail = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await EbookServiceEmployee.getEbookDetail(id);
      if (response.success) {
        setSelectedEbook(response.data);
      }
      return response;
    } catch (err) {
      setError(err.message);
      console.error("useEbookEmployee.fetchEbookDetail Error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch ebook detail by ID (with reading progress)
   */
  const fetchEbookDescription = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await EbookServiceEmployee.getEbookDescription(id);
      if (response.success) {
        setEbookDescription(response.data);
      }
      return response;
    } catch (err) {
      setError(err.message);
      console.error("useEbookEmployee.fetchEbookDescription Error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // State
    ebooks,
    selectedEbook,
    ebookDescription,
    readingHistory,
    readingProgress,
    reviews,
    loading,
    error,
    pagination,

    // Actions
    fetchEbooks,
    fetchEbookById,
    startReading,
    updateProgress,
    completeReading,
    fetchReadingHistory,
    fetchReadingProgress,
    checkReadingProgress,
    submitReview,
    fetchEbookReviews,
    fetchEbookDetail,
    fetchEbookDescription,
    clearError,
    reset,
  };
};

/**
 * Helper function to get device info
 */
const getDeviceInfo = () => {
  const userAgent = navigator.userAgent;
  let deviceType = "Desktop";

  if (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent,
    )
  ) {
    deviceType = "Mobile";
  } else if (/iPad|Android/i.test(userAgent)) {
    deviceType = "Tablet";
  }

  return `${deviceType} - ${navigator.platform}`;
};

export default useEbookEmployee;
