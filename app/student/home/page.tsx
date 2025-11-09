"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

interface Quiz {
  id: string
  title: string
  description: string
  teacher: { name: string }
  _count: { questions: number }
  attempts: Array<{ id: string; completedAt: string }>
}

interface QuizzesData {
  available: Quiz[]
  upcoming: Quiz[]
  completed: Quiz[]
}

export default function StudentHome() {
  const [quizzes, setQuizzes] = useState<QuizzesData>({ available: [], upcoming: [], completed: [] })
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { data: session } = useSession()

  useEffect(() => {
    fetchQuizzes()
  }, [])

  const fetchQuizzes = async () => {
    try {
      const res = await fetch("/api/student/quizzes")
      const data = await res.json()
      setQuizzes(data)
    } catch (error) {
      console.error("Error fetching quizzes:", error)
    } finally {
      setLoading(false)
    }
  }

  const QuizCard = ({ quiz }: { quiz: Quiz }) => (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{quiz.title}</CardTitle>
            <CardDescription>by {quiz.teacher.name}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{quiz.description || "No description"}</p>
        <p className="text-xs text-muted-foreground mb-4">{quiz._count.questions} questions</p>
        <Link href={`/student/quiz/${quiz.id}`}>
          <Button className="w-full">Start Quiz</Button>
        </Link>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Quiz Portal</h1>
          <div className="flex gap-4">
            <span className="text-sm text-muted-foreground">{session?.user?.name}</span>
            <Button variant="outline" onClick={() => signOut({ callbackUrl: "/student/auth" })}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <Tabs defaultValue="available" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="available">Available ({quizzes.available.length})</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming ({quizzes.upcoming.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({quizzes.completed.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="available" className="space-y-4">
              {quizzes.available.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">No available quizzes</CardContent>
                </Card>
              ) : (
                quizzes.available.map((quiz) => <QuizCard key={quiz.id} quiz={quiz} />)
              )}
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-4">
              {quizzes.upcoming.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">No upcoming quizzes</CardContent>
                </Card>
              ) : (
                quizzes.upcoming.map((quiz) => <QuizCard key={quiz.id} quiz={quiz} />)
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {quizzes.completed.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">No completed quizzes</CardContent>
                </Card>
              ) : (
                quizzes.completed.map((quiz) => <QuizCard key={quiz.id} quiz={quiz} />)
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  )
}
