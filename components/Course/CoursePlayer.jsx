"use client";

import React, { useContext, useEffect } from "react";
import TopBar from "@/components/Course/TopBar";
import LeftSidebar from "@/components/Course/LeftSidebar";
import ContentArea from "@/components/Course/ContentArea";
import { CourseContext } from "@/contexts/CourseContext";

export default function CoursePlayer({ ...props }) {
  const { state, setStep, goNext } = useContext(CourseContext);
  const { flow, currentStep, completed, setCourseId, courseId } = state;
  const { exitCourse, mainCourse } = props;

  //   console.log("flow : ", flow);

  useEffect(() => {
    if (document.fullscreenEnabled && !document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .catch((err) => console.warn("Fullscreen error:", err));
    }
  }, []);
  // 1️⃣ LOAD LAST SAVED STEP
  useEffect(() => {
    if (!courseId) return;

    const savedStep = localStorage.getItem(`lastStep_${courseId}`);
    if (savedStep !== null) {
      const saved = Number(savedStep);

      // cegah loop: hanya setStep jika berbeda
      if (saved !== currentStep) {
        setStep(saved);
      }
    }
  }, [courseId]);

  // 2️⃣ SAVE CURRENT STEP TO LOCALSTORAGE
  useEffect(() => {
    if (courseId !== null) {
      localStorage.setItem(`lastStep_${courseId}`, currentStep);
    }
  }, [currentStep, courseId]);

  return (
    <div className="p-4 space-y-4">
      <TopBar exitCourse={exitCourse} mainCourse={mainCourse} />
      <div className="flex flex-col md:flex-row gap-4">
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
        />
      </div>
    </div>
  );
}
