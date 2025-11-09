import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password, rollNo } = body

  console.log("[Quiz App] Student registration attempt:", email)

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const existing = await prisma.student.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const student = await prisma.student.create({
      data: {
        name,
        email,
        password: hashedPassword,
        rollNo: rollNo || null,
      },
    })

  console.log("[Quiz App] Student registration successful:", student.id)
    return NextResponse.json({ success: true, studentId: student.id })
  } catch (error) {
  console.error("[Quiz App] Registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
