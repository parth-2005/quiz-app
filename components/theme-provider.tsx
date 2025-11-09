'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Disable automatic `color-scheme` style changes to avoid a server/client
  // mismatch on the root <html> element. Individual components can still
  // read/set the theme via the hook.
  return (
    <NextThemesProvider {...props} enableColorScheme={false}>
      {children}
    </NextThemesProvider>
  )
}
