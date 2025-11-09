"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function CreateQuiz() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [timeLimit, setTimeLimit] = useState("")
  const [maxAttempts, setMaxAttempts] = useState("1")
  const [shuffleQuestions, setShuffleQuestions] = useState(false)
  const [shuffleOptions, setShuffleOptions] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/teacher/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          timeLimit: timeLimit ? Number.parseInt(timeLimit) : null,
          maxAttempts: Number.parseInt(maxAttempts),
          shuffleQuestions,
          shuffleOptions,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        router.push(`/teacher/quizzes/${data.quizId}`)
      }
    } catch (error) {
      console.error("Error creating quiz:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/teacher/dashboard" className="text-sm text-primary hover:underline mb-4 block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold">Create New Quiz</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Quiz Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Quiz Title
                </label>
                <Input
                  id="title"
                  placeholder="e.g., Basic Algebra Quiz"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description (Optional)
                </label>
                <Input
                  id="description"
                  placeholder="Brief description of the quiz"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="timelimit" className="text-sm font-medium">
                    Time Limit (minutes, Optional)
                  </label>
                  <Input
                    id="timelimit"
                    type="number"
                    placeholder="30"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="maxattempts" className="text-sm font-medium">
                    Max Attempts
                  </label>
                  <Input
                    id="maxattempts"
                    type="number"
                    value={maxAttempts}
                    onChange={(e) => setMaxAttempts(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    id="shuffle-questions"
                    type="checkbox"
                    checked={shuffleQuestions}
                    onChange={(e) => setShuffleQuestions(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="shuffle-questions" className="text-sm">
                    Shuffle Questions
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="shuffle-options"
                    type="checkbox"
                    checked={shuffleOptions}
                    onChange={(e) => setShuffleOptions(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="shuffle-options" className="text-sm">
                    Shuffle Options
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading || !title}>
                  {loading ? "Creating..." : "Create Quiz"}
                </Button>
                <Link href="/teacher/dashboard">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
