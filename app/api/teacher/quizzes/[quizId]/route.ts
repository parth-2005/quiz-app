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

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: { options: true },
        },
      },
    })

    if (!quiz || quiz.teacherId !== (session.user as any).id) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    return NextResponse.json(quiz)
  } catch (error) {
    console.error("Error fetching quiz:", error)
    return NextResponse.json({ error: "Failed to fetch quiz" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, context: { params: any }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { title, description, timeLimit, shuffleQuestions, shuffleOptions } = body

  const params = await context.params
  const quizId = params.quizId as string

  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } })

    if (!quiz || quiz.teacherId !== (session.user as any).id) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    const updated = await prisma.quiz.update({
      where: { id: quizId },
      data: {
        title: title || quiz.title,
        description: description ?? quiz.description,
        timeLimit: timeLimit ?? quiz.timeLimit,
        shuffleQuestions: shuffleQuestions ?? quiz.shuffleQuestions,
        shuffleOptions: shuffleOptions ?? quiz.shuffleOptions,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating quiz:", error)
    return NextResponse.json({ error: "Failed to update quiz" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, context: { params: any }) {
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

  await prisma.quiz.delete({ where: { id: quizId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting quiz:", error)
    return NextResponse.json({ error: "Failed to delete quiz" }, { status: 500 })
  }
}
