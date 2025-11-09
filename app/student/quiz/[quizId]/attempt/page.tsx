"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Option {
  id: string
  text: string
}

interface Question {
  id: string
  text: string
  options: Option[]
}

interface QuizAttempt {
  attemptId: string
  questions: Question[]
  timeLimit: number
}

export default function QuizAttempt() {
  const params = useParams()
  const searchParams = useSearchParams()
  const quizId = params.quizId as string
  const attemptId = searchParams.get("attemptId")
  const router = useRouter()

  const [quiz, setQuiz] = useState<QuizAttempt | null>(null)
  const [currentQIdx, setCurrentQIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)

  useEffect(() => {
    if (attemptId) {
      fetchAttempt()
    }
  }, [attemptId, quizId])

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((t) => (t ? t - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const fetchAttempt = async () => {
    try {
      const res = await fetch(`/api/student/quizzes/${quizId}/start`, { method: "POST" })
      const data = await res.json()
      setQuiz(data)
      if (data.timeLimit) {
        setTimeLeft(data.timeLimit * 60)
      }
    } catch (error) {
      console.error("Error fetching attempt:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleAnswer = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: prev[questionId]?.includes(optionId)
        ? prev[questionId].filter((id) => id !== optionId)
        : [...(prev[questionId] || []), optionId],
    }))
  }

  const submitQuiz = async () => {
    if (!attemptId || !quiz) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/student/quizzes/${quizId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          answers,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        router.push(`/student/quiz/${quizId}/result?attemptId=${attemptId}`)
      }
    } catch (error) {
      console.error("Error submitting quiz:", error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="text-center py-8">Loading...</div>
  if (!quiz) return <div className="text-center py-8">Quiz not found</div>

  const currentQuestion = quiz.questions[currentQIdx]
  const isLastQuestion = currentQIdx === quiz.questions.length - 1

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <span className="font-semibold">
            Question {currentQIdx + 1} of {quiz.questions.length}
          </span>
          {timeLeft !== null && (
            <span className={timeLeft < 300 ? "text-destructive font-semibold" : ""}>
              Time left: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
            </span>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{currentQuestion?.text}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentQuestion?.options.map((option) => (
              <div
                key={option.id}
                className="flex items-center gap-3 p-3 border rounded hover:bg-muted cursor-pointer"
                onClick={() => toggleAnswer(currentQuestion.id, option.id)}
              >
                <input
                  type="checkbox"
                  checked={answers[currentQuestion.id]?.includes(option.id) || false}
                  onChange={() => {}}
                  className="w-4 h-4"
                />
                <label className="flex-1 cursor-pointer">{option.text}</label>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex gap-4 mt-8">
          <Button
            variant="outline"
            disabled={currentQIdx === 0}
            onClick={() => setCurrentQIdx(Math.max(0, currentQIdx - 1))}
          >
            Previous
          </Button>

          {!isLastQuestion ? (
            <Button
              onClick={() => setCurrentQIdx(Math.min(quiz.questions.length - 1, currentQIdx + 1))}
              className="flex-1"
            >
              Next
            </Button>
          ) : (
            <Button onClick={submitQuiz} disabled={submitting} className="flex-1">
              {submitting ? "Submitting..." : "Submit Quiz"}
            </Button>
          )}
        </div>

        {/* Question Navigator */}
        <div className="mt-8 p-4 bg-card border rounded">
          <p className="text-sm font-semibold mb-3">Navigate to Question:</p>
          <div className="grid grid-cols-10 gap-2">
            {quiz.questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQIdx(idx)}
                className={`w-8 h-8 rounded text-xs font-medium ${
                  idx === currentQIdx
                    ? "bg-primary text-primary-foreground"
                    : answers[quiz.questions[idx].id]?.length
                      ? "bg-green-100 text-green-800 border border-green-300"
                      : "border"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
