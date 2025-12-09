import { useState, useEffect, useCallback } from "react";
import CourseRatingFeedbackService from "../services/CourseRatingFeedbackService";

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
      const response = await CourseRatingFeedbackService.getAllRatings(
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
        console.error("Rating fetch failed:", response.message);
        setError(response.message || "Failed to fetch ratings");
      }
    } catch (err) {
      console.error("Error fetching ratings:", err);
      setError(err.message || "An error occurred while fetching ratings");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Feedbacks
  const fetchFeedbacks = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await CourseRatingFeedbackService.getAllFeedbacks(
        page,
        limit
      );

      if (response.success) {
        setFeedbacks(response.data);
        setPagination({
          page: response.pagination?.currentPage || page,
          limit: response.pagination?.pageSize || limit,
          totalPages: response.pagination?.totalPages || 1,
          totalItems: response.pagination?.totalCount || response.data.length,
          hasNext: response.pagination?.hasNext || false,
          hasPrevious: response.pagination?.hasPrevious || false,
        });
      } else {
        console.error("Feedback fetch failed:", response.message);
        setError(response.message || "Failed to fetch feedbacks");
      }
    } catch (err) {
      console.error("Error fetching feedbacks:", err);
      setError(err.message || "An error occurred while fetching feedbacks");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Single Rating
  const fetchRatingById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await CourseRatingFeedbackService.getRatingById(id);
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || "Failed to fetch rating");
        return null;
      }
    } catch (err) {
      setError(err.message || "An error occurred while fetching rating");
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
      const response = await CourseRatingFeedbackService.getFeedbackById(id);
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || "Failed to fetch feedback");
        return null;
      }
    } catch (err) {
      setError(err.message || "An error occurred while fetching feedback");
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
