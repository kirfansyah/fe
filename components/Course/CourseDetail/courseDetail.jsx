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
import {
  ChevronRight,
  Star,
  FileText,
  Video,
  FileSpreadsheet,
  Clipboard,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { generateCourses } from "@/dummy-data/courses"; // pastikan ini array
import { useEmployees } from "@/hooks/useEmployees";
import { CourseContext } from "@/contexts/CourseContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function CourseDetail({ ...props }) {
  const { id, breadCrumb, startCourse } = props;
  const { setCourseId } = useContext(CourseContext);
  const { getCourseById, getCourseDetailById, sendEnrollment, sendFeedback } =
    useEmployees();
  const router = useRouter();
  //   const { id } = router.query;

  const courses = generateCourses;
  const [reviewText, setReviewText] = useState("");
  const [courseData, setCourses] = useState([]);
  const [rating, setRating] = useState(0);
  const [hasFeedback, setHasFeedback] = useState(false);
  const [userFeedback, setUserFeedback] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [name, setName] = useState("U");

  const [openConfirm, setOpenConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const orderedKeys = [
    "courseGuide",
    "courseOutline",
    "preTest",
    "courseContent",
    "postTest",
  ];

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";

    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    if (typeof document !== "undefined") {
      const match = document.cookie.match(new RegExp("(^| )nama=([^;]+)"));
      const nama = match ? match[2] : null;

      if (nama) {
        setName(nama.charAt(0).toUpperCase());
      }
    }
  }, []);
  //   console.log("startCourse : ", startCourse);
  //   toast.success("Terima kasih atas feedback Anda! 🎉");

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await getCourseById(id);
        // console.log("res : ", res.data.data);

        setCourses(res.data.data || []);
        if (res.data.data?.feedback) {
          setHasFeedback(true);
          setUserFeedback(res.data.data.feedback || "");
          setUserRating(res.data.data.rating || 0);
        }
      } catch (error) {
        console.error("❌ Gagal memuat data:", error);
      }
    };

    loadData();
  }, [getCourseById, id, hasFeedback, userFeedback]);

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await getCourseDetailById(id);
        // console.log("res : ", res);

        setCourses(res.data.data || []);
      } catch (error) {
        console.error("❌ Gagal memuat data:", error);
      }
    };

    getData();
  }, [getCourseDetailById, id]);
  const sections = courseData?.sections || {};

  //   console.log("courseData : ", courseData);

  const handleStartCourse = async () => {
    try {
      const payload = {
        id_course_enrollment: courseData.id_course_enrollment,
        id_course: courseData.id_course,
        progress_percentage: 0,
        created_by: "system",
        created_device: "web",
      };
      //   console.log("courses : ", courseData);

      if (!courseData?.id_user_enrollment) {
        // console.log("📦 Sending enrollment payload:", payload);
        const result = await sendEnrollment(payload);
        // console.log("✅ Enrollment berhasil:", result);
      }
      setCourseId(courseData.id_course);
      router.push(`${startCourse}${courseData.id_course}`);
    } catch (error) {
      console.error("❌ Gagal melakukan enrollment:", error);
    }
  };

  const handleSendFeedback = async () => {
    if (!rating) {
      alert("Silakan beri rating terlebih dahulu.");
      return;
    }

    if (!reviewText.trim()) {
      alert("Silakan isi komentar atau masukan Anda.");
      return;
    }
    setIsSubmitting(true);

    try {
      const payload = {
        id_course: courseData.id_course,
        rating: rating,
        feedback: reviewText,
        created_by: "system", // nanti bisa diganti user login
        created_device: "web",
      };

      //   console.log("📦 Sending feedback payload:", payload);

      const result = await sendFeedback(payload);
      //   console.log("✅ Feedback terkirim:", result);

      if (result?.success) {
        toast.success("Terima kasih atas feedback Anda! 🎉");
        setHasFeedback(true);
        setUserFeedback(reviewText);
        setUserRating(rating);
        setRating(0);
        setReviewText("");
      } else {
        toast.warning(result?.message || "Gagal mengirim feedback.");
      }
    } catch (error) {
      console.error("❌ Gagal mengirim feedback:", error);
      //   alert("Terjadi kesalahan saat mengirim feedback.");
      toast.warning("Terjadi kesalahan saat mengirim feedback.");
    } finally {
      setIsSubmitting(false); // 🔹 Kembalikan ke false saat proses selesai
    }
  };

  if (!id) return <div className="p-6">Loading...</div>; // tunggu id

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <Card className="mb-6 bg-gray-50 rounded-lg shadow-md">
        <CardContent className="flex items-center text-base font-semibold text-gray-700 space-x-3 p-6">
          <Link href="/" className="">
            Home
          </Link>
          <ChevronRight className="w-5 h-5 text-gray-500" />
          <Link href={breadCrumb} className="">
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
                  <AvatarFallback>{name}</AvatarFallback>
                </Avatar>

                {/* Teks Status */}
                <span className="font-medium">
                  {courseData.progress_percentage === 0
                    ? "Not Started Yet"
                    : courseData.progress_percentage === 100
                    ? "Completed 🎉"
                    : "In Progress"}
                </span>

                {/* Badge sesuai status */}
                {courseData.progress_percentage === 100 ? (
                  <Badge variant="success">✓</Badge>
                ) : courseData.progress_percentage > 0 ? (
                  <Badge variant="secondary">…</Badge>
                ) : (
                  <Badge variant="outline">○</Badge>
                )}
              </div>

              {/* Progress Bar */}
              <div className="w-full">
                <Progress
                  value={courseData.progress_percentage}
                  className="h-3 rounded-full [&>div]:bg-blue-600"
                />
                <span className="text-sm text-gray-500 mt-1">
                  {courseData.progress_percentage}% Completed
                </span>
              </div>

              {/* 🟦 Ubah: Tombol dengan dialog konfirmasi */}
              <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
                <AlertDialogTrigger asChild>
                  <Button
                    className="w-full bg-blue-900 hover:bg-blue-700 text-white"
                    onClick={() => setOpenConfirm(true)}
                  >
                    Start Course
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {courseData?.course_title}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {courseData?.id_user_enrollment ? (
                        <>
                          Anda akan <strong>melanjutkan</strong> course ini?
                        </>
                      ) : (
                        <>
                          Dengan menekan <strong>Mulai</strong>, Anda akan
                          terdaftar dalam course ini dan progress akan dicatat
                          dari awal.
                        </>
                      )}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-row justify-center gap-2 sm:justify-end">
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleStartCourse}
                      disabled={loading}
                      className="bg-blue-900 hover:bg-blue-700 text-white"
                    >
                      {loading ? "Memulai..." : "Mulai"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              {/* 🟦 End of perubahan */}

              {/* Course Info */}
              <div className="w-full space-y-1 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>Instructor</span> <span>{courseData.instructor}</span>
                </div>
                <div className="flex justify-between">
                  <span>Attempt Date</span>{" "}
                  <span>{formatDate(courseData.attempt_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Completion Date</span>{" "}
                  <span>{formatDate(courseData.completed_at)}</span>
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
              {orderedKeys.map((sectionKey) => {
                const items = sections[sectionKey];
                const isCourseContent = sectionKey === "courseContent";
                const isPreTest = sectionKey === "preTest";
                const isPostTest = sectionKey === "postTest";
                // console.log("sectionKey, items : ", sectionKey, items);

                return (
                  <div key={sectionKey} className="space-y-4">
                    {Array.isArray(items) && items.length > 0 ? (
                      items.map((v, index) => (
                        <div key={index} className="space-y-2">
                          <h2 className="text-lg font-semibold capitalize">
                            {isCourseContent
                              ? index === 0
                                ? "Course Content"
                                : ""
                              : v.content_title}
                          </h2>

                          {isCourseContent ? (
                            <Card className="flex items-center justify-between p-4">
                              {v.content_type_name === "PDF Content" ? (
                                <FileText className="w-5 h-5 text-red-500 mr-4" />
                              ) : // <Clipboard className="w-5 h-5 text-red-500 mr-4" />
                              v.content_type_name === "PPT Content" ? (
                                <FileSpreadsheet className="w-5 h-5 text-orange-500 mr-4" />
                              ) : v.content_type_name === "Video Content" ? (
                                <Video className="w-5 h-5 text-blue-500 mr-4" />
                              ) : (
                                <FileText className="w-5 h-5 text-gray-400 mr-4" />
                              )}

                              <span className="flex-1 text-gray-700 font-semibold">
                                {v.content_title}
                              </span>
                              <Checkbox
                                checked={v.is_completed}
                                className="w-5 h-5 border-gray-300 rounded bg-white 
                      data-[state=checked]:bg-blue-600 
                      data-[state=checked]:border-blue-600 focus:ring-0"
                              />
                            </Card>
                          ) : isPreTest || isPostTest ? (
                            <Card className="flex items-center justify-between p-4">
                              <HelpCircle className="w-5 h-5 text-gray-400 mr-4" />
                              <span className="flex-1 text-gray-700 font-semibold">
                                Quiz
                              </span>
                              <Checkbox
                                checked={v.is_completed}
                                className="w-5 h-5 border-gray-300 rounded bg-white 
              data-[state=checked]:bg-blue-600 
              data-[state=checked]:border-blue-600 focus:ring-0"
                              />
                            </Card>
                          ) : v.content_body ? (
                            v.content_body
                              .replace(/\\n+/g, "\n")
                              .split("\n")
                              .map((line) => line.trim())
                              .filter((line) => line.length > 0)
                              .map((content, i) => {
                                const isSubPoint = /^[-•o]/.test(content);
                                const isNumbered = /^\d+\./.test(content);

                                return (
                                  <Card
                                    key={i}
                                    className={`flex items-center justify-between p-4 ${
                                      isSubPoint ? "ml-6 bg-gray-50" : "ml-0"
                                    }`}
                                  >
                                    <FileText
                                      className={`w-5 h-5 text-gray-400 mr-4 ${
                                        isSubPoint ? "opacity-60" : ""
                                      }`}
                                    />
                                    <span
                                      className={`flex-1 text-gray-700 ${
                                        isSubPoint ? "text-sm" : "font-semibold"
                                      }`}
                                    >
                                      {content}
                                    </span>
                                    {isSubPoint ? null : (
                                      <Checkbox
                                        checked={v.is_completed}
                                        className="w-5 h-5 border-gray-300 rounded bg-white 
                          data-[state=checked]:bg-blue-600 
                          data-[state=checked]:border-blue-600 focus:ring-0"
                                      />
                                    )}
                                  </Card>
                                );
                              })
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

                          {/* {v.content_body ? (
                            v.content_body
                              .replace(/\\n+/g, "\n")
                              .split("\n")
                              .map((line) => line.trim())
                              .filter((line) => line.length > 0)
                              .map((content, i) => {
                                const isSubPoint = /^[-•o]/.test(content);
                                const isNumbered = /^\d+\./.test(content);

                                return (
                                  <Card
                                    key={i}
                                    className={`flex items-center justify-between p-4 ${
                                      isSubPoint ? "ml-6 bg-gray-50" : "ml-0"
                                    }`}
                                  >
                                    <FileText
                                      className={`w-5 h-5 text-gray-400 mr-4 ${
                                        isSubPoint ? "opacity-60" : ""
                                      }`}
                                    />
                                    <span
                                      className={`flex-1 text-gray-700 ${
                                        isSubPoint ? "text-sm" : "font-semibold"
                                      }`}
                                    >
                                      {content}
                                    </span>

                                    <Checkbox
                                      checked={v.is_completed}
                                      className="w-5 h-5 border-gray-300 rounded bg-white 
                          data-[state=checked]:bg-blue-600 
                          data-[state=checked]:border-blue-600 focus:ring-0"
                                    />
                                  </Card>
                                );
                              })
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
                          )} */}
                        </div>
                      ))
                    ) : (
                      <Card className="flex items-center justify-between p-4">
                        <FileText className="w-5 h-5 text-gray-400 mr-4" />
                        <span className="flex-1 text-gray-500 italic">
                          No content available.
                        </span>
                        <Checkbox
                          className="w-5 h-5 border-gray-300 rounded bg-white 
              data-[state=checked]:bg-blue-600 
              data-[state=checked]:border-blue-600 focus:ring-0"
                        />
                      </Card>
                    )}
                  </div>
                );
              })}
            </TabsContent>

            <TabsContent value="reviews">
              <div className="space-y-4">
                {hasFeedback && userFeedback ? (
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <h3 className="font-semibold text-gray-800">
                      Feedback Anda
                    </h3>
                    <div className="flex items-center mt-2 space-x-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={`w-6 h-6 ${
                            i <= userRating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="mt-2 text-gray-700">{userFeedback}</p>
                  </div>
                ) : (
                  <>
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
                      <span className="text-sm text-gray-500">
                        {rating} Stars
                      </span>
                    </div>

                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Tambahkan komentar Anda..."
                      className="w-full p-2 border rounded-md"
                    />

                    <Button
                      onClick={handleSendFeedback}
                      className="bg-blue-900 hover:bg-blue-700 text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Mengirim..." : "Submit Review"}
                    </Button>
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
