"use client";
import React from "react";
import CoursePlayer from "@/components/course/CoursePlayer";
import CourseLayout from "@/layouts/CourseLayout";

export default function StartCoursePage() {
  return <CoursePlayer />;
}

StartCoursePage.layout = CourseLayout;
