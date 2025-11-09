"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

interface Question {
  id: string
  text: string
  options: Array<{ id: string; text: string; isCorrect: boolean }>
}

interface Quiz {
  id: string
  title: string
  description: string
  status: string
  questions: Question[]
}

export default function EditQuiz() {
  const params = useParams()
  const quizId = params.quizId as string
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [newQuestion, setNewQuestion] = useState("")
  const [options, setOptions] = useState([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ])
  const router = useRouter()

  useEffect(() => {
    fetchQuiz()
  }, [quizId])

  const fetchQuiz = async () => {
    try {
      const res = await fetch(`/api/teacher/quizzes/${quizId}`)
      const data = await res.json()

      // Handle API errors (unauthorized / not found)
      if (!res.ok) {
        if (res.status === 401) {
          // Not authenticated as teacher — send to login
          router.push('/teacher/login')
          return
        }
        console.error('Error fetching quiz:', data?.error || data)
        setQuiz({ id: quizId, title: 'Unknown quiz', description: '', status: 'DRAFT', questions: [] })
        return
      }

      // Normalize data: ensure `questions` is always an array to avoid runtime
      // errors when rendering (some responses may omit the field).
      setQuiz({ ...(data || {}), questions: data?.questions ?? [] })
    } catch (error) {
      console.error("Error fetching quiz:", error)
    } finally {
      setLoading(false)
    }
  }

  const addQuestion = async () => {
    if (!newQuestion.trim() || options.some((o) => !o.text.trim())) {
      alert("Please fill all fields")
      return
    }

    if (!options.some((o) => o.isCorrect)) {
      alert("Please mark at least one correct answer")
      return
    }

    try {
      const res = await fetch("/api/teacher/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId,
          text: newQuestion,
          options: options.map((o) => ({
            text: o.text,
            isCorrect: o.isCorrect,
          })),
        }),
      })

      if (res.ok) {
        setNewQuestion("")
        setOptions([
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ])
        fetchQuiz()
      }
    } catch (error) {
      console.error("Error adding question:", error)
    }
  }

  const deleteQuestion = async (questionId: string) => {
    if (confirm("Delete this question?")) {
      try {
        await fetch(`/api/teacher/questions/${questionId}`, { method: "DELETE" })
        fetchQuiz()
      } catch (error) {
        console.error("Error deleting question:", error)
      }
    }
  }

  const publishQuiz = async () => {
    if (!((quiz?.questions?.length) ?? 0)) {
      alert("Add at least one question before publishing")
      return
    }

    try {
      const res = await fetch(`/api/teacher/quizzes/${quizId}/publish`, { method: "POST" })
      if (res.ok) {
        fetchQuiz()
      }
    } catch (error) {
      console.error("Error publishing quiz:", error)
    }
  }

  if (loading) return <div className="text-center py-8">Loading...</div>
  if (!quiz) return <div className="text-center py-8">Quiz not found</div>

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <Link href="/teacher/dashboard" className="text-sm text-primary hover:underline mb-2 block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold">{quiz.title}</h1>
          </div>
          {quiz.status === "DRAFT" && <Button onClick={publishQuiz}>Publish Quiz</Button>}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Add Question Section */}
        {quiz.status === "DRAFT" ? (
          <Card>
            <CardHeader>
              <CardTitle>Add Question</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Question Text</label>
                <Input
                  placeholder="Enter question"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium block">Options</label>
                {options.map((option, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input
                      placeholder={`Option ${idx + 1}`}
                      value={option.text}
                      onChange={(e) => {
                        const newOptions = [...options]
                        newOptions[idx].text = e.target.value
                        setOptions(newOptions)
                      }}
                    />
                    <input
                      type="checkbox"
                      checked={option.isCorrect}
                      onChange={(e) => {
                        const newOptions = [...options]
                        newOptions[idx].isCorrect = e.target.checked
                        setOptions(newOptions)
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-xs text-muted-foreground">Correct</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button onClick={() => setOptions([{ text: "", isCorrect: false }, { text: "", isCorrect: false }])}>
                  Reset Options
                </Button>
                <Button onClick={() => setOptions([...options, { text: "", isCorrect: false }])} variant="outline">
                  Add Option
                </Button>
                <Button onClick={addQuestion} variant="default">
                  Add Question
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-6">
              <p className="text-sm text-muted-foreground">
                Questions can only be added while the quiz is in <strong>DRAFT</strong> status. This quiz is currently{' '}
                <strong>{quiz.status}</strong>. If you need to add questions, unpublish or create a new draft.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Questions List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Questions ({quiz.questions?.length ?? 0})</h2>
            {(quiz.questions?.length ?? 0) === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">No questions added yet</CardContent>
            </Card>
          ) : (
            quiz.questions.map((question, idx) => (
              <Card key={question.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <p className="font-medium">
                      Q{idx + 1}. {question.text}
                    </p>
                    {quiz.status === "DRAFT" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteQuestion(question.id)}
                        className="text-destructive"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {question.options.map((option, oIdx) => (
                      <div key={option.id} className="flex items-center gap-2 text-sm">
                        <input type="radio" disabled checked={option.isCorrect} className="w-4 h-4" />
                        <span>{option.text}</span>
                        {option.isCorrect && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Correct</span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
