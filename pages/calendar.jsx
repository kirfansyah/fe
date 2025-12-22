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
} from "lucide-react";
import { useCalendar } from "@/hooks/useCalendar";

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
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const [dataCalendar, setDataCalendar] = useState(null);

  const { fetchCalendar, fetchHoliday } = useCalendar();

  // =====================================================
  // FETCH EVENT BY MONTH (🔥 INI YANG BARU)
  // =====================================================
  useEffect(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1; // 1–12

    async function load() {
      try {
        const res = await fetchCalendar(year, month);
        setDataCalendar(res?.data || null);
      } catch (err) {
        console.error("Fetch Calendar error:", err);
      }
    }

    load();
  }, [currentMonth]);

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

    const parsed = dataCalendar.events.map((e) => ({
      ...e,
      dateFormatted: normalizeDate(e.date),
    }));

    setEvents(parsed);
  }, [dataCalendar]);

  useEffect(() => {
    if (selectedDate && window.innerWidth < 1024) {
      document
        .getElementById("event-panel")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedDate]);

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

  const daysArray = [];
  const startOffset = (firstDay + 6) % 7;

  for (let i = 0; i < startOffset; i++) daysArray.push(null);
  for (let d = 1; d <= daysInMonth; d++) daysArray.push(d);

  const monthName = currentMonth.toLocaleString("default", { month: "long" });
  const eventDates = events.map((e) => e.dateFormatted);
  const todayStr = new Date().toISOString().split("T")[0];

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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-500 p-2 rounded-lg">
                    <CalendarIcon className="w-5 h-5 text-white" />
                  </div>
                  {/* <h2 className="text-lg font-bold text-gray-900">
                    {monthName} {year}
                  </h2> */}
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">
                    {monthName} {year}
                  </h2>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={prevMonth}
                    className="p-1 sm:p-2 hover:bg-white rounded-lg"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-2 hover:bg-white rounded-lg"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-6">
              {/* Weekdays */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <div
                    key={d}
                    className="text-center text-xs font-semibold text-gray-600"
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Dates */}
              {/* <div className="grid grid-cols-7 gap-2 text-lg"> */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 text-xs sm:text-sm lg:text-lg">
                {daysArray.map((day, idx) => {
                  const dateStr = day
                    ? `${year}-${String(month + 1).padStart(2, "0")}-${String(
                        day
                      ).padStart(2, "0")}`
                    : null;

                  const isSunday = idx % 7 === 6;
                  const isHoliday = holidays.includes(dateStr);
                  const hasEvent = eventDates.includes(dateStr);
                  const isToday = dateStr === todayStr;

                  return (
                    <div
                      key={idx}
                      onClick={() => day && setSelectedDate(dateStr)}
                      className={`
                        aspect-square flex items-center justify-center text-xs sm:text-sm rounded-md sm:rounded-lg cursor-pointer transition-all
                        ${!day ? "text-gray-300" : ""}
                        ${
                          hasEvent
                            ? "bg-blue-100 text-blue-700 border border-blue-500 font-semibold"
                            : ""
                        }
                        ${
                          !hasEvent && (isHoliday || isSunday)
                            ? "bg-red-100 text-red-600 font-bold"
                            : ""
                        }
                        ${isToday ? "border-2 border-green-500 font-bold" : ""}
                        ${
                          selectedDate === dateStr
                            ? "bg-gray-100 font-bold"
                            : ""
                        }
                      `}
                    >
                      {day || ""}
                    </div>
                  );
                })}
              </div>
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
                Training Scheduled
              </CardTitle>
            </CardHeader>

            <CardContent
              className={isMobile ? "max-h-[30vh] overflow-y-auto" : ""}
            >
              <AnimatePresence mode="wait">
                {eventsForSelected.length === 0 && events.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                    <div className="w-20 h-20 mb-4 opacity-70">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-full h-full"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.75 9.75h4.5m-4.5 3h4.5m-9 5.25h13.5A2.25 2.25 0 0021 15.75V8.25A2.25 2.25 0 0018.75 6H5.25A2.25 2.25 0 003 8.25v7.5A2.25 2.25 0 005.25 18z"
                        />
                      </svg>
                    </div>

                    <p className="text-lg font-semibold">
                      No Scheduled Training
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Belum ada jadwal training untuk bulan ini
                    </p>
                  </div>
                ) : eventsForSelected.length === 0 ? (
                  <motion.ul
                    key="all-events"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    {events.map((e, i) => (
                      <li
                        key={i}
                        className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition"
                      >
                        <p className="font-semibold">
                          {new Date(e.dateFormatted).toDateString()}
                        </p>
                        <p className="mt-1">{e.title}</p>
                        <p className="text-sm text-gray-600">{e.company}</p>
                        <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {e.mode}
                        </span>
                      </li>
                    ))}
                  </motion.ul>
                ) : (
                  <motion.ul
                    key={selectedDate}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    {eventsForSelected.map((e, i) => (
                      <li
                        key={i}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition"
                      >
                        <p className="font-semibold">
                          {new Date(e.dateFormatted).toDateString()}
                        </p>
                        <p className="mt-1">{e.title}</p>
                        <p className="text-sm text-gray-600">{e.company}</p>
                        <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {e.mode}
                        </span>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
    </CourseLayout>
  );
}
