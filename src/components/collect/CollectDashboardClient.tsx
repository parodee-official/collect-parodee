'use client'

type Props = {
  activeSlug: string
}

export default function CollectDashboardClient({ activeSlug }: Props) {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <h1 className="text-3xl font-bold mb-4">
        {activeSlug} Dashboard
      </h1>

      <div className="text-sm text-zinc-400">
        Stats, holders, volume, activity — coming soon.
      </div>
    </main>
  )
}
