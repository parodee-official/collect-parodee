'use client'

type Props = {
  activeSlug: string
}

export default function CollectAboutClient({ activeSlug }: Props) {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <h1 className="text-3xl font-bold mb-4">
        About {activeSlug}
      </h1>

      <p className="max-w-3xl text-sm text-zinc-300 leading-relaxed">
        This collection represents the identity and lore of {activeSlug}.
        Built with on-chain philosophy and strong visual narrative.
      </p>
    </main>
  )
}
