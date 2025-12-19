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
      <div className="mx-auto max-w-5xl px-4 py-14 md:py-20">

        {/* HERO */}
        <section className="mb-16 md:mb-24">
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight">
            Collect The Most Finest <br />
            <span className="text-zinc-300">Art On The Space</span>
          </h1>
        </section>

        {/* COLLECTION TITLE */}
        <section className="mb-8 md:mb-14">
          <h2 className="text-center text-zinc-600 text-2xl md:text-4xl font-semibold tracking-wide">
            Collection
          </h2>
        </section>

        {/* COLLECTION CARDS */}
        <section className="space-y-6 md:space-y-10">
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="
                flex flex-col-reverse md:flex-row
                items-center
                gap-6 md:gap-10
                rounded-3xl
                bg-[#292929]
                p-5 md:p-8
                border-4 border-black
                shadow-cartoonTwo
              "
            >
              {/* LEFT - TEXT */}
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl md:text-4xl font-extrabold mb-3">
                  {collection.title}
                </h3>

                <p className="text-sm text-zinc-300 leading-relaxed max-w-xl mx-auto md:mx-0 mb-6">
                  {collection.description}
                </p>

                <button
                  className="
                    inline-flex
                    w-full
                    rounded-xl
                    bg-brand-yellow
                    px-6 py-3
                    font-bold
                    text-black
                    border-4 border-black
                    hover:bg-yellow-300
                    transition

                    justify-center
                  "
                >
                  DISCOVER COLLECTION
                </button>
              </div>

              {/* RIGHT - NFT GRID */}
              <div className="grid grid-cols-2 gap-3 md:gap-4 shrink-0">
                {collection.items.map((_, i) => (
                  <div
                    key={i}
                    className="
                      h-24 w-24
                      md:h-36 md:w-36
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
