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
// dummy data
import { generateCourses } from "@/dummy-data/courses";

export default function CoursePage() {
  const [courses, setCourses] = useState([]);
  const [viewMode, setViewMode] = useState("tiles");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const itemsPerPage = 8;

  // Dummy data
  //   const courses = Array.from({ length: 100 }, (_, i) => ({
  //     title: `Keselamatan Kerja Tingat Dasar ${i + 1}`,
  //     release: "22-09-2025",
  //     lesson: 2,
  //     duration: "01hr 30min",
  //     review: 4.5,
  //     status: "Passed",
  //     category:
  //       i % 3 === 0 ? "General" : i % 3 === 1 ? "Mandatory" : "All Employee",
  //   }));

  //   const filteredCourses = courses.filter((course) =>
  //     course.title.toLowerCase().includes(searchQuery.toLowerCase())
  //   );

  useEffect(() => {
    setCourses(generateCourses);
  }, []);

  if (courses.length === 0) {
    return <div className="p-6 text-gray-500">Loading courses...</div>;
  }

  const filteredCourses = courses.filter((course) => {
    const matchSearch = course.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchFilter =
      filterCategory === "All" ||
      course.categories.some(
        (cat) => cat.toLowerCase() === filterCategory.toLowerCase()
      );
    return matchSearch && matchFilter;
  });

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilter = (cat) => {
    setFilterCategory(cat);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const displayedCourses = filteredCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goPrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return ( 
    <div className="mt-6 p-2 grid grid-cols-1 gap-6"> 
      {/* Search + Toolbar */}
      <div className="w-full mt-5">
        <div className="flex flex-row items-center justify-between gap-4 flex-wrap">
          <div className="relative flex-shrink-0 w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10 pr-4 w-full"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  {filterCategory === "All" ? "Filter" : filterCategory}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {["All", "General", "Mandatory", "All Employee"].map((cat) => (
                  <DropdownMenuItem key={cat} onClick={() => handleFilter(cat)}>
                    {cat}
                  </DropdownMenuItem>
                ))}
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
              <span className="px-4 text-sm font-medium">
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

      {/* Cards */}
      <div
        className={
          viewMode === "tiles"
            ? "flex flex-wrap gap-5 mt-5 justify-start"
            : "flex flex-col gap-3 mt-5"
        }
      >
        {displayedCourses.map((course, idx) => (
          <Card
            key={idx}
            className={
              viewMode === "tiles" ? "w-96 relative" : "w-full relative"
            }
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 p-0"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <CardHeader className="mt-1">
              <CardTitle className="text-2xl text-blue-600">
                {course.title}
              </CardTitle>
              <CardDescription className="flex gap-2">
                {course.categories.map((cat, idx) => (
                  <Badge key={idx} variant="secondary">
                    {cat}
                  </Badge>
                ))}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div
                className={
                  viewMode === "tiles"
                    ? "flex flex-col md:flex-row gap-4"
                    : "flex flex-row gap-3"
                }
              >
                <div
                  className={
                    viewMode === "tiles"
                      ? "md:w-1/2 flex flex-col items-center"
                      : "w-32 flex-shrink-0"
                  }
                >
                  <img
                    src="/img/course/k3.jpg"
                    alt="Course"
                    className={
                      viewMode === "tiles"
                        ? "w-full h-40 object-cover rounded-md"
                        : "w-32 h-20 object-cover rounded-md"
                    }
                  />
                  <Link href={`/course/employee/detail/${course.id}`} passHref>
                    <Button className="mt-3 w-full bg-blue-900 hover:bg-blue-700 text-white">
                      View Course
                    </Button>
                  </Link>
                </div>

                <div
                  className={
                    viewMode === "tiles"
                      ? "md:w-1/2 flex flex-col justify-start space-y-2 text-gray-700"
                      : "flex flex-col justify-start text-gray-700 text-sm"
                  }
                >
                  <div className="flex justify-between">
                    <span className="font-semibold">Release</span>{" "}
                    {course.release}
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Lesson</span>{" "}
                    {course.lesson}
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Duration</span>{" "}
                    {course.duration}
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Revies</span>{" "}
                    {course.review}/5
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
                              course.status === "On Going"
                                ? "bg-yellow-500 hover:bg-yellow-600 text-black"
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

            {viewMode === "tiles" && (
              <CardFooter className="border-t pt-4">
                <div className="w-full grid grid-cols-4 divide-x divide-gray-300 text-center">
                  <div className="px-4">
                    <div className="text-lg font-bold text-gray-800">0</div>
                    <div className="text-sm text-gray-500">Invited</div>
                  </div>
                  <div className="px-4">
                    <div className="text-lg font-bold text-gray-800">203</div>
                    <div className="text-sm text-gray-500">On Going</div>
                  </div>
                  <div className="px-4">
                    <div className="text-lg font-bold text-gray-800">240</div>
                    <div className="text-sm text-gray-500">Finished</div>
                  </div>
                  <div className="px-4">
                    <div className="text-lg font-bold text-gray-800">443</div>
                    <div className="text-sm text-gray-500">Total</div>
                  </div>
                </div>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

CoursePage.layout = Admin;
