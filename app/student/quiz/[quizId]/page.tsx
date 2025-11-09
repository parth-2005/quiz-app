"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

interface Quiz {
  id: string
  title: string
  description: string
  timeLimit: number
  teacher: { name: string }
  questions: Array<{ id: string; text: string }>
}

export default function QuizPreview() {
  const params = useParams()
  const quizId = params.quizId as string
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchQuiz()
  }, [quizId])

  const fetchQuiz = async () => {
    try {
      const res = await fetch(`/api/student/quizzes/${quizId}`)
      const data = await res.json()
      setQuiz(data)
    } catch (error) {
      console.error("Error fetching quiz:", error)
    } finally {
      setLoading(false)
    }
  }

  const startQuiz = async () => {
    try {
      const res = await fetch(`/api/student/quizzes/${quizId}/start`, { method: "POST" })
      const data = await res.json()
      if (res.ok) {
        router.push(`/student/quiz/${quizId}/attempt?attemptId=${data.attemptId}`)
      }
    } catch (error) {
      console.error("Error starting quiz:", error)
    }
  }

  if (loading) return <div className="text-center py-8">Loading...</div>
  if (!quiz) return <div className="text-center py-8">Quiz not found</div>

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link href="/student/home" className="text-sm text-primary hover:underline mb-2 block">
            ← Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl mb-2">{quiz.title}</CardTitle>
            <p className="text-muted-foreground">By {quiz.teacher.name}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {quiz.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{quiz.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 py-4 border-t border-b">
              <div>
                <p className="text-2xl font-bold">{quiz.questions.length}</p>
                <p className="text-sm text-muted-foreground">Questions</p>
              </div>
              {quiz.timeLimit && (
                <div>
                  <p className="text-2xl font-bold">{quiz.timeLimit}</p>
                  <p className="text-sm text-muted-foreground">Minutes</p>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <h3 className="font-semibold mb-2">Instructions</h3>
              <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
                <li>Read each question carefully</li>
                <li>Select the correct answer(s)</li>
                {quiz.timeLimit && <li>You have {quiz.timeLimit} minutes to complete</li>}
                <li>Click Submit when finished</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Button onClick={startQuiz} className="flex-1">
                Start Quiz
              </Button>
              <Link href="/student/home" className="flex-1">
                <Button variant="outline" className="w-full bg-transparent">
                  Cancel
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
