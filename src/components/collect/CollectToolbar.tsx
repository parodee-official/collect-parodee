"use client";

// Definisikan tipe bentuk tampilan
export type ViewShape = "square" | "circle";

type CollectToolbarProps = {
  search: string;
  onSearchChange: (v: string) => void;
  onOpenFilter?: () => void;

  // Prop untuk mengatur bentuk grid (Tampilan)
  viewShape: ViewShape;
  onViewShapeChange: (shape: ViewShape) => void;

  // Prop untuk membuka modal sorting (Logika Data)
  onOpenSortMenu?: () => void;
};

export default function CollectToolbar({
  search,
  onSearchChange,
  onOpenFilter,
  viewShape,           // Menerima state bentuk saat ini
  onViewShapeChange,   // Fungsi ubah bentuk
  onOpenSortMenu,      // Fungsi buka modal sort
}: CollectToolbarProps) {

  return (
    <div className="mb-6 md:mb-10 flex items-center gap-2 sm:gap-5">

      {/* Filter icon – mobile only */}
      <button
        type="button"
        onClick={() => onOpenFilter?.()}
        className="flex h-9 w-9 flex-none items-center justify-center rounded-lg border-[3px] border-black bg-white shadow-[4px_4px_0_rgba(0,0,0,1)] md:hidden active:translate-x-1 active:translate-y-1 active:shadow-none"
        aria-label="Open filters"
      >
        <div className="flex flex-col gap-[3px]">
          <span className="block h-[2px] w-5 bg-black" />
          <span className="block h-[2px] w-3 bg-black" />
          <span className="block h-[2px] w-4 bg-black" />
        </div>
      </button>

      {/* Search bar
          PERUBAHAN UTAMA:
          1. min-w-[200px] diubah jadi min-w-0 (agar bisa mengecil di HP kecil).
          2. Padding dikurangi sedikit di mobile (px-2).
      */}
      <div className="w-full flex-1 min-w-0">
        <div className="flex items-center rounded-[20px] border-[3px] md:border-[4px] border-black bg-white px-2 py-1 sm:px-4 md:py-2 shadow-[4px_4px_0_rgba(0,0,0,1)] md:shadow-cartoon hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform">
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search..."
            className="mr-1 sm:mr-2 flex-1 border-none bg-transparent text-xs sm:text-sm outline-none placeholder:text-gray-400 min-w-0"
          />
          <button
            type="button"
            className="flex h-6 md:h-7 w-6 md:w-7 flex-none items-center justify-center rounded-full border-2 border-black shadow-[2px_2px_0_rgba(0,0,0,1)]"
          >
            <img
                src="/icon/arrow-next.svg"
                alt="arrow"
                className="h-3 w-3 sm:h-4 sm:w-4"
              />
          </button>
        </div>
      </div>

      {/* --- BUTTONS AREA ---
          PERUBAHAN:
          1. gap-2 dikurangi jadi gap-1.5 di mobile biar lebih rapat.
          2. ml-2 dikurangi jadi ml-1 di mobile.
      */}
      <div className="md:ml-3 flex flex-none items-center gap-1 sm:gap-3 pt-1 sm:pt-0">

        {/* 1. Tombol KOTAK */}
        <button
          type="button"
          aria-label="View as Grid"
          onClick={() => onViewShapeChange("square")}
          className="flex h-6 w-6 md:h-8 md:w-8 items-center justify-center hover:translate-x-[1px] hover:translate-y-[1px] active:translate-y-1 active:translate-x-1"
        >
          <div
            className={[
              "h-6 w-6 md:h-7 md:w-7 rounded-[3px] border-[2.5px] md:border-[3px] border-black transition-colors duration-300",
              viewShape === "square" ? "bg-brand-yellow" : "bg-white",
            ].join(" ")}
          />
        </button>

        {/* 2. Tombol BULAT */}
        <button
          type="button"
          aria-label="View as Circle"
          onClick={() => onViewShapeChange("circle")}
          className="flex h-6 w-6 md:h-8 md:w-8 items-center justify-center hover:translate-x-[1px] hover:translate-y-[1px] active:translate-y-1 active:translate-x-1"
        >
          <div
            className={[
              "h-6 w-6 md:h-7 md:w-7 rounded-full border-[2.5px] md:border-[3px] border-black transition-colors duration-300",
              viewShape === "circle" ? "bg-brand-yellow" : "bg-white",
            ].join(" ")}
          />
        </button>

        {/* 3. Tombol SEGITIGA */}
        <button
          type="button"
          aria-label="Open sort menu"
          onClick={() => onOpenSortMenu?.()}
          className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center hover:translate-x-[1px] hover:translate-y-[1px] active:translate-y-1 active:translate-x-1 "
        >
          <svg
            viewBox="0 0 24 24"
            className="h-7 w-7 md:h-8 md:w-8"
          >
            <path
              d="M4 20 L12 4 L20 20 Z"
              className="stroke-black fill-white transition hover:fill-brand-yellow"
              strokeWidth={1.8}
            />
          </svg>
        </button>

      </div>
    </div>
  );
}
