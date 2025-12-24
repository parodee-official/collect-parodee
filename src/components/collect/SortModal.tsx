"use client";

// Hanya 2 Opsi: Price Asc (Low to High) & Last Sale
export type SortOptionId = "price_asc" | "last-sale";
export type SortDirection = "asc" | "desc";

type SortModalProps = {
  open: boolean;
  onClose: () => void;
  option: SortOptionId;
  direction: SortDirection;
  onChangeOption: (opt: SortOptionId) => void;
  onChangeDirection: (dir: SortDirection) => void;
};

export default function SortModal({
  open,
  onClose,
  option,
  direction,
  onChangeOption,
  onChangeDirection,
}: SortModalProps) {
  if (!open) return null;

  // Daftar Menu Disederhanakan
  const options = [
    { id: "price_asc", label: "Best Listing (Low Price)" },
    { id: "last-sale", label: "Last Sale" },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="relative w-full max-w-xs rounded-[24px] border-[3px] border-black bg-white px-8 py-10 md:py-12 shadow-cartoonTwo">

        {/* Tombol Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg border-2 border-black bg-[#ff6b81] text-sm font-black shadow-cartoonTwo"
        >
          ✕
        </button>

        <h3 className="mb-4 md:mb-6 text-center text-lg md:text-2xl font-black">Sort by</h3>

        <div className="space-y-2">
          {options.map((opt) => {
            const isActive = (opt.id as string) === (option as string);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChangeOption(opt.id as SortOptionId)}
                className="flex w-full items-center justify-between rounded-[12px] px-1 py-[6px] text-left text-sm md:text-md hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium">{opt.label}</span>
                {isActive && <span className="text-lg leading-none">✓</span>}
              </button>
            );
          })}
        </div>

        {/* Tombol Asc / Desc */}
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => onChangeDirection("asc")}
            className={[
              "flex-1 rounded-[12px] border-[3px] border-black px-4 py-2 text-sm font-semibold transition-colors",
              direction === "asc" ? "bg-brand-yellow" : "bg-white",
            ].join(" ")}
          >
            Asc
          </button>

          <button
            type="button"
            onClick={() => onChangeDirection("desc")}
            className={[
              "flex-1 rounded-[12px] border-[3px] border-black px-4 py-2 text-sm font-semibold transition-colors",
              direction === "desc" ? "bg-brand-yellow" : "bg-white",
            ].join(" ")}
          >
            Desc
          </button>
        </div>
      </div>
    </div>
  );
}
