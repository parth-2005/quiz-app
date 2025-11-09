"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Result {
  score: number
  total: number
  timeTaken: number
}

export default function QuizResult() {
  const params = useParams()
  const searchParams = useSearchParams()
  const quizId = params.quizId as string
  const attemptId = searchParams.get("attemptId")

  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResult()
  }, [quizId, attemptId])

  const fetchResult = async () => {
    try {
      if (!attemptId) return
      const res = await fetch(`/api/student/quizzes/${quizId}/result?attemptId=${attemptId}`)
      const data = await res.json()
      setResult(data)
    } catch (error) {
      console.error("Error fetching result:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center py-8">Loading...</div>
  if (!result) return <div className="text-center py-8">Result not found</div>

  const percentage = Math.round((result.score / result.total) * 100)
  const minutes = Math.floor(result.timeTaken / 60)
  const seconds = result.timeTaken % 60

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl mb-2">Quiz Completed!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-6xl font-bold text-primary mb-2">{percentage}%</div>
            <p className="text-xl font-semibold mb-1">
              Score: {result.score}/{result.total}
            </p>
            <p className="text-muted-foreground">
              Time taken: {minutes}m {seconds}s
            </p>
          </div>

          <div className="bg-muted p-4 rounded text-center">
            {percentage >= 80 && <p className="text-green-600 font-semibold">Excellent!</p>}
            {percentage >= 60 && percentage < 80 && <p className="text-blue-600 font-semibold">Good job!</p>}
            {percentage < 60 && <p className="text-yellow-600 font-semibold">Keep practicing!</p>}
          </div>

          <Link href="/student/home" className="block">
            <Button className="w-full">Back to Home</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
