import "./globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "ChoreFlow",
  description: "A welcoming chores checklist with automation ideas.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
