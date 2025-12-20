import Link from "next/link";
import pixelchaos from "@/data/pixelchaos.json";
import hyperevm from "@/data/hyperevm.json";

type CollectionItem = {
  identifier: string
  image_url: string
}

type Collection = {
  id: number
  title: string
  slug: string
  description: string
  items: CollectionItem[]
}

const pixelChaos = {
  slug: "parodee-pixel-chaos",
  title: "Parodee : Pixel Chaos",
  description:
    "A curated chaos of pixel characters, each one crafted with unique personality and on-chain identity.",
  items: pixelchaos,
}

const hyperEvm = {
  slug: "parodee-hyperevm",
  title: "Parodee : HyperEVM",
  description:
    "The genesis collection of Parodee. Original characters, original story, pure on-chain culture.",
  items: hyperevm,
}

function CollectionSection({
  title,
  description,
  slug,
  items,
}: {
  title: string
  description: string
  slug: string
  items: CollectionItem[]
}) {
  return (
    <section
      className="
        flex flex-col-reverse md:flex-row
        items-center
        gap-6 md:gap-10
        rounded-3xl
        bg-[#292929]
        p-8 md:px-16
        border-4 border-black
        shadow-cartoonTwo
        group
      "
    >
      {/* LEFT */}
      <div className="flex-1 text-center md:text-left
      group-hover:scale-[1.03]
      ">
        <h3 className="text-2xl md:text-4xl font-extrabold mb-3">
          {title}
        </h3>

        <p className="text-sm md:text-[16px] text-zinc-300 leading-relaxed max-w-xl mx-auto md:mx-0 mb-6">
          {description}
        </p>

        <Link href={`/collect/items?slug=${slug}`}>
          <button
            className="
              inline-flex
              w-full
              rounded-xl
              bg-brand-yellow
               px-4 md:px-6 py-2 md:py-3
              font-black
              text-black
              border-4 border-black
              hover:bg-yellow-300
              transition
              justify-center
               hover:-translate-x-0.5 hover:-translate-y-0.5
            "
          >
            DISCOVER COLLECTION
          </button>
        </Link>
      </div>

      {/* RIGHT */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 shrink-0
        group-hover:scale-[1.03]
        ">
        {items.slice(0, 4).map((item) => (
          <div
            key={item.identifier}
            className="
              h-24 w-24
              md:h-36 md:w-36
              rounded-2xl
              overflow-hidden
              bg-zinc-700
              border-4 border-black
              shadow-[3px_3px_0_rgba(0,0,0,1)]
              md:shadow-[6px_6px_0_rgba(0,0,0,1)]
              hover:translate-x-1 hover:translate-y-1 hover:shadow-none
            "
          >
            <img
              src={item.image_url}
              alt={item.identifier}
              className="h-full w-full object-cover image-pixelated "
            />
          </div>
        ))}
      </div>
    </section>
  )
}

export default function Page() {
  return (
    <main className="min-h-screen bg-brand-main text-white">
      <div className="mx-auto max-w-5xl px-4 py-14 md:py-20">

        {/* HERO */}
        <section className="mb-16 md:mb-24">
          <h1 className="text-3xl md:text-5xl xl:text-6xl font-extrabold leading-tight tracking-tight">
            Collect The Most Finest <br />
            <span className="text-zinc-300">Art On The Space</span>
          </h1>
        </section>

        {/* COLLECTION TITLE */}
        <section className="mb-8 md:mb-14">
          <h2 className="text-center text-zinc-600 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter ">
            Collection
          </h2>
        </section>

        {/* COLLECTIONS */}
        <section className="space-y-6 md:space-y-10">
          <CollectionSection {...pixelChaos} />
          <CollectionSection {...hyperEvm} />
        </section>

      </div>
    </main>
  )
}
