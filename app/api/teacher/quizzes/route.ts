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
    const { title, description, timeLimit, maxAttempts, shuffleQuestions, shuffleOptions } = body

    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        timeLimit,
        maxAttempts: maxAttempts || 1,
        shuffleQuestions: shuffleQuestions || false,
        shuffleOptions: shuffleOptions || false,
        teacherId: (session.user as any).id,
      },
    })

    return NextResponse.json({ success: true, quizId: quiz.id })
  } catch (error) {
    console.error("Error creating quiz:", error)
    return NextResponse.json({ error: "Failed to create quiz" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const quizzes = await prisma.quiz.findMany({
      where: {
        teacherId: (session.user as any).id,
      },
      include: {
        _count: {
          select: { questions: true, attempts: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(quizzes)
  } catch (error) {
    console.error("Error fetching quizzes:", error)
    return NextResponse.json({ error: "Failed to fetch quizzes" }, { status: 500 })
  }
}
