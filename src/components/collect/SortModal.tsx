// src/components/collect/SortModal.tsx
"use client";
import Image from "next/image";

// Tambahkan 'price_asc' ke tipe ini
export type SortOptionId = "identifier" | "last-sale" | "price_asc";
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

  const options = [
    { id:"identifier", label: "By Identifier" },
    { id: "price_asc", label: "Best listing (Low Price)" }, // <--- FITUR BARU
    //{ id: "best-offer", label: "Best offer" },
    { id: "last-sale", label: "Last sale" },
    //{ id: "rarity", label: "Rarity" }, // Rarity kita set sebagai default di tombol kotak
    //{ id: "time-listed", label: "Time listed" },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4">
      <div className="relative w-full max-w-xs rounded-[24px] border-[3px] md:border-[5px] border-black bg-[#404040] px-8 py-10 md:py-12 ">

        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg border-2 border-black bg-[#ff6b81] text-sm font-black shadow-cartoonTwo"
        >
          ✕
        </button>

        <h3 className="mb-4 md:mb-6 text-center text-lg md:text-2xl font-black">Sort by</h3>

        <div className="space-y-2 md:space-y-4">
          {options.map((opt) => {
            const isActive = opt.id === option;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChangeOption(opt.id)}
                className="flex w-full items-center justify-between rounded-[12px] px-1 py-[6px] text-left text-sm md:text-[16px]"
              >
                <span className="font-medium">{opt.label}</span>
                {isActive && (
                  <Image
                    src="/icon/check.svg"
                    alt="active"
                    width={16}
                    height={16}
                    className="inline-block"
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => onChangeDirection("asc")}
            className={`flex-1 rounded-[12px] border-[3px] border-black px-4 py-2 text-sm font-semibold ${direction === "asc" ? "bg-brand-yellow" : "bg-transparent"}`}
          >
            Asc
          </button>

          <button
            type="button"
            onClick={() => onChangeDirection("desc")}
            className={`flex-1 rounded-[12px] border-[3px] border-black px-4 py-2 text-sm font-semibold ${direction === "desc" ? "bg-brand-yellow" : "bg-transparent"}`}
          >
            Desc
          </button>
        </div>
      </div>
    </div>
  );
}
