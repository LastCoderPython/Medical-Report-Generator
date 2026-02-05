import { TamboWrapper } from './components/TamboWrapper'
import { ThemeProvider } from './components/ThemeProvider'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <TamboWrapper>
            {children}
          </TamboWrapper>
        </ThemeProvider>
      </body>
    </html>
  )
}
