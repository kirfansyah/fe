"use client";
import React, { useContext } from "react";
import { CourseContext } from "@/contexts/CourseContext";

export default function Quiz({ questions, current }) {
  const { state, setAnswer } = useContext(CourseContext);
  const q = questions[current];
  const answers = state.answers || {};

  if (!q) return <p>Tidak ada pertanyaan</p>;

  const handleAnswer = (value) => {
    setAnswer(q.id, parseInt(value));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">
        {q.question} ({current + 1}/{questions.length})
      </h2>
      {q.options.map((opt, idx) => (
        <label key={idx} className="flex items-center gap-2">
          <input
            type="radio"
            name={`q-${q.id}`}
            value={idx}
            checked={answers[q.id] === idx}
            onChange={() => handleAnswer(idx)}
          />
          {opt}
        </label>
      ))}
    </div>
  );
}
