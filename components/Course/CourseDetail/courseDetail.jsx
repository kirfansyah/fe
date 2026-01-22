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
import Swal from "sweetalert2";

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
  const [createdBy, setCreatedBy] = useState("system");
  const [createdDevice, setCreatedDevice] = useState("web");

  const orderedKeys = [
    "courseGuide",
    "courseOutline",
    "preTest",
    "courseContent",
    "postTest",
  ];

  const getCookie = (name) => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(
      new RegExp("(^| )" + name + "=([^;]+)")
    );
    return match ? decodeURIComponent(match[2]) : null;
  };

  const getDeviceType = () => {
    if (typeof navigator === "undefined") return "web";
    const ua = navigator.userAgent.toLowerCase();
    return /mobile|android|iphone|ipad/.test(ua) ? "mobile" : "web";
  };

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
    const nama = getCookie("nama");
    if (nama) {
      setCreatedBy(nama);
    }

    setCreatedDevice(getDeviceType());
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      const match = document.cookie.match(new RegExp("(^| )nama=([^;]+)"));
      const nama = match ? match[2] : null;

      if (nama) {
        setName(nama.charAt(0).toUpperCase());
      }
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await getCourseById(id);

        if (res.data.data.length <= 0) {
          toast.warning("Error API response : " + res.data.message);
        }

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

  const sections = courseData?.sections || {};
  //   console.log("coursedata a:", courseData);

  const handleStartCourse = async () => {
    try {
      const payload = {
        id_course_enrollment: courseData.id_course_enrollment,
        // id_course_enrollment: 8,
        id_course: courseData.id_course,
        progress_percentage: 0,
        created_by: "system",
        created_device: "web",
      };

      if (!courseData?.id_user_enrollment) {
        const result = await sendEnrollment(payload);
        if (!result.success) {
          toast.warning("Error API Response : " + result.message);
          return;
        }
      }
      setCourseId(courseData.id_course);
      router.push(`${startCourse}${courseData.id_course}`);
    } catch (error) {
      console.error("❌ Gagal melakukan enrollment:", error);
      console.log(
        "error : ",
        error.apiMessage || error.message || "Terjadi kesalahan"
      );
      //   toast.warning(error);
    }
  };
  //   console.log(createdBy, createdDevice);

  const handleSendFeedback = async () => {
    if (!rating) {
      //   alert("Silakan beri rating terlebih dahulu.");
      //   toast.warning("Silakan beri rating terlebih dahulu.");
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "warning",
        title: "Hampir Selesai ⭐",
        text: "Yuk, beri rating terlebih dahulu agar kami bisa meningkatkan kualitas pembelajaran.",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        confirmButtonColor: "#1e3a8a",
        customClass: {
          popup: "rounded-xl shadow-lg",
        },
        didOpen: (toast) => {
          toast.addEventListener("mouseenter", Swal.stopTimer);
          toast.addEventListener("mouseleave", Swal.resumeTimer);
        },
      });

      return;
    }

    if (!reviewText.trim()) {
      //   toast.warning("Silakan isi komentar atau masukan Anda.");
      //   alert("Silakan isi komentar atau masukan Anda.");
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "warning",
        title: "Masukan Diperlukan ✍️",
        text: "Silakan isi komentar atau masukan Anda untuk membantu kami menjadi lebih baik.",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        confirmButtonColor: "#1e3a8a",
        customClass: {
          popup: "rounded-xl shadow-lg",
        },
        didOpen: (toast) => {
          toast.addEventListener("mouseenter", Swal.stopTimer);
          toast.addEventListener("mouseleave", Swal.resumeTimer);
        },
      });

      return;
    }
    setIsSubmitting(true);

    try {
      const payload = {
        id_course: courseData.id_course,
        id_course_enrollment: courseData.id_course_enrollment,
        rating: rating,
        feedback: reviewText,
        // created_by: "system", // nanti bisa diganti user login
        // created_device: "web",
        created_by: createdBy,
        created_device: createdDevice,
      };

      const result = await sendFeedback(payload);

      if (result?.success) {
        // toast.success("Terima kasih atas feedback Anda! 🎉");
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Terima Kasih! 🎉",
          text: "Masukan dan feedback Anda sangat berarti bagi kami.",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          confirmButtonColor: "#1e3a8a",
          customClass: {
            popup: "rounded-xl shadow-lg",
          },
          didOpen: (toast) => {
            toast.addEventListener("mouseenter", Swal.stopTimer);
            toast.addEventListener("mouseleave", Swal.resumeTimer);
          },
        });

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
      toast.warning("Terjadi kesalahan saat mengirim feedback.");
    } finally {
      setIsSubmitting(false); // 🔹 Kembalikan ke false saat proses selesai
    }
  };

  if (!id) return <div className="p-6">Loading...</div>; // tunggu id

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <Card className="mb-6 rounded-lg shadow-md bg-gradient-to-r from-blue-900 to-blue-500 text-white">
        <CardContent className="flex items-center text-base font-semibold text-white space-x-3 p-6">
          <Link href="/" className="">
            Home
          </Link>
          <ChevronRight className="w-5 h-5 text-gray-500" />
          <Link href={breadCrumb} className="">
            Courses
          </Link>
          <ChevronRight className="w-5 h-5 text-gray-500" />
          <span className="text-white font-bold">
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
                src={
                  courseData?.thumbnail_url ||
                  "/img/course/Teacher student-cuate.png"
                }
                onError={(e) =>
                  (e.target.src = "/img/course/Teacher student-cuate.png")
                }
                alt="Course"
                className="w-full h-45 object-cover rounded-md"
              />

              {/* Avatar + You're Enrolled */}
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src="/img/avatar.jpg" />
                  <AvatarFallback>{name}</AvatarFallback>
                </Avatar>

                {/* Teks Status */}
                {/* <span className="font-medium">
                  {courseData.progress_percentage === 0
                    ? "Not Started Yet"
                    : courseData.progress_percentage === 100
                    ? "Completed 🎉"
                    : "In Progress"}
                </span> */}
                {/* Status or Progress */}
                <Badge
                  className={`mt-2 px-3 py-1 w-24 text-center rounded-lg font-medium justify-center ${
                    courseData.status === "Passed"
                      ? "bg-green-600"
                      : courseData.status === "Failed"
                      ? "bg-red-500"
                      : courseData.status === "Not Started"
                      ? "bg-blue-500 text-white"
                      : courseData.status === "In Progress"
                      ? "bg-blue-500"
                      : ""
                  }`}
                >
                  {courseData.status}
                </Badge>

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
                  {Math.ceil(courseData?.progress_percentage || 0)}% Completed
                </span>
              </div>

              {/* 🟦 Ubah: Tombol dengan dialog konfirmasi */}
              <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
                <AlertDialogTrigger asChild>
                  <Button
                    className="w-full bg-blue-900 hover:bg-blue-700 text-white"
                    onClick={() => setOpenConfirm(true)}
                    // disabled={loading && !courseData && !courseData.id_course}
                    disabled={!courseData.id_course}
                    // disabled={true}
                  >
                    {courseData.progress_percentage &&
                    courseData.progress_percentage !== 100
                      ? "Continue Course"
                      : courseData.progress_percentage === 100
                      ? "View Completed Course"
                      : "Start Course"}{" "}
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
                  <AlertDialogFooter className="!flex !flex-row justify-center gap-3 sm:justify-end">
                    <div className="flex w-full flex-row gap-3 justify-center">
                      <AlertDialogCancel className="w-1/2 sm:w-auto h-11 !mt-0">
                        Batal
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleStartCourse}
                        className="w-1/2 sm:w-auto h-11 bg-blue-900 hover:bg-blue-700 text-white"
                      >
                        {loading ? "Memulai..." : "Mulai"}
                      </AlertDialogAction>
                    </div>
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
                  <span>Reviews</span>{" "}
                  <span>
                    {courseData?.rating ? `${courseData.rating}/5` : "-"}
                  </span>
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
                                      className={`flex-1 text-gray-700 line-clamp-1 ${
                                        isSubPoint ? "text-sm" : "font-semibold"
                                      }`}
                                      dangerouslySetInnerHTML={{
                                        __html: content,
                                      }}
                                    />

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
                            // <Card className="flex items-center justify-between p-4">
                            //   <FileText className="w-5 h-5 text-gray-400 mr-4" />
                            //   <span className="flex-1 text-gray-500 italic">
                            //     No content available.
                            //   </span>
                            //   <Checkbox
                            //     checked={v.is_completed}
                            //     className="w-5 h-5 border-gray-300 rounded bg-white
                            //             data-[state=checked]:bg-blue-600
                            //             data-[state=checked]:border-blue-600 focus:ring-0"
                            //   />
                            // </Card>
                            <></>
                          )}
                        </div>
                      ))
                    ) : (
                      //           <Card className="flex items-center justify-between p-4">
                      //             <FileText className="w-5 h-5 text-gray-400 mr-4" />
                      //             <span className="flex-1 text-gray-500 italic">
                      //               No content available.
                      //             </span>
                      //             <Checkbox
                      //               className="w-5 h-5 border-gray-300 rounded bg-white
                      //   data-[state=checked]:bg-blue-600
                      //   data-[state=checked]:border-blue-600 focus:ring-0"
                      //             />
                      //           </Card>
                      <></>
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
