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

    const body = await req.json()
    const { attemptId, answers } = body

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
    })

    if (!attempt || attempt.studentId !== (session.user as any).id) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 })
    }

    // Get quiz questions and correct answers
    const params = await context.params
    const quizId = params.quizId as string

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: { options: true },
        },
      },
    })

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    // Calculate score
    let score = 0
    const answersWithCorrect = {}

    for (const question of quiz.questions) {
      const studentAnswers = answers[question.id] || []
      const correctAnswers = question.options.filter((o) => o.isCorrect).map((o) => o.id)

      const isCorrect = JSON.stringify(studentAnswers.sort()) === JSON.stringify(correctAnswers.sort())
      ;(answersWithCorrect as any)[question.id] = {
        studentAnswers,
        correctAnswers,
        isCorrect,
      }

      if (isCorrect) score++
    }

    // Update attempt
    const updated = await prisma.attempt.update({
      where: { id: attemptId },
      data: {
        score,
        completedAt: new Date(),
        answers: answersWithCorrect,
      },
    })

    return NextResponse.json({
      success: true,
      score,
      total: quiz.questions.length,
      attemptId: updated.id,
    })
  } catch (error) {
    console.error("Error submitting quiz:", error)
    return NextResponse.json({ error: "Failed to submit quiz" }, { status: 500 })
  }
}
