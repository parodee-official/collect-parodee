import { ReactNode } from "react"

export default function CollectLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <main className="min-h-screen px-4 md:px-0">
      {children}
    </main>
  )
}
