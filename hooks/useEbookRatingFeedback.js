import { useState, useEffect, useCallback } from "react";
import EbookRatingFeedbackService from "../services/EbookRatingFeedbackService";

export function useRatingFeedback() {
  const [ratings, setRatings] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalItems: 0,
  });

  // Fetch Ratings
  const fetchRatings = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await EbookRatingFeedbackService.getAllRatings(
        page,
        limit
      );

      if (response.success) {
        setRatings(response.data);
        setPagination({
          page: response.pagination?.currentPage || page,
          limit: response.pagination?.pageSize || limit,
          totalPages: response.pagination?.totalPages || 1,
          totalItems: response.pagination?.totalCount || response.data.length,
          hasNext: response.pagination?.hasNext || false,
          hasPrevious: response.pagination?.hasPrevious || false,
        });
      } else {
        setError(response.message || "Failed to fetch ebook ratings");
      }
    } catch (err) {
      setError(err.message || "An error occurred while fetching ebook ratings");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Feedbacks with optional date filter
  const fetchFeedbacks = useCallback(async (date = null) => {
    setLoading(true);
    setError(null);
    try {
      const response = await EbookRatingFeedbackService.getAllFeedbacks(date);

      if (response.success) {
        setFeedbacks(response.data);
        setPagination({
          page: response.pagination?.currentPage || 1,
          limit: response.pagination?.pageSize || response.data.length,
          totalPages: response.pagination?.totalPages || 1,
          totalItems: response.pagination?.totalCount || response.data.length,
          hasNext: response.pagination?.hasNext || false,
          hasPrevious: response.pagination?.hasPrevious || false,
        });
      } else {
        setError(response.message || "Failed to fetch ebook feedbacks");
      }
    } catch (err) {
      setError(
        err.message || "An error occurred while fetching ebook feedbacks"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Single Rating
  const fetchRatingById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await EbookRatingFeedbackService.getRatingById(id);
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || "Failed to fetch ebook rating");
        return null;
      }
    } catch (err) {
      setError(err.message || "An error occurred while fetching ebook rating");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Single Feedback
  const fetchFeedbackById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await EbookRatingFeedbackService.getFeedbackById(id);
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || "Failed to fetch ebook feedback");
        return null;
      }
    } catch (err) {
      setError(
        err.message || "An error occurred while fetching ebook feedback"
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchRatings();
    fetchFeedbacks();
  }, [fetchRatings, fetchFeedbacks]);

  return {
    ratings,
    feedbacks,
    loading,
    error,
    pagination,
    fetchRatings,
    fetchFeedbacks,
    fetchRatingById,
    fetchFeedbackById,
  };
}
