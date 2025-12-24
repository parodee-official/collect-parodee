"use client";

import { useMemo, useState } from "react";
import CollectToolbar, { ViewShape } from "@/components/collect/CollectToolbar";
import CollectGrid from "@/components/collect/CollectGrid";
import PaginationDots from "@/components/collect/PaginationDots";
import CollectItemModal from "@/components/collect/CollectItemModal";
import FilterSidebar, { MobileFilterSidebar } from "@/components/collect/FilterSidebar";
import SortModal, { SortDirection, SortOptionId } from "@/components/collect/SortModal";
import { getNFTEventsAction, getMarketDataAction } from "@/app/actions/nftActions";

const ITEMS_PER_PAGE = 25;

const CONTRACTS: Record<string, string> = {
  "parodee-pixel-chaos": "0x9e1dadf6eb875cf927c85a430887f2945039f923",
  "parodee-hyperevm": "0x90df79459afc5fc58b7bfdca3c27c18b03a29d66",
};
const CHAINS: Record<string, string> = {
  "parodee-pixel-chaos": "ethereum",
  "parodee-hyperevm": "hyperevm",
};
const ALLOWED_TRAIT_TYPES = ["Background", "Body", "Type", "Face", "Outfit"];

type CollectPageClientProps = {
  initialItems: any[];
  activeSlug: string;
};

