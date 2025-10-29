import React, { useState, useEffect, useContext } from "react";
import CourseLayout from "@/layouts/CourseLayout";
import { useRouter } from "next/router";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronRight, Star, FileText, Video } from "lucide-react";
import Link from "next/link";
import { generateCourses } from "@/dummy-data/courses"; // pastikan ini array
import { useEmployees } from "@/hooks/useEmployees";
import { CourseContext } from "@/contexts/CourseContext";

export default function CourseDetail() {
  const { setCourseId } = useContext(CourseContext);
  const { getCourseById, getCourseDetailById } = useEmployees();
  const router = useRouter();
  const { id } = router.query;

  const courses = generateCourses;
  const [reviewText, setReviewText] = useState("");
  const [courseData, setCourses] = useState([]);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await getCourseById(id);
        // console.log("res data course id :", res);

        setCourses(res.data.data || []);
      } catch (error) {
        console.error("❌ Gagal memuat data:", error);
      }
    };

    loadData();
  }, [getCourseById, id]);

  useEffect(() => {
    const test = async () => {
      try {
        const res = await getCourseDetailById(id);
        // console.log("res data course id :", res);

        setCourses(res.data.data || []);
        // console.log("ini data loh :", res.data.data);
      } catch (error) {
        console.error("❌ Gagal memuat data:", error);
      }
    };

    test();
  }, [getCourseDetailById, id]);

  if (!id) return <div className="p-6">Loading...</div>; // tunggu id

  //   const course = courses.find((c) => c.id === Number(id));
  const course = courses.find((c) => c.id === Number(1));

  if (!course) return <div className="p-6">Course not found</div>;
  const lessons = [
    { title: "Course Guide", type: "pdf" },
    { title: "Course Outline", type: "pdf" },
    { title: "Pre Test", type: "pdf" },
    { title: "Course Content", type: "video" },
    { title: "Post Test", type: "ppt" },
  ];
  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <Card className="mb-6 bg-gray-50 rounded-lg shadow-md">
        <CardContent className="flex items-center text-base font-semibold text-gray-700 space-x-3 p-6">
          <Link href="/" className="">
            Home
          </Link>
          <ChevronRight className="w-5 h-5 text-gray-500" />
          <Link href="/course/employee/course" className="">
            Courses
          </Link>
          <ChevronRight className="w-5 h-5 text-gray-500" />
          <span className="text-gray-600 font-bold">
            {courseData.course_title}
          </span>
        </CardContent>
      </Card>

      {/* Main Layout */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column */}
        <div className="md:w-1/4 space-y-4">
          <Card>
            <CardContent className="flex flex-col items-center space-y-4 p-3">
              <img
                src={`${courseData.thumbnail || "/img/course/k3.jpg"}`}
                alt="Course"
                className="w-full h-48 object-cover rounded-md"
              />

              {/* Avatar + You're Enrolled */}
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src="/img/avatar.jpg" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <span className="font-medium">You're Enrolled</span>
                <Badge variant="success">✓</Badge>
              </div>

              {/* Progress Bar */}
              <div className="w-full">
                <Progress
                  value={courseData.progress_percentage}
                  className="h-3 rounded-full"
                />
                <span className="text-sm text-gray-500 mt-1">
                  {courseData.progress_percentage}% Completed
                </span>
              </div>

              {/* Start Course Button */}
              <Button
                className="w-full bg-blue-900 hover:bg-blue-700 text-white"
                onClick={() => {
                  setCourseId(courseData.id_course); // ✅ kirim ID ke context
                  router.push(`/course/employee/start/${courseData.id_course}`);
                }}
              >
                Start Course
              </Button>

              {/* Course Info */}
              <div className="w-full space-y-1 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>Instructor</span> <span>{courseData.instructor}</span>
                </div>
                <div className="flex justify-between">
                  <span>Attempt Date</span>{" "}
                  <span>{courseData.attempt_date}</span>
                </div>
                <div className="flex justify-between">
                  <span>Completion Date</span>{" "}
                  <span>{courseData.completed_at}</span>
                </div>
                <div className="flex justify-between">
                  <span>Completion Time</span>{" "}
                  <span>{courseData.completion_time}</span>
                </div>
                <div className="flex justify-between">
                  <span>Reviews</span> <span>{courseData.rating}/5</span>
                </div>
                {/* <div className="flex justify-between">
                  <span>Result</span> <span>{course.result}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status</span> <span>{course.status}</span>
                </div> */}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="md:w-3/4 space-y-4">
          {/* Course Title */}
          <h1 className="text-3xl font-bold">{courseData.course_title}</h1>

          {/* Tabs */}
          <Tabs defaultValue="course" className="space-y-4">
            <TabsList>
              <TabsTrigger value="course">Course</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            {/* Tab Course */}

            <TabsContent value="course" className="space-y-4">
              {/* About Course */}
              <div className="space-y-4">
                {courseData.sections?.courseGuide?.length > 0 ? (
                  courseData.sections.courseGuide.map((v, index) => (
                    <div key={index} className="space-y-2">
                      {/* Judul Section */}
                      <h2 className="text-lg font-semibold">
                        {v.content_title}
                      </h2>

                      {/* Isi Content Body */}
                      {v.content_body ? (
                        v.content_body
                          .replace(/\n+/g, "\n")
                          .split("\n")
                          .map((content, i) => (
                            <Card
                              key={i}
                              className="flex items-center justify-between p-4"
                            >
                              <FileText className="w-5 h-5 text-gray-400 mr-4" />
                              <span className="flex-1 text-gray-700">
                                {content}
                              </span>
                              <Checkbox
                                checked={v.is_completed}
                                className="w-5 h-5 border-gray-300 rounded bg-white 
                      data-[state=checked]:bg-blue-600 
                      data-[state=checked]:border-blue-600 focus:ring-0"
                              />
                            </Card>
                          ))
                      ) : (
                        <Card className="flex items-center justify-between p-4">
                          <FileText className="w-5 h-5 text-gray-400 mr-4" />
                          <span className="flex-1 text-gray-500 italic">
                            No content available.
                          </span>
                          <Checkbox
                            checked={v.is_completed}
                            className="w-5 h-5 border-gray-300 rounded bg-white 
                  data-[state=checked]:bg-blue-600 
                  data-[state=checked]:border-blue-600 focus:ring-0"
                          />
                        </Card>
                      )}
                    </div>
                  ))
                ) : (
                  <Card className="flex items-center justify-between p-4">
                    <FileText className="w-5 h-5 text-gray-400 mr-4" />
                    <span className="flex-1 text-gray-500 italic">
                      No content available.
                    </span>
                    <Checkbox
                      //   checked={v.is_completed}
                      className="w-5 h-5 border-gray-300 rounded bg-white 
                  data-[state=checked]:bg-blue-600 
                  data-[state=checked]:border-blue-600 focus:ring-0"
                    />
                  </Card>
                )}
              </div>

              {/* Course Outline */}
              <div className="space-y-4">
                {courseData.sections?.courseOutline?.length > 0 ? (
                  courseData.sections.courseOutline.map((v, index) => (
                    <div key={index} className="space-y-2">
                      {/* Judul Section */}
                      <h2 className="text-lg font-semibold">
                        {v.content_title}
                      </h2>

                      {/* Isi Content Body */}
                      {v.content_body ? (
                        v.content_body
                          .replace(/\n+/g, "\n")
                          .split("\n")
                          .map((content, i) => (
                            <Card
                              key={i}
                              className="flex items-center justify-between p-4"
                            >
                              <FileText className="w-5 h-5 text-gray-400 mr-4" />
                              <span className="flex-1 text-gray-700">
                                {content}
                              </span>
                              <Checkbox
                                checked={v.is_completed}
                                className="w-5 h-5 border-gray-300 rounded bg-white 
                      data-[state=checked]:bg-blue-600 
                      data-[state=checked]:border-blue-600 focus:ring-0"
                              />
                            </Card>
                          ))
                      ) : (
                        <Card className="flex items-center justify-between p-4">
                          <FileText className="w-5 h-5 text-gray-400 mr-4" />
                          <span className="flex-1 text-gray-500 italic">
                            No content available.
                          </span>
                          <Checkbox
                            checked={v.is_completed}
                            className="w-5 h-5 border-gray-300 rounded bg-white 
                  data-[state=checked]:bg-blue-600 
                  data-[state=checked]:border-blue-600 focus:ring-0"
                          />
                        </Card>
                      )}
                    </div>
                  ))
                ) : (
                  <Card className="flex items-center justify-between p-4">
                    <FileText className="w-5 h-5 text-gray-400 mr-4" />
                    <span className="flex-1 text-gray-500 italic">
                      No content available.
                    </span>
                    <Checkbox
                      //   checked={v.is_completed}
                      className="w-5 h-5 border-gray-300 rounded bg-white 
                  data-[state=checked]:bg-blue-600 
                  data-[state=checked]:border-blue-600 focus:ring-0"
                    />
                  </Card>
                )}
              </div>

              {/* Pre Test */}
              <div className="space-y-4">
                {courseData.sections?.preTest?.length > 0 ? (
                  courseData.sections.preTest.map((v, index) => (
                    <div key={index} className="space-y-2">
                      {/* Judul Section */}
                      <h2 className="text-lg font-semibold">
                        {v.content_title}
                      </h2>

                      {/* Isi Content Body */}
                      {v.content_body ? (
                        v.content_body
                          .replace(/\n+/g, "\n")
                          .split("\n")
                          .map((content, i) => (
                            <Card
                              key={i}
                              className="flex items-center justify-between p-4"
                            >
                              <FileText className="w-5 h-5 text-gray-400 mr-4" />
                              <span className="flex-1 text-gray-700">
                                {content}
                              </span>
                              <Checkbox
                                checked={v.is_completed}
                                className="w-5 h-5 border-gray-300 rounded bg-white 
                      data-[state=checked]:bg-blue-600 
                      data-[state=checked]:border-blue-600 focus:ring-0"
                              />
                            </Card>
                          ))
                      ) : (
                        <Card className="flex items-center justify-between p-4">
                          <FileText className="w-5 h-5 text-gray-400 mr-4" />
                          <span className="flex-1 text-gray-500 italic">
                            No content available.
                          </span>
                          <Checkbox
                            checked={v.is_completed}
                            className="w-5 h-5 border-gray-300 rounded bg-white 
                  data-[state=checked]:bg-blue-600 
                  data-[state=checked]:border-blue-600 focus:ring-0"
                          />
                        </Card>
                      )}
                    </div>
                  ))
                ) : (
                  <Card className="flex items-center justify-between p-4">
                    <FileText className="w-5 h-5 text-gray-400 mr-4" />
                    <span className="flex-1 text-gray-500 italic">
                      No content available.
                    </span>
                    <Checkbox
                      //   checked={v.is_completed}
                      className="w-5 h-5 border-gray-300 rounded bg-white 
                  data-[state=checked]:bg-blue-600 
                  data-[state=checked]:border-blue-600 focus:ring-0"
                    />
                  </Card>
                )}
              </div>

              {/* Course Content */}
              <div className="space-y-4">
                {courseData.sections?.courseContent?.length > 0 ? (
                  courseData.sections.courseContent.map((v, index) => (
                    <div key={index} className="space-y-2">
                      {/* Judul Section */}
                      <h2 className="text-lg font-semibold">
                        {v.content_title}
                      </h2>

                      {/* Isi Content Body */}
                      {v.content_body ? (
                        v.content_body
                          .replace(/\n+/g, "\n")
                          .split("\n")
                          .map((content, i) => (
                            <Card
                              key={i}
                              className="flex items-center justify-between p-4"
                            >
                              <FileText className="w-5 h-5 text-gray-400 mr-4" />
                              <span className="flex-1 text-gray-700">
                                {content}
                              </span>
                              <Checkbox
                                checked={v.is_completed}
                                className="w-5 h-5 border-gray-300 rounded bg-white 
                      data-[state=checked]:bg-blue-600 
                      data-[state=checked]:border-blue-600 focus:ring-0"
                              />
                            </Card>
                          ))
                      ) : (
                        <Card className="flex items-center justify-between p-4">
                          <FileText className="w-5 h-5 text-gray-400 mr-4" />
                          <span className="flex-1 text-gray-500 italic">
                            No content available.
                          </span>
                          <Checkbox
                            checked={v.is_completed}
                            className="w-5 h-5 border-gray-300 rounded bg-white 
                  data-[state=checked]:bg-blue-600 
                  data-[state=checked]:border-blue-600 focus:ring-0"
                          />
                        </Card>
                      )}
                    </div>
                  ))
                ) : (
                  <Card className="flex items-center justify-between p-4">
                    <FileText className="w-5 h-5 text-gray-400 mr-4" />
                    <span className="flex-1 text-gray-500 italic">
                      No content available.
                    </span>
                    <Checkbox
                      //   checked={v.is_completed}
                      className="w-5 h-5 border-gray-300 rounded bg-white 
                  data-[state=checked]:bg-blue-600 
                  data-[state=checked]:border-blue-600 focus:ring-0"
                    />
                  </Card>
                )}
              </div>

              {/* Post Test */}
              <div className="space-y-4">
                {courseData.sections?.postTest?.length > 0 ? (
                  courseData.sections.postTest.map((v, index) => (
                    <div key={index} className="space-y-2">
                      {/* Judul Section */}
                      <h2 className="text-lg font-semibold">
                        {v.content_title}
                      </h2>

                      {/* Isi Content Body */}
                      {v.content_body ? (
                        v.content_body
                          .replace(/\n+/g, "\n")
                          .split("\n")
                          .map((content, i) => (
                            <Card
                              key={i}
                              className="flex items-center justify-between p-4"
                            >
                              <FileText className="w-5 h-5 text-gray-400 mr-4" />
                              <span className="flex-1 text-gray-700">
                                {content}
                              </span>
                              <Checkbox
                                checked={v.is_completed}
                                className="w-5 h-5 border-gray-300 rounded bg-white 
                      data-[state=checked]:bg-blue-600 
                      data-[state=checked]:border-blue-600 focus:ring-0"
                              />
                            </Card>
                          ))
                      ) : (
                        <Card className="flex items-center justify-between p-4">
                          <FileText className="w-5 h-5 text-gray-400 mr-4" />
                          <span className="flex-1 text-gray-500 italic">
                            No content available.
                          </span>
                          <Checkbox
                            checked={v.is_completed}
                            className="w-5 h-5 border-gray-300 rounded bg-white 
                  data-[state=checked]:bg-blue-600 
                  data-[state=checked]:border-blue-600 focus:ring-0"
                          />
                        </Card>
                      )}
                    </div>
                  ))
                ) : (
                  <Card className="flex items-center justify-between p-4">
                    <FileText className="w-5 h-5 text-gray-400 mr-4" />
                    <span className="flex-1 text-gray-500 italic">
                      No content available.
                    </span>
                    <Checkbox
                      //   checked={v.is_completed}
                      className="w-5 h-5 border-gray-300 rounded bg-white 
                  data-[state=checked]:bg-blue-600 
                  data-[state=checked]:border-blue-600 focus:ring-0"
                    />
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Tab Reviews */}
            <TabsContent value="reviews">
              <div className="space-y-4">
                {/* Add Review */}
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`w-6 h-6 cursor-pointer ${
                        i <= rating ? "text-yellow-400" : "text-gray-300"
                      }`}
                      onClick={() => setRating(i)}
                    />
                  ))}
                  <span className="text-sm text-gray-500">{rating} Stars</span>
                </div>

                {/* Add Comment */}
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full p-2 border rounded-md"
                />

                <Button className="bg-blue-900 hover:bg-blue-700 text-white">
                  Submit Review
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
CourseDetail.layout = CourseLayout;
