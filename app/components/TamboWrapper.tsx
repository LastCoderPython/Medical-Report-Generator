'use client'

import { TamboProvider } from '@tambo-ai/react'
import { ReactNode } from 'react'

export function TamboWrapper({ children }: { children: ReactNode }) {
  return (
    <TamboProvider
      apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
    >
      {children}
    </TamboProvider>
  )
}