export default function CollectPageClient({ initialItems, activeSlug }: CollectPageClientProps) {
  const currentContract = CONTRACTS[activeSlug] || CONTRACTS["parodee-pixel-chaos"];
  const currentChain = CHAINS[activeSlug] || "ethereum";

  // Data Sumber (Local JSON) sebagai fallback metadata
  const localItems = initialItems;

  // State Utama: displayItems (Isinya bisa data lokal atau hasil fetch server)
  const [displayItems, setDisplayItems] = useState<any[]>(localItems);
  const [isFetchingMarket, setIsFetchingMarket] = useState(false);

  // UI States
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string[]>>({});

  // Modal & View States
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [viewShape, setViewShape] = useState<ViewShape>("square");

  // Sorting States (Default kita set ke price_asc atau sesuaikan kebutuhan)
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOptionId>("price_asc");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // --- 1. EXTRACT TRAITS (Tetap dari Local JSON agar lengkap) ---
  const availableTraits = useMemo(() => {
    const traitsMap: Record<string, Set<string>> = {};
    for (const item of localItems) {
      const rawTraits = item.attributes || [];
      if (!Array.isArray(rawTraits)) continue;
      for (const t of rawTraits) {
        const traitType = t.trait_type;
        if (!traitType) continue;
        const normalizedType = String(traitType).charAt(0).toUpperCase() + String(traitType).slice(1);
        if (ALLOWED_TRAIT_TYPES.includes(normalizedType)) {
          if (!traitsMap[normalizedType]) traitsMap[normalizedType] = new Set();
          traitsMap[normalizedType].add(String(t.value));
        }
      }
    }
    const result: Record<string, string[]> = {};
    for (const key in traitsMap) {
      result[key] = Array.from(traitsMap[key]).sort();
    }
    return result;
  }, [localItems]);

  // --- 2. LOGIKA GANTI SORTING (FETCH KE SERVER) ---
  const applySortOption = async (opt: SortOptionId) => {
    setSortOption(opt);
    setCurrentPage(1);

    // Karena user HANYA minta Last Sale & Best Listing, keduanya butuh fetch.
    // Jadi kita langsung fetch saja tanpa perlu cek kondisi rumit.

    setIsFetchingMarket(true);

    try {
      console.log(`[Client] Fetching market data for: ${opt}`);

      const marketData = await getMarketDataAction(
        opt,
        currentChain,
        activeSlug,
        currentContract
      );

      if (marketData && marketData.items && marketData.items.length > 0) {
        // GABUNGKAN DATA: Ambil Harga dari Server + Gambar/Nama dari Local JSON
        const mergedItems = marketData.items.map((marketItem: any) => {
          const localMatch = localItems.find(
            (li) => String(li.identifier) === String(marketItem.identifier)
          );

          return {
            ...localMatch, // Base: Metadata lokal (Image HD, Traits)
            ...marketItem, // Override: Harga/Status terbaru dari Server

            // Safety check: pastikan ID & Image tidak hilang
            identifier: marketItem.identifier,
            image_url: localMatch?.image_url || marketItem.image_url || localMatch?.display_image_url,
            name: localMatch?.name || marketItem.name || `#${marketItem.identifier}`
          };
        });

        setDisplayItems(mergedItems);
      } else {
        // Jika Server return kosong (misal tidak ada listing), kosongkan list
        console.warn("No items returned from server sorting.");
        setDisplayItems([]);
      }
    } catch (error) {
      console.error("Gagal fetch market data:", error);
    } finally {
      setIsFetchingMarket(false);
    }
  };

  // --- 3. FILTER & FINAL PROCESSING ---
  const filteredAndSorted = useMemo(() => {
    let result = [...displayItems];

    // A. Search
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((item: any) => {
        const name = (item.name ?? "").toLowerCase();
        const id = String(item.identifier ?? "").toLowerCase();
        const attributes = item.attributes || [];
        const hasMatchingAttribute = attributes.some((t: any) => {
          const traitValue = String(t.value ?? "").toLowerCase();
          const traitType = String(t.trait_type ?? "").toLowerCase();
          return traitValue.includes(q) || traitType.includes(q);
        });
        return name.includes(q) || id.includes(q) || hasMatchingAttribute;
      });
    }

    // B. Attributes Filter
    if (Object.keys(selectedAttributes).length > 0) {
      result = result.filter((item: any) => {
        const itemTraits = item.attributes || [];
        return Object.entries(selectedAttributes).every(([filterCategory, filterValues]) => {
          if (filterValues.length === 0) return true;
          return itemTraits.some((t: any) => {
            const tType = t.trait_type;
            const normType = String(tType).charAt(0).toUpperCase() + String(tType).slice(1);
            return normType === filterCategory && filterValues.includes(String(t.value));
          });
        });
      });
    }

    // C. Sorting Direction (Asc/Desc)
    // Data dari server biasanya sudah terurut Ascending (Low to High / Oldest to Newest).
    // Jika user pilih Desc, kita tinggal balik array-nya.
    if (sortDirection === "desc") {
        result.reverse();
    }

    return result;
  }, [displayItems, search, selectedAttributes, sortDirection]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const pageItems = filteredAndSorted.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // --- Handlers Lain ---
  const handleToggleAttribute = (traitType: string, value: string) => {
    setSelectedAttributes((prev) => {
      const current = prev[traitType] || [];
      const newValues = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      const next = { ...prev };
      if (newValues.length === 0) delete next[traitType];
      else next[traitType] = newValues;
      return next;
    });
    setCurrentPage(1);
  };

  const handleOpenItem = async (item: any) => {
    setSelectedItem(item);
    setIsItemModalOpen(true);
    setHistory([]);
    setIsLoadingDetail(true);

    try {
      const historyData = await getNFTEventsAction(currentChain, currentContract, item.identifier);
      if (historyData && historyData.asset_events) {
          setHistory(historyData.asset_events);
      }
    } catch (error) {
      console.error("Gagal fetch history:", error);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  return (
    <section className="mt-4 md:mt-6">
      <div className="flex gap-10">
        <FilterSidebar
          availableTraits={availableTraits}
          selectedAttributes={selectedAttributes}
          onToggleAttribute={handleToggleAttribute}
        />

        <div className="flex-1">
          <CollectToolbar
            search={search}
            onSearchChange={(v) => { setSearch(v); setCurrentPage(1); }}
            onOpenFilter={() => setIsMobileFilterOpen(true)}
            viewShape={viewShape}
            onViewShapeChange={setViewShape}
            onOpenSortMenu={() => setIsSortModalOpen(true)}
          />

          {isFetchingMarket ? (
            <div className="flex h-60 w-full flex-col items-center justify-center gap-4 text-gray-500">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-yellow border-t-transparent"></div>
              <p>Fetching market data...</p>
            </div>
          ) : (
            <CollectGrid
              items={pageItems}
              onItemClick={handleOpenItem}
              viewShape={viewShape}
            />
          )}

          {!isFetchingMarket && pageItems.length === 0 && (
            <div className="py-20 text-center text-gray-500">
              {search ? "No items match your search." : "No listed items found."}
            </div>
          )}

          <PaginationDots currentPage={safePage} totalPages={totalPages} onChange={setCurrentPage} />
        </div>
      </div>

      <MobileFilterSidebar
        open={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        availableTraits={availableTraits}
        selectedAttributes={selectedAttributes}
        onToggleAttribute={handleToggleAttribute}
      />

      <CollectItemModal
        open={isItemModalOpen}
        item={selectedItem}
        detail={{
            ...selectedItem,
            contract: currentContract,
            chain: currentChain
        }}
        history={history}
        isLoading={isLoadingDetail}
        onClose={() => setIsItemModalOpen(false)}
      />

      <SortModal
        open={isSortModalOpen}
        onClose={() => setIsSortModalOpen(false)}
        option={sortOption}
        direction={sortDirection}
        onChangeOption={applySortOption}
        onChangeDirection={(dir) => { setSortDirection(dir); setCurrentPage(1); }}
      />
    </section>
  );
}
