"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

interface Attempt {
  id: string
  score: number
  student: {
    name: string
    email: string
    rollNo: string
  }
  completedAt: string
}

export default function QuizResults() {
  const params = useParams()
  const quizId = params.quizId as string
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResults()
  }, [quizId])

  const fetchResults = async () => {
    try {
      const res = await fetch(`/api/teacher/quizzes/${quizId}/results`)
      const data = await res.json()
      setResults(data)
    } catch (error) {
      console.error("Error fetching results:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <Link href="/teacher/dashboard" className="text-sm text-primary hover:underline mb-2 block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold">Quiz Results</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{results?.totalAttempts || 0}</p>
              <p className="text-muted-foreground">Total Attempts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{results?.avgScore || 0}%</p>
              <p className="text-muted-foreground">Average Score</p>
            </CardContent>
          </Card>
        </div>

        {/* Attempts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Student Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            {(results?.attempts?.length ?? 0) === 0 ? (
              <p className="text-muted-foreground">No attempts yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-2 px-4">Student</th>
                      <th className="text-left py-2 px-4">Email</th>
                      <th className="text-left py-2 px-4">Roll No</th>
                      <th className="text-right py-2 px-4">Score</th>
                      <th className="text-left py-2 px-4">Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results?.attempts.map((attempt: Attempt) => (
                      <tr key={attempt.id} className="border-b">
                        <td className="py-2 px-4">{attempt.student.name}</td>
                        <td className="py-2 px-4">{attempt.student.email}</td>
                        <td className="py-2 px-4">{attempt.student.rollNo || "-"}</td>
                        <td className="text-right py-2 px-4">{attempt.score}</td>
                        <td className="py-2 px-4">{new Date(attempt.completedAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
