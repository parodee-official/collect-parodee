type Collection = {
  id: number
  title: string
  description: string
  items: string[]
}

const collections: Collection[] = [
  {
    id: 1,
    title: 'Parodee : Pixel Chaos',
    description:
      'A curated chaos of pixel characters, each one crafted with unique personality and on-chain identity.',
    items: ['1', '2', '3', '4'],
  },
  {
    id: 2,
    title: 'Parodee : First Gen',
    description:
      'The genesis collection of Parodee. Original characters, original story, pure on-chain culture.',
    items: ['1', '2', '3', '4'],
  },
]

export default function Page() {
  return (
    <main className="min-h-screen bg-brand-main text-white">
      <div className="mx-auto max-w-5xl px-4 py-16">

        {/* HERO */}
        <section className="mb-20">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Collect The Most Finest <br />
            <span className="text-zinc-300">Art On The Space</span>
          </h1>
        </section>

        {/* COLLECTION TITLE */}
        <section className="mb-10">
          <h1 className="text-center text-zinc-500 text-lg md:text-4xl font-medium">
            Collection
          </h1>
        </section>

        {/* COLLECTION CARDS (DINAMIS) */}
        <section className="space-y-8">
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="
                flex flex-col lg:flex-row
                gap-12
                rounded-3xl
                bg-[#292929]
                p-8
                px-12
                border-4 border-black
                shadow-cartoonTwo
              "
            >
              {/* LEFT */}
              <div className="flex flex-1 flex-col justify-center">
                <h3 className="text-3xl md:text-4xl font-extrabold mb-4">
                  {collection.title}
                </h3>

                <p className="text-sm leading-relaxed text-zinc-300 max-w-xl mb-8">
                  {collection.description}
                </p>

                <button
                  className="
                    w-full
                    rounded-xl
                    bg-brand-yellow
                    px-6 py-3
                    font-bold
                    text-black
                    border-4 border-black
                    hover:bg-yellow-300
                    transition
                  "
                >
                  DISCOVER COLLECTION
                </button>
              </div>

              {/* RIGHT - NFT GRID */}
              <div className="grid grid-cols-2 gap-4">
                {collection.items.map((_, i) => (
                  <div
                    key={i}
                    className="
                      h-28 w-28 md:h-36 md:w-36
                      rounded-2xl
                      bg-zinc-700
                      border-4 border-black
                      flex items-center justify-center
                      text-xs text-zinc-300
                    "
                  >
                    NFT
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>


      </div>
    </main>
  )
}

// import { redirect } from 'next/navigation';

// export default function Home() {
//   // Langsung arahkan ke /collect
//   redirect('/collect');
// }
