"use client";

import { useEffect, useState } from "react";
import CourseLayout from "@/layouts/CourseLayout";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Calendar,
  Clock,
  Building2,
  Loader2,
} from "lucide-react";
import { useCalendar } from "@/hooks/useCalendar";
import { useRoles } from "@/hooks/useRoles";
import { parse } from "date-fns";

// ==========================
// FORMAT API DATE
// ==========================
function normalizeDate(dateStr) {
  if (!dateStr) return null;
  const [month, day, yearTime] = dateStr.split("/");
  const [year] = yearTime.split(" ");
  return `${year}-${month}-${day}`;
}

export default function CalendarPage() {
  const { fetchNotification, fetchSchedule, fetchCalenderHome } = useRoles();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const [dataCalendar, setDataCalendar] = useState(null);
  const [dataKaryawan, setDataKaryawan] = useState(null);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [loadingCalendar, setLoadingCalendar] = useState(true);
  const [calendarData, setCalendarData] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [schedulePage, setSchedulePage] = useState(1);
  const { fetchCalendar, fetchHoliday, getKaryawan } = useCalendar();

  // =====================================================
  // FETCH KARYAWAN SEKALI
  // =====================================================
  useEffect(() => {
    async function load() {
      const res = await getKaryawan();
      setDataKaryawan(res.data.data);
    }
    load();
  }, []);

  // =====================================================
  // FETCH EVENT BY MONTH (🔥 INI YANG BARU)
  // =====================================================
  useEffect(() => {
    if (!dataKaryawan?.user?.company_id) return;
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1; // 1–12

    async function load() {
      try {
        const company_id = dataKaryawan?.user?.company_id || "";
        const res = await fetchCalendar(year, month, company_id);
        setDataCalendar(res?.data || null);
        setCalendarData(res?.data || null);
      } catch (err) {
        console.error("Fetch Calendar error:", err);
      } finally {
        setLoadingCalendar(false);
      }
    }

    load();
  }, [currentMonth, dataKaryawan, calendarDate]);

  // =====================================================
  // FETCH HOLIDAYS SEKALI
  // =====================================================
  useEffect(() => {
    async function load() {
      const year = currentMonth.getFullYear();
      const res = await fetchHoliday(year);
      setHolidays(res.data.data);
    }
    load();
  }, [currentMonth]);

  // =====================================================
  // PARSE EVENTS DARI API
  // =====================================================
  useEffect(() => {
    if (!dataCalendar || !dataCalendar.events) {
      setEvents([]);
      return;
    }

    // console.log("karyawan :", dataKaryawan);

    const parsed = dataCalendar.events.map((e) => ({
      ...e,
      dateFormatted: normalizeDate(e.date),
    }));

    setEvents(parsed);
    setSchedules(parsed);
    setLoadingSchedules(false);
    // console.log(parsed);
  }, [dataCalendar]);

  useEffect(() => {
    if (selectedDate && window.innerWidth < 1024) {
      document
        .getElementById("event-panel")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedDate]);

  //   useEffect(() => {
  //     const loadSchedules = async () => {
  //       try {
  //         setLoadingSchedules(true);
  //         const result = await fetchSchedule();
  //         if (result?.data) {
  //           setSchedules(result.data);
  //         }
  //       } catch (error) {
  //         console.error("Error loading schedules:", error);
  //       } finally {
  //         setLoadingSchedules(false);
  //       }
  //     };
  //     loadSchedules();
  //   }, []);

  //   useEffect(() => {
  //     const loadCalendar = async () => {
  //       try {
  //         setLoadingCalendar(true);
  //         const year = calendarDate.getFullYear();
  //         const month = calendarDate.getMonth() + 1;
  //         const result = await fetchCalenderHome({ year, month });
  //         if (result?.data) {
  //           setCalendarData(result.data);
  //         }
  //       } catch (error) {
  //         console.error("Error loading calendar:", error);
  //       } finally {
  //         setLoadingCalendar(false);
  //       }
  //     };
  //     loadCalendar();
  //   }, [calendarDate]);

  // =====================================================
  // FILTER EVENT BY SELECTED DATE
  // =====================================================
  const eventsForSelected = selectedDate
    ? events.filter((e) => e.dateFormatted === selectedDate)
    : [];

  // =====================================================
  // GENERATE CALENDAR
  // =====================================================
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const getEventsForDate = (dateStr) => {
    if (!calendarData?.events || !dateStr) return [];

    return calendarData.events.filter((event) => {
      try {
        // Parse start date
        const [startDatePart] = event.date.split(" ");
        const [startMonth, startDay, startYear] = startDatePart.split("/");
        const eventStartStr = `${startYear}-${startMonth.padStart(
          2,
          "0"
        )}-${startDay.padStart(2, "0")}`;

        // Parse end date
        const [endDatePart] = event.end_date.split(" ");
        const [endMonth, endDay, endYear] = endDatePart.split("/");
        const eventEndStr = `${endYear}-${endMonth.padStart(
          2,
          "0"
        )}-${endDay.padStart(2, "0")}`;

        // Check if dateStr is within range (inclusive)
        return dateStr >= eventStartStr && dateStr <= eventEndStr;
      } catch (error) {
        console.error("Error parsing event date:", event.date, error);
        return false;
      }
    });
  };

  const daysArray = [];
  const startOffset = (firstDay + 6) % 7;

  const getMonthName = (date) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  for (let i = 0; i < startOffset; i++) daysArray.push(null);
  for (let d = 1; d <= daysInMonth; d++) daysArray.push(d);

  const monthName = currentMonth.toLocaleString("default", { month: "long" });
  const eventDates = events.map((e) => e.dateFormatted);
  const todayStr = new Date().toISOString().split("T")[0];
  const isToday = (dateStr) => {
    if (!dateStr) return false;
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    return dateStr === todayStr;
  };

  // =====================================================
  // PREV / NEXT MONTH
  // =====================================================
  function prevMonth() {
    setCurrentMonth(new Date(year, month - 1, 1));
    setSelectedDate(null); // optional
  }

  function nextMonth() {
    setCurrentMonth(new Date(year, month + 1, 1));
    setSelectedDate(null); // optional
  }

  const handlePrevMonth = () => {
    setCalendarDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
    setSelectedDate(null); // optional
  };

  const handleNextMonth = () => {
    setCalendarDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
    setSelectedDate(null); // optional
  };
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Tambah helper function untuk check posisi dalam range
  const getEventPosition = (dateStr, event) => {
    try {
      const [startDatePart] = event.date.split(" ");
      const [startMonth, startDay, startYear] = startDatePart.split("/");
      const eventStartStr = `${startYear}-${startMonth.padStart(
        2,
        "0"
      )}-${startDay.padStart(2, "0")}`;

      const [endDatePart] = event.end_date.split(" ");
      const [endMonth, endDay, endYear] = endDatePart.split("/");
      const eventEndStr = `${endYear}-${endMonth.padStart(
        2,
        "0"
      )}-${endDay.padStart(2, "0")}`;

      const isStart = dateStr === eventStartStr;
      const isEnd = dateStr === eventEndStr;
      const isMiddle = dateStr > eventStartStr && dateStr < eventEndStr;

      return { isStart, isEnd, isMiddle };
    } catch (error) {
      return { isStart: false, isEnd: false, isMiddle: false };
    }
  };

  const generateCalendarDays = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    let startingDay = firstDay.getDay() - 1;
    if (startingDay < 0) startingDay = 6;

    const days = [];

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({
        date: prevMonthLastDay - i,
        isCurrentMonth: false,
        fullDate: null,
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const fullDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        i
      ).padStart(2, "0")}`;
      days.push({
        date: i,
        isCurrentMonth: true,
        fullDate,
      });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: i,
        isCurrentMonth: false,
        fullDate: null,
      });
    }

    return days;
  };

  const paginateData = (data, page, perPage) => {
    const start = (page - 1) * perPage;
    return data.slice(start, start + perPage);
  };

  const formatScheduleDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <CourseLayout>
      {/* <div className="p-6 space-y-4"> */}
      <div className="p-3 sm:p-4 lg:p-6 space-y-4">
        {/* Breadcrumb */}
        <Card className="rounded-lg shadow-md bg-gradient-to-r from-blue-900 to-blue-500 text-white">
          <CardContent className="flex items-center text-base font-semibold space-x-3 p-6">
            <Link href="/">Home</Link>
            <ChevronRight className="w-5 h-5 text-gray-300" />
            <span>Calendar</span>
          </CardContent>
        </Card>

        {/* <div className="grid grid-cols-[5fr_3fr] gap-6 mt-4"> */}
        <div
          className={`
                mt-4
                ${
                  isMobile
                    ? "flex flex-col gap-4"
                    : "grid grid-cols-[5fr_3fr] gap-6"
                }
            `}
        >
          {/* CALENDAR */}
          {/* Enhanced Calendar Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-500 p-2.5 rounded-xl shadow-lg">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {getMonthName(calendarDate)}
                    </h2>
                    <p className="text-xs text-gray-500">Event calendar</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2 hover:bg-white rounded-lg transition-all hover:scale-110 active:scale-95"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 hover:bg-white rounded-lg transition-all hover:scale-110 active:scale-95"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              {loadingCalendar ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                      (day) => (
                        <div
                          key={day}
                          className="text-center text-xs font-semibold text-gray-600 py-2"
                        >
                          {day}
                        </div>
                      )
                    )}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {generateCalendarDays().map((day, index) => {
                      const dateStr = day
                        ? `${year}-${String(month + 1).padStart(
                            2,
                            "0"
                          )}-${String(day).padStart(2, "0")}`
                        : null;
                      const events = getEventsForDate(day.fullDate);
                      const hasEvents = events.length > 0;
                      const isTodayDate = isToday(day.fullDate);

                      let isEventStart = false;
                      let isEventEnd = false;
                      let isEventMiddle = false;

                      if (hasEvents && events.length > 0) {
                        const position = getEventPosition(
                          day.fullDate,
                          events[0]
                        );
                        isEventStart = position.isStart;
                        isEventEnd = position.isEnd;
                        isEventMiddle = position.isMiddle;
                      }

                      const colIndex = index % 7;
                      const isLeftEdge = colIndex <= 1;
                      const isRightEdge = colIndex >= 5;
                      const isSunday = index % 7 === 6;
                      const isHoliday = holidays.includes(day.fullDate);
                      const hasEvent = eventDates.includes(day.fullDate);

                      return (
                        <div
                          key={`day-${day.fullDate || index}`}
                          onClick={() => day && setSelectedDate(dateStr)}
                          className={`
                                                            aspect-square flex flex-col items-center justify-center text-sm 
                                                            rounded-lg transition-all duration-200 cursor-pointer relative group
                                                            ${
                                                              !day.isCurrentMonth
                                                                ? "text-gray-300 opacity-50"
                                                                : isTodayDate
                                                                ? "bg-blue-500 text-white font-bold shadow-lg scale-105 ring-2 ring-blue-300"
                                                                : isEventStart
                                                                ? "bg-gradient-to-br from-orange-500 to-orange-400 text-white font-bold shadow-lg ring-2 ring-orange-600 hover:scale-110"
                                                                : isEventEnd
                                                                ? "bg-gradient-to-br from-orange-400 to-orange-500 text-white font-bold shadow-lg ring-2 ring-orange-600 hover:scale-110"
                                                                : isEventMiddle
                                                                ? "bg-orange-50 text-orange-800 border-2 border-orange-200 hover:bg-orange-100 hover:scale-105"
                                                                : hasEvents
                                                                ? "bg-orange-100 text-orange-700 font-semibold border-2 border-orange-300 hover:bg-orange-200 hover:scale-105"
                                                                : !hasEvent &&
                                                                  (isHoliday ||
                                                                    isSunday)
                                                                ? "text-red-500 hover:bg-red-50 hover:scale-105 bg-red-100 border-red-200"
                                                                : "hover:bg-gray-100 text-gray-700 hover:scale-105"
                                                            }
                                                        `}
                        >
                          <span className="relative z-10">{day.date}</span>

                          {/* Badge START/END - UX: Clear labeling */}
                          {day.isCurrentMonth && (
                            <>
                              {isEventStart && (
                                <div className="absolute -top-1 -right-1 z-10">
                                  <div className="bg-green-500 text-white px-1.5 py-0.5 rounded-md text-[9px] font-bold shadow-md">
                                    START
                                  </div>
                                </div>
                              )}
                              {isEventEnd && (
                                <div className="absolute -top-1 -right-1 z-10">
                                  <div className="bg-red-500 text-white px-1.5 py-0.5 rounded-md text-[9px] font-bold shadow-md">
                                    END
                                  </div>
                                </div>
                              )}
                            </>
                          )}

                          {/* Event indicator dots */}
                          {isEventStart &&
                            !isTodayDate &&
                            day.isCurrentMonth && (
                              <div className="absolute bottom-1 flex gap-0.5 z-10">
                                {events.slice(0, 3).map((event, i) => (
                                  <div
                                    key={`dot-${day.fullDate}-${i}`}
                                    className="w-1.5 h-1.5 rounded-full bg-white shadow-md"
                                  />
                                ))}
                              </div>
                            )}

                          {/* Tooltip - Enhanced UX */}
                          {hasEvents && day.isCurrentMonth && (
                            <div
                              className={`absolute bottom-full mb-2 hidden group-hover:block z-50 animate-in fade-in slide-in-from-bottom-2 duration-200
                                                                    ${
                                                                      isLeftEdge
                                                                        ? "left-0"
                                                                        : isRightEdge
                                                                        ? "right-0"
                                                                        : "left-1/2 -translate-x-1/2"
                                                                    }
                                                                `}
                            >
                              <div className="bg-gray-900 text-white text-xs rounded-xl p-4 shadow-2xl min-w-[240px] max-w-[300px] border border-gray-700">
                                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-700">
                                  <p className="font-bold text-sm flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-orange-400" />
                                    {events.length} Event
                                    {events.length > 1 ? "s" : ""}
                                  </p>
                                  {isEventStart && (
                                    <span className="px-2 py-1 bg-green-500 text-white text-[10px] font-bold rounded-md shadow-md">
                                      START
                                    </span>
                                  )}
                                  {isEventEnd && (
                                    <span className="px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded-md shadow-md">
                                      END
                                    </span>
                                  )}
                                  {isEventMiddle && (
                                    <span className="px-2 py-1 bg-blue-500 text-white text-[10px] font-bold rounded-md shadow-md">
                                      ONGOING
                                    </span>
                                  )}
                                </div>
                                <div className="space-y-3 max-h-60 overflow-y-auto">
                                  {events.map((event, i) => {
                                    const [startDatePart] =
                                      event.date.split(" ");
                                    const [endDatePart] =
                                      event.end_date.split(" ");

                                    return (
                                      <div
                                        key={`event-${day.fullDate}-${i}`}
                                        className="pb-3 last:pb-0 border-b border-gray-800 last:border-0"
                                      >
                                        <p className="font-semibold text-orange-300 leading-tight mb-2">
                                          {event.title}
                                        </p>
                                        <div className="space-y-1">
                                          <p className="text-gray-400 text-xs flex items-center gap-1.5">
                                            <Building2 className="w-3 h-3 flex-shrink-0" />
                                            <span className="truncate">
                                              {event.company}
                                            </span>
                                          </p>
                                          <div className="flex items-center gap-1.5 text-[10px] text-gray-500 bg-gray-800 rounded px-2 py-1">
                                            <Clock className="w-3 h-3 flex-shrink-0" />
                                            <span className="font-mono">
                                              {startDatePart} → {endDatePart}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                                <div
                                  className={`absolute bottom-0 translate-y-full
                                                                            ${
                                                                              isLeftEdge
                                                                                ? "left-4"
                                                                                : isRightEdge
                                                                                ? "right-4"
                                                                                : "left-1/2 -translate-x-1/2"
                                                                            }
                                                                        `}
                                >
                                  <div className="border-8 border-transparent border-t-gray-900" />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 pt-4  flex items-center justify-center gap-6 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-lg bg-blue-500 shadow-md"></div>
                      <span className="text-gray-600 font-medium">Today</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-lg bg-orange-100 border-2 border-orange-400"></div>
                      <span className="text-gray-600 font-medium">
                        Has Events
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <Card
            id="event-panel"
            className={`
                    p-3 sm:p-4 shadow-md w-full
                    ${isMobile ? "overflow-hidden" : ""}
                `}
          >
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl font-semibold">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500 p-2.5 rounded-xl shadow-lg">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        TRAINING SCHEDULE
                      </h2>
                      <p className="text-xs text-gray-500">
                        Upcoming training sessions
                      </p>
                    </div>
                  </div>
                  {/* {schedules.length > 0 && (
                    <div className="bg-green-100 px-3 py-1.5 rounded-lg">
                      <span className="text-sm font-bold text-green-700">
                        {schedules.length} Active
                      </span>
                    </div>
                  )} */}
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent
              className={isMobile ? "max-h-[30vh] overflow-y-auto" : ""}
            >
              <div className="p-6 min-h-[200px]">
                {loadingSchedules ? (
                  <div className="flex items-center justify-center h-48">
                    <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                  </div>
                ) : schedules.length > 0 ? (
                  <div className="space-y-4">
                    {paginateData(schedules, schedulePage, 2).map(
                      (schedule, index) => {
                        const startDate = new Date(schedule.publish_date);
                        const endDate = new Date(schedule.end_date);
                        const today = new Date();
                        const daysRemaining = Math.ceil(
                          (endDate - today) / (1000 * 60 * 60 * 24)
                        );
                        const isUrgent =
                          daysRemaining > 0 && daysRemaining <= 7;

                        return (
                          <div
                            key={
                              schedule.id ||
                              schedule.course_id ||
                              `schedule-${schedulePage}-${index}`
                            }
                            className="relative bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] overflow-hidden group"
                          >
                            {/* Animated Background Pattern */}
                            <div className="absolute inset-0 opacity-10">
                              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                            </div>

                            {isUrgent && (
                              <div className="absolute top-3 right-3 z-10">
                                <div className="bg-yellow-400 text-yellow-900 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg flex items-center gap-1 animate-pulse">
                                  <Clock className="w-3 h-3" />
                                  {daysRemaining}{" "}
                                  {daysRemaining === 1 ? "day" : "days"} left!
                                </div>
                              </div>
                            )}

                            <div className="relative z-10">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3 flex-1">
                                  <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                                    <Calendar className="w-6 h-6 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold mb-1 line-clamp-2">
                                      {schedule.course_title || schedule.title}
                                    </h3>
                                    {/* ✅ Company di bawah title */}
                                    {(schedule.company_name ||
                                      schedule.company) && (
                                      <p className="text-blue-100 text-xs mb-2 flex items-center gap-1 truncate">
                                        <Building2 className="w-3 h-3 flex-shrink-0" />
                                        {schedule.company_name ||
                                          schedule.company}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="px-2 py-0.5 bg-white/20 rounded text-xs">
                                        {schedule.enroll_type_name}
                                      </span>
                                      <span className="px-2 py-0.5 bg-white/20 rounded text-xs">
                                        {schedule.course_status_name}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <span className="px-3 py-1.5 bg-green-400 text-green-900 rounded-lg font-bold text-xs shadow-lg flex items-center gap-1 flex-shrink-0 ml-2">
                                  <div className="w-2 h-2 bg-green-900 rounded-full animate-pulse" />
                                  Online
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                                <div className="flex items-center gap-2">
                                  <div className="bg-white/20 p-1.5 rounded">
                                    <Clock className="w-3.5 h-3.5" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-blue-100">
                                      Start Date
                                    </p>
                                    <p className="text-sm font-semibold">
                                      {formatScheduleDate(
                                        schedule.publish_date || schedule.date
                                      )}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="bg-white/20 p-1.5 rounded">
                                    <Clock className="w-3.5 h-3.5" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-blue-100">
                                      End Date
                                    </p>
                                    <p className="text-sm font-semibold">
                                      {formatScheduleDate(schedule.end_date)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-400 font-medium">
                      No scheduled training
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      New schedules will appear here
                    </p>
                  </div>
                )}
              </div>

              {schedules.length > 2 && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <button
                    onClick={() =>
                      setSchedulePage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={schedulePage === 1}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <div className="flex gap-2">
                    {Array.from(
                      { length: getTotalPages(schedules, 2) },
                      (_, i) => (
                        <button
                          key={`schedule-page-${i}`}
                          onClick={() => setSchedulePage(i + 1)}
                          className={`w-8 h-2 rounded-full transition-all ${
                            schedulePage === i + 1
                              ? "bg-green-500 w-12"
                              : "bg-gray-300 hover:bg-gray-400"
                          }`}
                        />
                      )
                    )}
                  </div>
                  <button
                    onClick={() =>
                      setSchedulePage((prev) =>
                        Math.min(getTotalPages(schedules, 2), prev + 1)
                      )
                    }
                    disabled={schedulePage === getTotalPages(schedules, 2)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </CourseLayout>
  );
}
