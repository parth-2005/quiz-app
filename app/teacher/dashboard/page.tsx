"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

interface Quiz {
  id: string
  title: string
  status: string
  _count: { questions: number; attempts: number }
}

export default function TeacherDashboard() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { data: session } = useSession()

  useEffect(() => {
    fetchQuizzes()
  }, [])

  const fetchQuizzes = async () => {
    try {
      const res = await fetch("/api/teacher/quizzes")
      const data = await res.json()
      setQuizzes(data)
    } catch (error) {
      console.error("Error fetching quizzes:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (quizId: string) => {
    if (confirm("Are you sure?")) {
      try {
        await fetch(`/api/teacher/quizzes/${quizId}`, { method: "DELETE" })
        setQuizzes(quizzes.filter((q) => q.id !== quizId))
      } catch (error) {
        console.error("Error deleting quiz:", error)
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
          <div className="flex gap-4">
            <span className="text-sm text-muted-foreground">{session?.user?.name}</span>
            <Button variant="outline" onClick={() => signOut({ callbackUrl: "/teacher/login" })}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Your Quizzes</h2>
            <p className="text-muted-foreground">Create and manage your quizzes</p>
          </div>
          <Link href="/teacher/quizzes/create">
            <Button>Create New Quiz</Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : quizzes.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground mb-4">No quizzes yet</p>
              <Link href="/teacher/quizzes/create">
                <Button>Create Your First Quiz</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {quizzes.map((quiz) => (
              <Card key={quiz.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{quiz.title}</CardTitle>
                      <CardDescription>
                        {quiz._count.questions} questions • {quiz._count.attempts} attempts
                      </CardDescription>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        quiz.status === "PUBLISHED" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {quiz.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Link href={`/teacher/quizzes/${quiz.id}`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/teacher/quizzes/${quiz.id}/results`}>
                      <Button variant="outline" size="sm">
                        Results
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(quiz.id)}
                      className="text-destructive"
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
