import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "teacher-credentials",
      name: "Teacher",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log("[Quiz App] Teacher auth attempt:", credentials?.email)

          if (!credentials?.email || !credentials?.password) {
            throw new Error("Missing credentials")
          }

          const teacher = await prisma.teacher.findUnique({
            where: { email: credentials.email },
          })

          if (!teacher) {
            throw new Error("Teacher not found")
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, teacher.password)
          console.log("[Quiz App] Password valid:", isPasswordValid)
          if (!isPasswordValid) {
            throw new Error("Invalid password")
          }

          console.log("[Quiz App] Teacher auth successful:", teacher.id)
          return {
            id: teacher.id,
            email: teacher.email,
            name: teacher.name,
            role: "teacher",
          } as any
        } catch (error) {
          console.error("[Quiz App] Teacher auth error:", error)
          throw error
        }
      },
    }),
    CredentialsProvider({
      id: "student-credentials",
      name: "Student",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log("[Quiz App] Student auth attempt:", credentials?.email)

          if (!credentials?.email || !credentials?.password) {
            throw new Error("Missing credentials")
          }

          const student = await prisma.student.findUnique({
            where: { email: credentials.email },
          })

          if (!student) {
            throw new Error("Student not found")
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, student.password)

          if (!isPasswordValid) {
            throw new Error("Invalid password")
          }

          console.log("[Quiz App] Student auth successful:", student.id)
          return {
            id: student.id,
            email: student.email,
            name: student.name,
            role: "student",
          } as any
        } catch (error) {
          console.error("[Quiz App] Student auth error:", error)
          throw error
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.role = token.role
        session.user.id = token.id
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
}
