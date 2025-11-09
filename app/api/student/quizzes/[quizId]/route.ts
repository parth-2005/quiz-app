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

    const params = await context.params
    const quizId = params.quizId as string

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId, status: "PUBLISHED" },
      include: {
        teacher: { select: { name: true } },
        questions: {
          include: { options: { select: { id: true, text: true } } },
        },
      },
    })

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    return NextResponse.json(quiz)
  } catch (error) {
    console.error("Error fetching quiz:", error)
    return NextResponse.json({ error: "Failed to fetch quiz" }, { status: 500 })
  }
}
