"use client";
import { useContext, useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Quiz from "./Quiz";
import { CourseContext } from "@/contexts/CourseContext";

export default function ContentArea() {
  const { state, goNext, setStep } = useContext(CourseContext);
  const { flow, currentStep, answers } = state;

  const allSteps = flow.flatMap((s) => s.children ?? [s]);
  const idx = allSteps.findIndex((s) => s.id === currentStep);
  const step = allSteps[idx];
  const nextStep = allSteps[idx + 1];
  const prevStep = allSteps[idx - 1];

  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [score, setScore] = useState(null);

  if (!step) {
    return (
      <Card className="flex-1">
        <CardContent className="p-4">
          <p className="text-gray-500">Silakan pilih materi di sebelah kiri.</p>
        </CardContent>
      </Card>
    );
  }

  const handleNext = () => {
    if (step.type === "quiz") {
      if (currentQuiz < step.questions.length - 1) {
        setCurrentQuiz((c) => c + 1);
      } else {
        setShowConfirm(true);
      }
    } else if (nextStep) {
      goNext(currentStep, nextStep.id);
      setCurrentQuiz(0);
    }
  };
  const handlePrevious = () => {
    if (step.type === "quiz") {
      if (currentQuiz > 0) {
        setCurrentQuiz((c) => c - 1);
      } else if (prevStep) {
        setStep(prevStep.id);
        setCurrentQuiz(0);
        setScore(null);
        setShowConfirm(false);
      }
    } else if (prevStep) {
      setStep(prevStep.id);
      setCurrentQuiz(0);
      setScore(null);
      setShowConfirm(false);
    }
  };

  const submitQuiz = () => {
    let correct = 0;
    step.questions.forEach((q) => {
      if (answers[q.id] === q.answer) correct++;
    });
    const result = Math.round((correct / step.questions.length) * 100);
    setScore(result);
    setShowConfirm(false);
  };

  return (
    <Card className="flex-1 flex flex-col h-full">
      <CardContent className="p-4 over space-y-4">
        {step.type === "text" && <p>{step.title}</p>}
        {step.type === "quiz" && (
          <Quiz questions={step.questions} current={currentQuiz} />
        )}
        {step.type === "pdf" && <div>PDF Viewer di sini</div>}
        {step.type === "video" && <div>Video Player di sini</div>}

        {/* Konfirmasi submit quiz */}
        {step.type === "quiz" && showConfirm && (
          <div className="mt-4 p-4 border rounded-lg bg-gray-50 space-y-2">
            <p>
              Apakah Anda yakin ingin menyimpan jawaban dan mengakhiri quiz?
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowConfirm(false)}>
                Batal
              </Button>
              <Button onClick={submitQuiz} className="bg-blue-600 text-white">
                Simpan & Selesai
              </Button>
            </div>
          </div>
        )}

        {/* Hasil quiz */}
        {score !== null && (
          <div className="mt-4 p-4 border rounded-lg bg-blue-50 text-center">
            <h2 className="text-xl font-bold">Hasil Quiz</h2>
            <p className="text-lg mt-2">
              Skor Anda:{" "}
              <span className="font-bold text-blue-700">{score}</span>%
            </p>
            {nextStep && (
              <Button
                onClick={() => {
                  goNext(currentStep, nextStep.id);
                  setScore(null);
                  setCurrentQuiz(0);
                }}
                className="mt-2 bg-blue-900 text-white"
              >
                Next: {nextStep.title}
              </Button>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between mt-auto space-x-2">
        {(step.type === "quiz" && currentQuiz > 0) || prevStep ? (
          <Button
            onClick={handlePrevious}
            variant="outline"
            className="bg-gray-200 text-gray-800"
          >
            Previous
          </Button>
        ) : (
          <div />
        )}

        {step.type !== "quiz" && nextStep && (
          <Button
            onClick={() => goNext(currentStep, nextStep.id)}
            className="bg-blue-900 text-white"
          >
            Next: {nextStep.title}
          </Button>
        )}

        {step.type === "quiz" && !showConfirm && score === null && (
          <Button onClick={handleNext} className="bg-blue-900 text-white">
            {currentQuiz < step.questions.length - 1
              ? "Next Question"
              : "Submit Quiz"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
