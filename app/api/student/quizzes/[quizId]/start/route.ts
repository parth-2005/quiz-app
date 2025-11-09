import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest, context: { params: any }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const params = await context.params
    const quizId = params.quizId as string

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId, status: "PUBLISHED" },
      include: { questions: { include: { options: true } } },
    })

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    // Check max attempts
    const attemptCount = await prisma.attempt.count({
      where: {
        quizId,
        studentId: (session.user as any).id,
        completedAt: { not: null },
      },
    })

    if (quiz.maxAttempts && attemptCount >= quiz.maxAttempts) {
      return NextResponse.json({ error: "Max attempts reached" }, { status: 403 })
    }

    const attempt = await prisma.attempt.create({
      data: {
        quizId,
        studentId: (session.user as any).id,
      },
    })

    // Shuffle questions if needed
    let questions = quiz.questions
    if (quiz.shuffleQuestions) {
      questions = questions.sort(() => Math.random() - 0.5)
    }

    // Shuffle options if needed
    if (quiz.shuffleOptions) {
      questions = questions.map((q) => ({
        ...q,
        options: q.options.sort(() => Math.random() - 0.5),
      }))
    }

    return NextResponse.json({
      attemptId: attempt.id,
      questions,
      timeLimit: quiz.timeLimit,
    })
  } catch (error) {
    console.error("Error starting quiz:", error)
    return NextResponse.json({ error: "Failed to start quiz" }, { status: 500 })
  }
}
