type Collection = {
  id: number
  title: string
  description: string
  items: string[]
}

function CollectionCard({ data }: { data: Collection }) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6 rounded-xl bg-zinc-900 p-6 border border-zinc-800 hover:border-zinc-600 transition">

      {/* LEFT */}
      <div className="flex-1">
        <h3 className="text-lg font-semibold mb-2">
          {data.title}
        </h3>

        <p className="text-sm text-zinc-400 mb-4 max-w-md">
          {data.description}
        </p>

        <button className="rounded-md bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-300 transition">
          DISCOVER COLLECTION
        </button>
      </div>

      {/* RIGHT - ITEMS GRID */}
      <div className="grid grid-cols-2 gap-3">
        {data.items.map((item, i) => (
          <div
            key={i}
            className="h-16 w-16 rounded-lg bg-zinc-800 overflow-hidden flex items-center justify-center"
          >
            {/* fallback kalau image belum ada */}
            <span className="text-xs text-zinc-400">
              NFT
            </span>

            {/* kalau mau aktifin image */}
            {/* <img src={item} alt="NFT" className="h-full w-full object-cover" /> */}
          </div>
        ))}
      </div>

    </div>
  )
}
