import { useState, useEffect, useCallback } from "react";
import API from "../services/CalendarService";

export function useCalendar() {
  const fetchCalendar = useCallback(async (year, month, company_id = "") => {
    try {
      const result = await API.getSchedule(year, month, company_id);

      return {
        data: result.data || [],
        pagination: result.pagination || 0,
        result: result || [],
      };
    } catch (err) {
      console.error("❌ fetchCalendar error:", err);
      return { data: [], pagination: { totalCount: 0 } };
    }
  }, []);

  const fetchHoliday = useCallback(async (year) => {
    try {
      const result = await API.getHoliday(year);

      return {
        data: result || [],
      };
    } catch (err) {
      console.error("❌ fetchCalendar error:", err);
      return { data: [], pagination: { totalCount: 0 } };
    }
  }, []);

  return {
    fetchCalendar,
    fetchHoliday,
  };
}
