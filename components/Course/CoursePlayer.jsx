"use client";

import React, { useContext, useEffect, useState } from "react";
import TopBar from "@/components/Course/TopBar";
import LeftSidebar from "@/components/Course/LeftSidebar";
import ContentArea from "@/components/Course/ContentArea";
import { CourseContext } from "@/contexts/CourseContext";
import { useEmployees } from "@/hooks/useEmployees";

export default function CoursePlayer({ ...props }) {
  const { state, setStep, goNext } = useContext(CourseContext);
  const { flow, currentStep, completed, setCourseId, courseId, courseData } =
    state;
  const { exitCourse, mainCourse } = props;
  const [idUserEnrollment, setIdUserEnrollment] = useState(null);

  useEffect(() => {
    if (document.fullscreenEnabled && !document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .catch((err) => console.warn("Fullscreen error:", err));
    }
  }, []);

  useEffect(() => {
    if (!courseId) return;
    if (!courseData) return;
    if (!courseData.id_user_enrollment) return;
    setIdUserEnrollment(courseData.id_user_enrollment);
  }, [courseData, courseId]);

  useEffect(() => {
    if (!courseId) return;

    const raw = localStorage.getItem(`lastStep_${courseId}`);
    if (!raw) return;

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      localStorage.removeItem(`lastStep_${courseId}`);
      return;
    }

    const EXPIRATION = 30 * 60 * 1000; // 30 menit

    if (Date.now() - data.savedAt > EXPIRATION) {
      // expired → reset
      localStorage.removeItem(`lastStep_${courseId}`);
      console.log("lastStep expired & reset otomatis");
      return;
    }

    // masih valid → load
    if (data.step !== currentStep) {
      setStep(data.step);
    }
  }, [courseId]);

  // 2️⃣ SAVE CURRENT STEP TO LOCALSTORAGE
  useEffect(() => {
    if (courseId !== null) {
      localStorage.setItem(`lastStep_${courseId}`, currentStep);
    }
  }, [currentStep, courseId]);

  //   useEffect(() => {
  //     // if (!idUserEnrollment) return;

  //     const handleUnload = () => {
  //       navigator.sendBeacon(
  //         `${process.env.NEXT_PUBLIC_API_URL}/learner/course/close-session/${idUserEnrollment}`
  //       );
  //     };

  //     window.addEventListener("unload", handleUnload);

  //     return () => {
  //       window.removeEventListener("unload", handleUnload);
  //     };
  //   }, []);

  //   useEffect(() => {
  //     if (!idUserEnrollment) return;

  //     const handleBeforeUnload = (e) => {
  //       // 🔥 Kirim API DULU
  //       navigator.sendBeacon(
  //         `${process.env.NEXT_PUBLIC_API_URL}/learner/course/close-session/${idUserEnrollment}`
  //       );

  //       // 🔥 Lalu tampilkan confirm
  //       e.preventDefault();
  //       e.returnValue = "";
  //     };

  //     window.addEventListener("beforeunload", handleBeforeUnload);

  //     return () => {
  //       window.removeEventListener("beforeunload", handleBeforeUnload);
  //     };
  //   }, [idUserEnrollment]);

  return (
    <div className="p-0 space-y-4">
      <TopBar exitCourse={exitCourse} mainCourse={mainCourse} />
      <div className="flex flex-col-reverse md:flex-row gap-4">
        <LeftSidebar
          flow={flow}
          current={currentStep}
          completed={completed}
          onStepSelect={setStep}
        />
        <ContentArea
          stepId={currentStep}
          flow={flow}
          onNext={(nextId) => goNext(currentStep, nextId)}
          exitCourse={exitCourse}
          courseId={courseId}
        />
      </div>
    </div>
  );
}
