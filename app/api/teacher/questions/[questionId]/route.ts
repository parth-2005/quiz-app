import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(req: NextRequest, { params }: { params: { questionId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { text, imageUrl, options } = body

    const question = await prisma.question.findUnique({
      where: { id: params.questionId },
      include: { quiz: true },
    })

    if (!question || question.quiz.teacherId !== (session.user as any).id) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    // Delete old options and create new ones
    await prisma.option.deleteMany({ where: { questionId: params.questionId } })

    const updated = await prisma.question.update({
      where: { id: params.questionId },
      data: {
        text: text || question.text,
        imageUrl: imageUrl ?? question.imageUrl,
        options: {
          create: options,
        },
      },
      include: { options: true },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating question:", error)
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { questionId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const question = await prisma.question.findUnique({
      where: { id: params.questionId },
      include: { quiz: true },
    })

    if (!question || question.quiz.teacherId !== (session.user as any).id) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    await prisma.question.delete({ where: { id: params.questionId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting question:", error)
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 })
  }
}
