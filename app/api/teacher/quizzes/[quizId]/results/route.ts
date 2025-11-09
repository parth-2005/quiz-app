import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest, context: { params: any }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

  const params = await context.params
  const quizId = params.quizId as string

  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } })

    if (!quiz || quiz.teacherId !== (session.user as any).id) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    const attempts = await prisma.attempt.findMany({
      where: { quizId },
      include: {
        student: { select: { id: true, name: true, email: true, rollNo: true } },
      },
      orderBy: { completedAt: "desc" },
    })

    const totalAttempts = attempts.length
    const avgScore =
      attempts.length > 0 ? Math.round(attempts.reduce((sum, a) => sum + (a.score || 0), 0) / attempts.length) : 0

    return NextResponse.json({
      totalAttempts,
      avgScore,
      attempts,
    })
  } catch (error) {
    console.error("Error fetching results:", error)
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 })
  }
}
