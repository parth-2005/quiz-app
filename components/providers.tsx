"use client"

import * as React from "react"
import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "./theme-provider"

interface ProvidersProps {
  children: React.ReactNode
  session?: any
}

export default function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider attribute="class">{children}</ThemeProvider>
    </SessionProvider>
  )
}
