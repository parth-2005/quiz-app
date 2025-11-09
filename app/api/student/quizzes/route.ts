import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()

    const quizzes = await prisma.quiz.findMany({
      where: {
        status: "PUBLISHED",
      },
      include: {
        teacher: { select: { name: true } },
        _count: { select: { questions: true } },
        attempts: {
          where: { studentId: (session.user as any).id },
          select: { id: true, score: true, completedAt: true },
        },
      },
    })

    // Categorize quizzes
    const categorized = {
      available: quizzes.filter((q) => !q.startAt || q.startAt <= now),
      upcoming: quizzes.filter((q) => q.startAt && q.startAt > now),
      completed: quizzes.filter((q) => q.attempts.some((a) => a.completedAt)),
    }

    return NextResponse.json(categorized)
  } catch (error) {
    console.error("Error fetching quizzes:", error)
    return NextResponse.json({ error: "Failed to fetch quizzes" }, { status: 500 })
  }
}
