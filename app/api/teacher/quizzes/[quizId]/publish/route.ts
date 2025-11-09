import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest, context: { params: any }) {
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

    const updated = await prisma.quiz.update({
      where: { id: quizId },
      data: { status: "PUBLISHED" },
    })

    return NextResponse.json({ success: true, quiz: updated })
  } catch (error) {
    console.error("Error publishing quiz:", error)
    return NextResponse.json({ error: "Failed to publish quiz" }, { status: 500 })
  }
}
