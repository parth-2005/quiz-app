import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { quizId, text, imageUrl, options } = body

    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } })

    if (!quiz || quiz.teacherId !== (session.user as any).id) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    const question = await prisma.question.create({
      data: {
        quizId,
        text,
        imageUrl,
        options: {
          create: options,
        },
      },
      include: { options: true },
    })

    return NextResponse.json(question)
  } catch (error) {
    console.error("Error creating question:", error)
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 })
  }
}
