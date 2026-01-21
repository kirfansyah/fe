import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import CourseCardSkeleton from "@/components/Course/CourseCardSkeleton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Search, MoreVertical, LayoutGrid, List, Filter } from "lucide-react";
import Admin from "@/layouts/Admin";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useEmployees } from "@/hooks/useEmployees";
import { BookOpen, Clock, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function CoursePage({ link }) {
  const { fetchEmployees } = useEmployees();
  const [courses, setCourses] = useState([]);
  const [courseData, setCourseData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [viewMode, setViewMode] = useState("tiles");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("");
  const [showSkeleton, setShowSkeleton] = useState(true);

  useEffect(() => {
    // ganti skeleton ke "Data Not Found" setelah 4 detik
    const timer = setTimeout(() => {
      setShowSkeleton(false);
    }, 4000);

    // clear timeout kalau component unmount
    return () => clearTimeout(timer);
  }, []);

  // tampilkan 2 item per halaman di UI
  const itemsPerPage = 8;

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetchEmployees(
          currentPage,
          itemsPerPage,
          searchQuery,
          filterStatus,
          filterCategory
        );
        setCourses(res.data || []);
        setCourseData(res.result || []);
        // console.log("filterStatus:", filterStatus);

        console.log("courses data:", res.data);

        setTotalItems(res.pagination.totalCount || 0);
      } catch (error) {
        console.error("❌ Gagal memuat data:", error);
      }
    };

    loadData();
  }, [
    fetchEmployees,
    currentPage,
    searchQuery,
    itemsPerPage,
    filterStatus,
    filterCategory,
  ]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 639px)");

    const handleChange = (e) => {
      if (e.matches) {
        setViewMode("list");
      } else {
        setViewMode("tiles");
      }
    };

    // cek pertama kali
    if (mediaQuery.matches) {
      setViewMode("list");
    }

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  const filteredCourses = [...courses];

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilter = (cat) => {
    const fixedCategory = cat === "All" ? "" : cat;
    setFilterCategory(cat);
    setCurrentPage(1);
  };

  const handleFilterStatus = (status) => {
    const fixedStatus = status === "All" ? "" : status;
    setFilterStatus(fixedStatus);
    setCurrentPage(1);
  };

  // hitung total halaman dari total data backend
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const goPrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  //   console.log("mode view : ", viewMode);

  return (
    <div className="mt-6 p-2 grid grid-cols-1 gap-6">
      {/* Search + Toolbar */}
      <div className="w-full mt-5">
        <div className="flex flex-row items-center justify-between gap-4 flex-wrap">
          {/* <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"> */}
          {/* <div className="relative flex-shrink-0 w-72"> */}
          <div className="relative w-96 mobile-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10 pr-4 w-full"
            />
          </div>

          {/* <div className="flex items-center gap-3 flex-wrap justify-end"> */}
          <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-3 sm:justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  {filterCategory === "All"
                    ? "Filter Category"
                    : filterCategory}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {[
                  "All",
                  "General",
                  "Mandatory",
                  "All Employee",
                  "Specific",
                ].map((cat) => (
                  <DropdownMenuItem key={cat} onClick={() => handleFilter(cat)}>
                    {cat}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  {filterStatus === "" ? "Filter Status" : filterStatus}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {["All", "Not Started", "In Progress", "Passed", "Failed"].map(
                  (cat) => (
                    <DropdownMenuItem
                      key={cat}
                      onClick={() => handleFilterStatus(cat)}
                    >
                      {cat}
                    </DropdownMenuItem>
                  )
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center border rounded-md overflow-hidden">
              <Button
                variant="ghost"
                size="icon"
                className="px-3"
                onClick={goPrev}
              >
                ‹
              </Button>
              <span className="px-3 text-sm font-medium">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="px-3"
                onClick={goNext}
              >
                ›
              </Button>
            </div>

            <div className="flex border rounded-md overflow-hidden">
              <Button
                variant="ghost"
                size="icon"
                className="px-3"
                onClick={() => setViewMode("tiles")}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="px-3"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {filteredCourses.length > 0 ? (
        <>
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.25 }}
              className={
                // viewMode === "tiles"
                //   ? "flex flex-wrap gap-5 mt-5 justify-start"
                //   : "flex flex-col gap-3 mt-5"
                viewMode === "tiles"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5"
                  : "flex flex-col gap-3 mt-5"
              }
            >
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course.id_course}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.07 }}
                >
                  {/* ================= LIST MODE ================= */}
                  {viewMode === "list" ? (
                    // <Card className="w-full relative hover:shadow-lg transition-all duration-300 border-l-4 border-blue-600">
                    //   <div className="flex items-center gap-4 p-4">
                    //     {/* Thumbnail */}
                    //     <div className="w-32 flex-shrink-0">
                    //       <img
                    //         src={
                    //           course?.thumbnail_url ||
                    //           "/img/course/Course app-bro.png"
                    //         }
                    //         onError={(e) =>
                    //           (e.target.src = "/img/course/Course app-bro.png")
                    //         }
                    //         className="w-32 h-20 object-cover rounded-lg shadow-sm"
                    //       />
                    //     </div>

                    //     {/* Middle Content */}
                    //     <div className="flex flex-col justify-between flex-1">
                    //       <div className="flex flex-col gap-1">
                    //         <Link href={`${link}${course.id_course}`}>
                    //           <span className="text-xl font-semibold text-blue-700 hover:underline cursor-pointer">
                    //             {course.course_title}
                    //           </span>
                    //         </Link>

                    //         {/* Badges */}
                    //         <div className="flex gap-2 mt-1 flex-wrap">
                    //           {course.enrollment_categories?.map((cat, i) => (
                    //             <Badge key={i} variant="secondary">
                    //               {cat}
                    //             </Badge>
                    //           ))}
                    //         </div>
                    //       </div>
                    //       {/* Stats */}
                    //       <div className="flex items-center gap-4 text-sm text-gray-700">
                    //         <span className="flex items-center gap-1">
                    //           <BookOpen size={16} />
                    //           {course.total_lessons} Lessons
                    //         </span>

                    //         <span className="flex items-center gap-1">
                    //           <Clock size={16} />
                    //           {course.total_duration}
                    //         </span>

                    //         <span className="flex items-center gap-1">
                    //           <Star
                    //             size={16}
                    //             className="text-yellow-500 fill-yellow-500"
                    //           />
                    //           {course.average_rating || "No review"}
                    //         </span>
                    //       </div>
                    //       {/* Status or Progress */}
                    //       <Badge
                    //         className={`mt-2 px-3 py-1 w-24 text-center justify-center ${
                    //           course.status === "Passed"
                    //             ? "bg-green-600"
                    //             : course.status === "Failed"
                    //             ? "bg-red-600"
                    //             : course.status === "Not Started"
                    //             ? "bg-blue-500 text-white"
                    //             : course.status === "In Progress"
                    //             ? "bg-gray-500"
                    //             : ""
                    //         }`}
                    //       >
                    //         {course.status}
                    //       </Badge>
                    //     </div>

                    //     {/* Right Actions */}
                    //     <div className="flex flex-col justify-center items-end gap-2">
                    //       {/* <DropdownMenu>
                    //       <DropdownMenuTrigger asChild>
                    //         <Button variant="ghost" size="icon">
                    //           <MoreVertical className="h-5 w-5" />
                    //         </Button>
                    //       </DropdownMenuTrigger>
                    //       <DropdownMenuContent align="end"> */}
                    //       {/* <DropdownMenuItem>Edit</DropdownMenuItem>
                    //         <DropdownMenuItem>Delete</DropdownMenuItem> */}
                    //       {/* </DropdownMenuContent>
                    //     </DropdownMenu> */}
                    //       <Link href={`${link}${course.id_course}`}>
                    //         <Button className="bg-blue-900 hover:bg-blue-700">
                    //           View
                    //         </Button>
                    //       </Link>
                    //     </div>
                    //   </div>
                    // </Card>
                    <>
                      {/* ================= DESKTOP CARD ================= */}
                      <div className="hidden md:block">
                        <Card className="w-full relative hover:shadow-lg transition-all duration-300 border-l-4 border-blue-600">
                          <div className="flex items-center gap-4 p-4">
                            {/* Thumbnail */}
                            <div className="w-32 flex-shrink-0">
                              <img
                                src={
                                  course?.thumbnail_url ||
                                  "/img/course/Course app-bro.png"
                                }
                                onError={(e) =>
                                  (e.target.src =
                                    "/img/course/Course app-bro.png")
                                }
                                className="w-32 h-20 object-cover rounded-lg shadow-sm"
                              />
                            </div>

                            {/* Middle */}
                            <div className="flex flex-col justify-between flex-1">
                              <div className="flex flex-col gap-1">
                                <Link href={`${link}${course.id_course}`}>
                                  <span className="text-xl font-semibold text-blue-700 hover:underline">
                                    {course.course_title}
                                  </span>
                                </Link>

                                <div className="flex gap-2 mt-1 flex-wrap">
                                  {course.enrollment_categories?.map(
                                    (cat, i) => (
                                      <Badge key={i} variant="secondary">
                                        {cat}
                                      </Badge>
                                    )
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-4 text-sm text-gray-700">
                                <span className="flex items-center gap-1">
                                  <BookOpen size={16} /> {course.total_lessons}{" "}
                                  Lessons
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock size={16} /> {course.total_duration}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Star
                                    size={16}
                                    className="text-yellow-500 fill-yellow-500"
                                  />
                                  {course.average_rating || "No review"}
                                </span>
                              </div>

                              <Badge className="mt-2 w-24 justify-center">
                                {course.status}
                              </Badge>
                            </div>

                            {/* Action */}
                            <div className="flex items-end">
                              <Link href={`${link}${course.id_course}`}>
                                <Button className="bg-blue-900 hover:bg-blue-700">
                                  View
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </Card>
                      </div>

                      {/* ================= MOBILE CARD ================= */}
                      <div className="md:hidden">
                        <Card className="w-full relative hover:shadow-lg transition-all duration-300 border-l-4 border-blue-600">
                          <div className="flex flex-col gap-4 p-4">
                            {/* Thumbnail */}
                            <img
                              src={
                                course?.thumbnail_url ||
                                "/img/course/Course app-bro.png"
                              }
                              onError={(e) =>
                                (e.target.src =
                                  "/img/course/Course app-bro.png")
                              }
                              className="w-full h-40 object-cover rounded-lg"
                            />

                            <Link href={`${link}${course.id_course}`}>
                              <span className="text-base font-semibold text-blue-700">
                                {course.course_title}
                              </span>
                            </Link>

                            <div className="flex gap-2 flex-wrap">
                              {course.enrollment_categories?.map((cat, i) => (
                                <Badge key={i} variant="secondary">
                                  {cat}
                                </Badge>
                              ))}
                            </div>

                            <div className="flex flex-wrap gap-3 text-xs text-gray-700">
                              <span className="flex items-center gap-1">
                                <BookOpen size={14} /> {course.total_lessons}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={14} /> {course.total_duration}
                              </span>
                              <span className="flex items-center gap-1">
                                <Star
                                  size={14}
                                  className="text-yellow-500 fill-yellow-500"
                                />
                                {course.average_rating || "No review"}
                              </span>
                            </div>

                            <div className="flex justify-between items-center">
                              <Badge>{course.status}</Badge>
                              <Link href={`${link}${course.id_course}`}>
                                <Button className="bg-blue-900 w-full">
                                  View
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </Card>
                      </div>
                    </>
                  ) : (
                    /* ================= TILES MODE (ORIGINAL CARD) ================= */
                    // <Card className="w-96 relative">
                    <Card className="md:w-96 sm:w-full xs:w-full relative">
                      {/* <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 p-0"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end"> */}
                      {/* <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Delete</DropdownMenuItem> */}
                      {/* </DropdownMenuContent>
                    </DropdownMenu> */}

                      <CardHeader className="mt-1">
                        <CardTitle className="text-2xl text-blue-600">
                          {(() => {
                            const words =
                              course.course_title?.trim().split(/\s+/) || [];

                            if (words.length === 3) {
                              return (
                                <>
                                  {words[0]} {words[1]} <br /> {words[2]}
                                </>
                              );
                            }

                            return course.course_title;
                          })()}
                        </CardTitle>
                        <CardDescription className="flex gap-2">
                          {course.enrollment_categories?.map((cat, idx) => (
                            <Badge key={idx} variant="secondary">
                              {cat}
                            </Badge>
                          ))}
                        </CardDescription>
                      </CardHeader>

                      <CardContent>
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="md:w-1/2 flex flex-col items-center">
                            <img
                              src={
                                course?.thumbnail_url ||
                                "/img/course/Course app-bro.png"
                              }
                              onError={(e) =>
                                (e.target.src =
                                  "/img/course/Course app-bro.png")
                              }
                              className="w-full h-40 object-cover rounded-md"
                            />
                            <Link href={`${link}${course.id_course}`} passHref>
                              <Button className="mt-3 w-full bg-blue-900 hover:bg-blue-700 text-white">
                                View Course
                              </Button>
                            </Link>
                          </div>

                          <div className="md:w-1/2 flex flex-col justify-start space-y-2 text-gray-700">
                            <div className="flex justify-between">
                              <span className="font-semibold">Release</span>{" "}
                              {course.release}
                            </div>
                            <div className="flex justify-between">
                              <span className="font-semibold">Lesson</span>{" "}
                              {course.total_lessons}
                            </div>
                            <div className="flex justify-between">
                              <span className="font-semibold">Duration</span>{" "}
                              {course.total_duration}
                            </div>
                            <div className="flex justify-between">
                              <span className="font-semibold">Reviews</span>{" "}
                              {course.review ? course.review + "/5" : ""}
                            </div>
                            <div className="flex justify-between">
                              <span className="font-semibold">Status</span>
                              <Badge
                                className={`text-white 
                          ${
                            course.status === "Passed"
                              ? "bg-green-500 hover:bg-green-600"
                              : ""
                          }
                          ${
                            course.status === "Failed"
                              ? "bg-red-500 hover:bg-red-600"
                              : ""
                          }
                          ${
                            course.status === "In Progress"
                              ? "bg-gray-500 hover:bg-gray-600 text-white"
                              : ""
                          }
                          ${
                            course.status === "Not Started"
                              ? "bg-blue-500 hover:bg-black-600 text-white"
                              : ""
                          }
                        `}
                              >
                                {course.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>

                      {/* <CardFooter className="border-t pt-4">
                        <div className="w-full grid grid-cols-4 divide-x divide-gray-300 text-center">
                          <div className="px-4">
                            <div className="text-lg font-bold text-gray-800">
                              {course.total_invited}
                            </div>
                            <div className="text-sm text-gray-500">Invited</div>
                          </div>
                          <div className="px-4">
                            <div className="text-lg font-bold text-gray-800">
                              {course.total_ongoing}
                            </div>
                            <div className="text-sm text-gray-500">
                              On Going
                            </div>
                          </div>
                          <div className="px-4">
                            <div className="text-lg font-bold text-gray-800">
                              {course.total_finished}
                            </div>
                            <div className="text-sm text-gray-500">
                              Finished
                            </div>
                          </div>
                          <div className="px-4">
                            <div className="text-lg font-bold text-gray-800">
                              {course.total_invited +
                                course.total_ongoing +
                                course.total_finished}
                            </div>
                            <div className="text-sm text-gray-500">Total</div>
                          </div>
                        </div>
                      </CardFooter> */}
                      <CardFooter className="border-t pt-4">
                        <div className="w-full grid grid-cols-4 divide-x divide-gray-300 text-center">
                          <div className="px-1 sm:px-4">
                            <div className="text-sm sm:text-lg font-bold text-gray-800">
                              {course.total_invited}
                            </div>
                            <div className="text-[10px] sm:text-sm text-gray-500 whitespace-nowrap">
                              Invited
                            </div>
                          </div>

                          <div className="px-1 sm:px-4">
                            <div className="text-sm sm:text-lg font-bold text-gray-800">
                              {course.total_ongoing}
                            </div>
                            <div className="text-[10px] sm:text-sm text-gray-500 whitespace-nowrap">
                              On&nbsp;Going
                            </div>
                          </div>

                          <div className="px-1 sm:px-4">
                            <div className="text-sm sm:text-lg font-bold text-gray-800">
                              {course.total_finished}
                            </div>
                            <div className="text-[10px] sm:text-sm text-gray-500 whitespace-nowrap">
                              Finished
                            </div>
                          </div>

                          <div className="px-1 sm:px-4">
                            <div className="text-sm sm:text-lg font-bold text-gray-800">
                              {course.total_invited +
                                course.total_ongoing +
                                course.total_finished}
                            </div>
                            <div className="text-[10px] sm:text-sm text-gray-500 whitespace-nowrap">
                              Total
                            </div>
                          </div>
                        </div>
                      </CardFooter>
                    </Card>
                  )}
                </motion.div>
              ))}
              {/* </div> ini */}
            </motion.div>
          </AnimatePresence>
        </>
      ) : showSkeleton ? (
        // skeleton muncul setelah 4 detik
        <div
          className={
            viewMode === "tiles"
              ? "flex flex-wrap gap-5 mt-5 justify-start"
              : "flex flex-col gap-3 mt-5"
          }
        >
          {[...Array(10)].map((_, idx) => (
            <CourseCardSkeleton key={idx} viewMode={viewMode} />
          ))}
        </div>
      ) : (
        // tampil "Data Not Found" dulu
        <div className="flex flex-col items-center justify-center py-14">
          <img
            src="https://cdn-icons-png.flaticon.com/512/4076/4076508.png"
            alt="No Data"
            className="w-32 h-32 opacity-70 mb-4"
          />
          <p className="text-xl font-semibold text-gray-700">No Data Found</p>
          <p className="text-sm text-gray-500 mt-1">
            Try changing search keywords or filters.
          </p>
        </div>
      )}
    </div>
  );
}
