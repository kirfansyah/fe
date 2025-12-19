"use client";
import { useContext, useState, useEffect, useRef } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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

import { Button } from "@/components/ui/button";
import Quiz from "./Quiz";
import { CourseContext } from "@/contexts/CourseContext";
import PdfViewer from "@/components/Course/PdfViewer";
import PptViewer from "@/components/Course/PptViewer";
import dynamic from "next/dynamic";
import { useEmployees } from "@/hooks/useEmployees";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const VideoPlayer = dynamic(() => import("@/components/Course/VideoPlayer"), {
  ssr: false,
});

export default function ContentArea({ exitCourse }) {
  const { state, goNext, setStep, completeStep, refreshCourseProgress } =
    useContext(CourseContext);
  const { flow, currentStep, answers, courseData } = state;
  const { completeCourse, sendAswers } = useEmployees();
  const preloadedVideosRef = useRef(new Set());

  const orderedKeys = [
    "courseGuide",
    "courseOutline",
    "preTest",
    "courseContent",
    "postTest",
  ];
  //   console.log("flow :", flow);

  const allSteps = Object.entries(flow)
    .sort(
      (a, b) => orderedKeys.indexOf(a[0]) - orderedKeys.indexOf(b[0]) // urut berdasarkan orderedKeys
    )
    .flatMap(([key, items]) =>
      items.map((s) => {
        let type = "text";

        // if (s.content_url) {
        //   if (s.content_url.endsWith(".mp4")) type = "video";
        //   else if (s.content_url.endsWith(".pdf")) type = "pdf";
        //   else if (s.content_url.endsWith(".pptx")) type = "pptx";
        // } else if (s.questions) {
        //   type = "quiz";
        // }
        if (s.content_type_name) {
          if (s.content_type_name == "PDF Content") type = "pdf";
          else if (s.content_type_name == "Video Content") type = "video";
          else if (s.content_type_name == "PPT Content") type = "pptx";
          else if (s.content_type_name == "Post Test") type = "quiz";
          else if (s.content_type_name == "Pre Test") type = "quiz";
        } else {
          type = "quiz";
        }

        return {
          ...s,
          id: s.id_course_content,
          type,
          section: key, // optional kalau mau track section origin
        };
      })
    );
  //   console.log("flow allSteps :", flow);

  let idx = allSteps.findIndex((s) => s.id === currentStep);
  if (idx === -1) idx = 0;
  const step = allSteps[idx];
  const nextStep = allSteps[idx + 1];
  const prevStep = allSteps[idx - 1];

  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [score, setScore] = useState(null);
  const [showNextConfirm, setShowNextConfirm] = useState(false);
  const [pendingStep, setPendingStep] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contentCompleted, setContentCompleted] = useState(false);
  const [open, setOpen] = useState(false);
  const [courseId, setCourseId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [autoSubmitting, setAutoSubmitting] = useState(false);
  const [pdfFinished, setPdfFinished] = useState(false);
  const [videoFinished, setVideoFinished] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [pptFile, setPptFile] = useState(null);

  //   const defaultPDF = "/uploads/pdf/default.pdf";
  //   const defaultPDF =
  //     "/api/pdf-proxy?url=" +
  //     encodeURIComponent(
  //       "https://api-lms.sambu.co.id/uploads/ebooks/files/a569a951-3311-451c-9338-89dad8d7595a.pdf"
  //     );
  //   const defaultPDF =
  //     "http://api-lms.sambu.co.id/uploads/ebooks/files/a569a951-3311-451c-9338-89dad8d7595a.pdf";
  //   const defaultVideo = "/uploads/video/komunikasi-efektif-2.mp4";
  //   const defaultPpt =
  //     "https://docs.google.com/presentation/d/1jsjVVdCjlVd5uAM3e_nlyPVoNUKid07A/edit?usp=sharing";

  //docs.google.com/presentation/d/16Q2rtFTCRZuzWLoq9c1qmIzvHX6gcUvM/edit?usp=sharing&ouid=107324705590480170219&rtpof=true&sd=true
  //   useEffect(() => {
  //     // ❗ Jangan lakukan apa pun kalau step belum siap
  //     if (!step) return;

  //     async function checkFiles() {
  //       //   const baseURL = window.location.origin;
  //       const baseURL = process.env.API_BASE || "https://api-lms.sambu.co.id";

  //       // ===== PDF =====
  //       if (step.content_url && step.content_url.endsWith(".pdf")) {
  //         const pdfUrl = `${baseURL}/${step.content_url}`;

  //         try {
  //           const res = await fetch(pdfUrl, { method: "HEAD" });
  //           setPdfFile(res.ok ? pdfUrl : defaultPDF);
  //         } catch {
  //           setPdfFile(defaultPDF);
  //         }
  //       } else {
  //         setPdfFile(defaultPDF);
  //       }

  //       // ===== VIDEO =====
  //       if (step.content_url && step.content_url.endsWith(".mp4")) {
  //         const videoUrl = `${baseURL}/${step.content_url}`;

  //         try {
  //           const res = await fetch(videoUrl, { method: "HEAD" });
  //           setVideoFile(res.ok ? videoUrl : defaultVideo);
  //         } catch {
  //           setVideoFile(defaultVideo);
  //         }
  //       } else {
  //         setVideoFile(defaultVideo);
  //       }

  //       // ===== PPT =====
  //       if (step.content_url && step.content_url.endsWith(".pptx")) {
  //         const pptUrl = `${baseURL}/${step.content_url}`;

  //         try {
  //           const res = await fetch(pptUrl, { method: "HEAD" });
  //           setPptFile(res.ok ? pptUrl : defaultPpt);
  //         } catch {
  //           setPptFile(defaultPpt);
  //         }
  //       } else {
  //         setPptFile(defaultPpt);
  //       }
  //     }

  //     checkFiles();
  //   }, [step]);

  const router = useRouter();
  useEffect(() => {
    if (!step) return;

    if (step.type === "quiz" && !step.is_completed) {
      const totalTime = (step.questions?.length || 0) * 60;
      setTimeLeft(totalTime);
    } else {
      setTimeLeft(null);
    }
  }, [step?.id]);

  // Hitung mundur timer
  useEffect(() => {
    if (!step || step.type !== "quiz" || step.is_completed) return;
    if (timeLeft === null) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step]);

  useEffect(() => {
    if (!currentStep && allSteps.length > 0) {
      setStep(allSteps[0].id_course_content);
    }
    setCourseId(courseData?.id_course);
  }, [currentStep, allSteps, setStep]);

  useEffect(() => {
    if (!step) return;
    if (step.type !== "video") return;

    const videoUrl = `/api/video-proxy?url=${encodeURIComponent(
      step.content_url_full
    )}`;

    // ❗ Hindari preload ulang
    if (preloadedVideosRef.current.has(videoUrl)) return;

    const video = document.createElement("video");
    video.src = videoUrl;
    video.preload = "metadata"; // 🔥 KUNCI UTAMA
    video.muted = true;
    video.playsInline = true;

    video.load();

    preloadedVideosRef.current.add(videoUrl);

    return () => {
      video.src = "";
    };
  }, [step]);

  if (!step) {
    return (
      <Card className="flex-1">
        <CardContent className="p-4">
          <p className="text-gray-500">Silakan pilih materi di sebelah kiri.</p>
        </CardContent>
      </Card>
    );
  }

  const handleFinishLogic = async () => {
    const navigate = router.push(`${exitCourse}${courseId}`);

    if (document.fullscreenElement) {
      Promise.race([
        document.exitFullscreen(),
        new Promise((resolve) => setTimeout(resolve, 200)),
      ])
        .then(() => setIsFullscreen(false))
        .catch((err) => console.warn("Gagal keluar fullscreen:", err));
    }

    setOpen(false);

    await navigate;
  };

  const handleAutoSubmit = async () => {
    if (autoSubmitting || step.is_completed) return;

    setAutoSubmitting(true);
    await submitQuiz(); // ⬅️ auto submit seperti Ruangguru
    setAutoSubmitting(false);
  };

  const handleCompleteContent = async (stepId) => {
    try {
      setIsSubmitting(true);
      const payload = {
        id_user_enrollment: courseData.id_user_enrollment,
        // id_user_enrollment: 8,
        id_course_content: stepId,
        updated_at: new Date().toISOString(),
        updated_by: "system",
        updated_device: "web",
      };

      const res = await completeCourse(payload);
      if (res.data.length <= 0) {
        toast.warning("Error API response : " + res.data.message);
        return;
      }
      completeStep(stepId);
      setContentCompleted((prev) => !prev);
      await refreshCourseProgress();
    } catch (err) {
      console.error("❌ Gagal menyimpan progress:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToNext = async (nextId) => {
    if (!step.is_completed) {
      await handleCompleteContent(currentStep);
    }
    goNext(currentStep, nextId);
    setCurrentQuiz(0);
    setScore(null);
  };

  const handleNext = () => {
    if (step.type === "quiz") {
      if (currentQuiz < step.questions.length - 1) {
        setCurrentQuiz((c) => c + 1);
      } else {
        setShowConfirm(true);
      }
    } else if (nextStep) {
      setPendingStep(nextStep.id);
      setShowNextConfirm(true);
    }
  };

  const handlePrevious = () => {
    if (prevStep) {
      setStep(prevStep.id);
      setCurrentQuiz(0);
      setScore(null);
      setShowConfirm(false);
    }
  };

  const submitQuiz = async () => {
    try {
      setIsSubmitting(true);

      if (!step || !step.questions || !step.questions.length) return;

      const payload = step.questions.map((q) => {
        const selectedOptionId = answers[q.id_course_question];
        const selectedOption = q.options.find(
          (opt) => opt.id_option === selectedOptionId
        );

        const isCorrect = selectedOption ? selectedOption.is_correct : false;

        return {
          id_user_enrollment: courseData.id_user_enrollment,
          id_course_content: step.id_course_content,
          id_course_question: q.id_course_question,
          id_selected_option: selectedOption ? selectedOption.id_option : null,
          text_answer: selectedOption ? selectedOption.option_text : "",
          is_correct: isCorrect,
          points_earned: isCorrect ? q.correct_answer_points : 0,
          max_points_possible: q.correct_answer_points,
          attempt_number: 1,
          is_final_attempt: true,
          created_by: "system",
          created_device: "web",
        };
      });

      const response = await sendAswers(payload);

      if (!response.success) {
        toast.warning("Error API Response: " + response.message);
      }

      //   console.log("✅ Hasil submit quiz:", response);

      const totalPoints = payload.reduce(
        (acc, q) => acc + q.max_points_possible,
        0
      );
      const earnedPoints = payload.reduce((acc, q) => acc + q.points_earned, 0);
      const finalScore = Math.round((earnedPoints / totalPoints) * 100);

      setScore(finalScore);

      await handleCompleteContent(step.id_course_content);

      setShowConfirm(false);
    } catch (err) {
      console.error("❌ Gagal submit quiz:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="flex-1 flex flex-col h-full">
      <CardContent className="p-4 over space-y-4">
        {step.type === "text" && (
          <div className="space-y-3 p-5">
            <h2 className="text-xl font-semibold text-gray-800">
              {step.content_title}
            </h2>
            <div
              className="text-gray-700 text-lg leading-relaxed whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: step.content_body }}
            />
          </div>
        )}

        {step.type === "quiz" && !step.is_completed && (
          <div className="p-3 bg-red-50 border border-red-300 rounded text-center text-red-700 font-semibold">
            ⏱ Waktu Tersisa:{" "}
            {Math.floor(timeLeft / 60)
              .toString()
              .padStart(2, "0")}
            :{(timeLeft % 60).toString().padStart(2, "0")}
          </div>
        )}

        {step.type === "quiz" && (
          <Quiz
            questions={step.questions}
            score={step.earned_points}
            isCompleted={step.is_completed}
            currentQuiz={currentQuiz}
            setCurrentQuiz={setCurrentQuiz}
          />
        )}
        {step.type === "pdf" && (
          <div className="space-y-3 p-5">
            <h2 className="text-xl font-semibold text-gray-800">
              {step.content_title}
            </h2>
            <div className="w-full flex justify-center ">
              <PdfViewer
                file={`/api/pdf-proxy?url=${encodeURIComponent(
                  step.content_url_full
                )}`}
                // file={`/uploads/pdf/test.pdf`}
                onPageChange={(isLastPage) => setPdfFinished(isLastPage)}
                // onError={() => setPdfFile(defaultPDF)}
              />
            </div>
          </div>
        )}
        {step.type === "video" && (
          <div className="space-y-3 p-5">
            <h2 className="text-xl font-semibold text-gray-800">
              {step.content_title}
            </h2>
            <VideoPlayer
              url={`/api/video-proxy?url=${encodeURIComponent(
                step.content_url_full
              )}`}
              videoId={`${step.id}`}
              onVideoEnd={() => setVideoFinished(true)}
            />
          </div>
        )}

        {step.type === "pptx" && (
          <div className="space-y-3 p-5">
            <h2 className="text-xl font-semibold text-gray-800">
              {step.content_title}
            </h2>
            <div className="w-full flex justify-center">
              {/* <PptViewer file={`/test.pptx`} /> */}
              {/* <PdfViewer file={step.content_url.replace(".pptx", ".pdf")} /> */}
              {/* <PdfViewer file={`/test.pptx`.replace(".pptx", ".pdf")} /> */}
              {/* <PptViewer
                fileUrl={`https://docs.google.com/presentation/d/1qar5wJ9SEmlBTl-TS3z2GwKldOb4Cjyz/edit?usp=sharing&ouid=107324705590480170219&rtpof=true&sd=true`}
              /> */}
              {/* <PptViewer fileUrl="https://docs.google.com/presentation/d/1jsjVVdCjlVd5uAM3e_nlyPVoNUKid07A/edit?usp=sharing" /> */}
              <PptViewer fileUrl={pptFile} />
            </div>
          </div>
        )}

        {/* 🔹 Konfirmasi submit quiz pakai AlertDialog */}
        <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Apakah Anda yakin ingin menyimpan jawaban dan mengakhiri quiz?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Pastikan semua pertanyaan sudah dijawab sebelum Anda mengakhiri
                quiz ini. Jawaban yang sudah disubmit tidak dapat diubah.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-row justify-center gap-2 sm:justify-end">
              <AlertDialogCancel
                className="w-2 sm:w-auto"
                onClick={() => setShowConfirm(false)}
              >
                Batal
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={submitQuiz}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Simpan & Selesai
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* 🔹 Konfirmasi sebelum lanjut ke konten berikutnya (pakai shadcn) */}
        <AlertDialog open={showNextConfirm} onOpenChange={setShowNextConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Sudah selesai mempelajari materi ini?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Pastikan Anda telah membaca atau menonton semua bagian sebelum
                lanjut ke materi berikutnya.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-row justify-center gap-2 sm:justify-end">
              <AlertDialogCancel
                className="w-2 sm:w-auto"
                onClick={() => {
                  setShowNextConfirm(false);
                  setPendingStep(null);
                }}
              >
                Batal
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (pendingStep) goToNext(pendingStep);
                  setShowNextConfirm(false);
                }}
                disabled={isSubmitting}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {isSubmitting ? "Menyimpan..." : "Ya, Lanjutkan"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Anda akan mengakhiri course ini ?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Setelah menekan selesai, progress kamu akan disimpan dan tidak
                dapat diubah.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-row justify-center gap-2 sm:justify-end">
              <AlertDialogCancel
                className="w-2 sm:w-auto"
                onClick={() => {
                  setOpen(false);
                }}
              >
                Batal
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleFinishLogic}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Ya, Selesai
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>

      <CardFooter className="flex justify-between mt-auto space-x-2">
        {step.type === "quiz" && currentQuiz > 0 ? (
          <Button
            onClick={() => setCurrentQuiz(currentQuiz - 1)}
            variant="outline"
            className="bg-gray-200 text-gray-800"
          >
            Previous
          </Button>
        ) : prevStep ? (
          <Button
            onClick={handlePrevious}
            variant="outline"
            className="bg-gray-200 text-gray-800"
          >
            Previous
          </Button>
        ) : null}

        {/* ===== NEXT / SUBMIT / FINISH LOGIC ===== */}
        {step.type === "quiz" ? (
          // ===================== Quiz Content =====================
          <>
            {step.is_completed && step.section !== "postTest" ? (
              <Button
                onClick={() => {
                  // Kalau masih ada soal berikutnya
                  if (currentQuiz < step.questions.length - 1) {
                    setCurrentQuiz(currentQuiz + 1);
                  } else {
                    goNext(currentStep, nextStep.id_course_content);
                    setScore(null);
                    setCurrentQuiz(0);
                  }
                }}
                className="bg-blue-900 text-white"
              >
                {currentQuiz < step.questions.length - 1
                  ? "Next Soal"
                  : `Next: ${nextStep?.content_title}`}
              </Button>
            ) : !step.is_completed ? (
              <Button
                onClick={() => {
                  // Kalau masih ada soal berikutnya
                  if (currentQuiz < step.questions.length - 1) {
                    setCurrentQuiz(currentQuiz + 1);
                  } else {
                    // Quiz terakhir → show confirm submit
                    setShowConfirm(true);
                  }
                }}
                className="bg-blue-900 text-white"
              >
                {currentQuiz < step.questions.length - 1
                  ? "Next Soal"
                  : "Submit Quiz"}
              </Button>
            ) : nextStep ? (
              <Button
                onClick={() => {
                  goNext(currentStep, nextStep.id_course_content);
                  setScore(null);
                  setCurrentQuiz(0);
                }}
                className="bg-blue-900 text-white"
              >
                Next: {nextStep.content_title}
              </Button>
            ) : step.section === "postTest" && step.is_completed ? (
              <Button
                // onClick={() => setOpen(true)}
                onClick={() => {
                  // Kalau masih ada soal berikutnya
                  if (currentQuiz < step.questions.length - 1) {
                    setCurrentQuiz(currentQuiz + 1);
                  } else {
                    setOpen(true);
                  }
                }}
                className="bg-blue-900 text-white"
              >
                {currentQuiz < step.questions.length - 1
                  ? "Next Soal"
                  : "Selesai"}
              </Button>
            ) : null}
          </>
        ) : // ===================== Non-Quiz Content =====================
        nextStep ? (
          <Button
            onClick={handleNext}
            className="bg-blue-900 text-white"
            disabled={
              (step.type === "pdf" && !pdfFinished) ||
              (step.type === "video" && !videoFinished)
            }
          >
            Next: {nextStep.content_title}
          </Button>
        ) : step.section === "postTest" && step.is_completed ? (
          <Button
            onClick={() => setOpen(true)}
            className="bg-blue-900 text-white"
          >
            Selesai
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
}
