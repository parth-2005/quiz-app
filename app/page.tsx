import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold">Quiz Platform</h1>
          <p className="text-muted-foreground mt-2">Create and take quizzes with ease</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>For Teachers</CardTitle>
              <CardDescription>Create and manage quizzes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Design engaging quizzes with multiple choice questions, set time limits, and view detailed student
                results.
              </p>
              <Link href="/teacher/login">
                <Button className="w-full">Teacher Login</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>For Students</CardTitle>
              <CardDescription>Attempt quizzes and view results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Access assigned quizzes, attempt them within the time limit, and view your scores and performance
                analytics.
              </p>
              <Link href="/student/auth">
                <Button className="w-full">Student Login</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
