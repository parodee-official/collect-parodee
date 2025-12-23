"use client";

import { ViewShape } from "./CollectToolbar"; // Import tipe

type CollectGridProps = {
  items: any[];
  onItemClick?: (item: any) => void;
  viewShape?: ViewShape; // Prop baru untuk bentuk
};

export default function CollectGrid({ items, onItemClick, viewShape = "square" }: CollectGridProps) {
  if (!items?.length) return null;

  // Tentukan class border radius berdasarkan viewShape
  // Jika 'circle' -> rounded-full, Jika 'square' -> rounded biasa
  const shapeClass = viewShape === "circle"
    ? "rounded-full"
    : "rounded-[18px] md:rounded-[24px]";

  return (
    <div className="grid grid-cols-4 gap-4 lg:grid-cols-5 sm:gap-5 md:gap-6">
      {items.map((nft: any) => {
        const displayName = nft.name || `#${nft.identifier}`;
        const imageUrl = nft.image_url || nft.display_image_url;

        return (
          <button
            key={nft.identifier}
            aria-label={displayName}
            onClick={() => onItemClick?.(nft)}
            className={`
              relative flex aspect-square w-full cursor-pointer overflow-hidden

              ${shapeClass}

              border-[3px] md:border-[4px] border-black bg-white
              shadow-[3px_3px_0_rgba(0,0,0,1)]
              md:shadow-[6px_6px_0_rgba(0,0,0,1)]

              active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
              hover:translate-x-1 hover:translate-y-1 hover:shadow-none
              focus:outline-none

              transition-all duration-500 ease-in-out
            `}
          >
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={displayName}
                className="h-full w-full object-cover [image-rendering:pixelated]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-black/10">
                <span className="px-2 text-xs font-semibold text-white drop-shadow-[1px_1px_0_rgba(0,0,0,0.6)] md:text-sm">
                  {displayName}
                </span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
