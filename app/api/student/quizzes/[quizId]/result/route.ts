import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest, context: { params: any }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const attemptId = req.nextUrl.searchParams.get("attemptId")

    if (!attemptId) {
      return NextResponse.json({ error: "Missing attemptId" }, { status: 400 })
    }

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
    })

    if (!attempt || attempt.studentId !== (session.user as any).id) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 })
    }

    const params = await context.params
    const quizId = params.quizId as string

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: { include: { options: true } } },
    })

    const timeTaken = attempt.completedAt
      ? Math.floor((attempt.completedAt.getTime() - attempt.startedAt.getTime()) / 1000)
      : 0

    return NextResponse.json({
      score: attempt.score,
      total: quiz?.questions.length || 0,
      timeTaken,
      answers: attempt.answers,
    })
  } catch (error) {
    console.error("Error fetching result:", error)
    return NextResponse.json({ error: "Failed to fetch result" }, { status: 500 })
  }
}
