"use client";
import React, { useContext } from "react";
import { CourseContext } from "@/contexts/CourseContext";

export default function Quiz({ questions = [], score, isCompleted = false }) {
  const { state, setAnswer } = useContext(CourseContext);
  const answers = state.answers || {};

  if (!questions?.length) return <p>Tidak ada pertanyaan.</p>;

  return (
    <div className="space-y-6">
      {/* Skor tampil kalau ada */}
      {score !== null && (
        <div className="p-3 border rounded bg-green-50">
          <p className="font-semibold text-green-700">Skor Anda: {score}</p>
        </div>
      )}

      {questions.map((q, index) => (
        <div key={q.id_course_question} className="space-y-3 border-b pb-4">
          <h3 className="text-lg font-semibold">
            {index + 1}. {q.question_text}
          </h3>

          <div className="space-y-2">
            {Array.isArray(q.options) &&
              q.options.map((opt) => {
                const isUserAnswer = isCompleted
                  ? opt.is_selected_by_learner
                  : answers[q.id_course_question] === opt.id_option;

                const isCorrect = opt.is_correct === true;

                const labelClass = isCompleted
                  ? isCorrect
                    ? "border-green-500 bg-green-50"
                    : isUserAnswer
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200"
                  : "border-gray-300 hover:bg-gray-50 cursor-pointer";

                return (
                  <label
                    key={opt.id_option}
                    className={`flex items-center gap-2 p-2 border rounded-md transition-all ${labelClass}`}
                  >
                    <input
                      type="radio"
                      name={`q-${q.id_course_question}`}
                      value={opt.id_option}
                      checked={isUserAnswer}
                      disabled={isCompleted}
                      onChange={() =>
                        !isCompleted &&
                        setAnswer(q.id_course_question, opt.id_option)
                      }
                    />
                    <span>
                      <strong>{opt.option_label}.</strong> {opt.option_text}
                    </span>

                    {/* Label hasil */}
                    {isCompleted && isCorrect && (
                      <span className="ml-2 text-green-600 font-semibold"></span>
                    )}
                    {isCompleted && isUserAnswer && !isCorrect && (
                      <span className="ml-2 text-red-600 font-semibold"></span>
                    )}
                  </label>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
