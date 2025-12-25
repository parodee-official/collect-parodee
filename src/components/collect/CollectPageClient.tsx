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
  
  // Keep a clean copy of local data
  const localItems = initialItems;

  // --- STATE ---
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

  // Sorting
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOptionId>("identifier");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // --- HELPER: Shuffle Array (Fisher-Yates) ---
  const shuffleArray = (array: any[]) => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  // --- 1. EXTRACT TRAITS ---
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

  // --- 2. LOGIC SORTING SWITCHER (HYBRID RANDOMIZE) ---
  const applySortOption = async (opt: SortOptionId) => {
    setSortOption(opt);
    setCurrentPage(1);

    // CASE A: BACK TO DEFAULT (Identifier)
    if (opt === "identifier") {
        console.log("[Client] Reset to local identifier sort");
        setDisplayItems(localItems); 
        setIsFetchingMarket(false);
        setViewShape("square"); 
        return; 
    }

    // CASE B: API FETCH (Top 50) + RANDOM REST
    setIsFetchingMarket(true);
    try {
      console.log(`[Client] Fetching Top 50 for: ${opt}`);
      
      // 1. Fetch Top 50 from Server
      const marketData = await getMarketDataAction(
        opt,
        currentChain,
        activeSlug,
        currentContract
      );

      let topItems: any[] = [];
      const fetchedIds = new Set<string>();

      if (marketData && marketData.items && marketData.items.length > 0) {
        // Merge API data with Local Metadata
        topItems = marketData.items.map((marketItem: any) => {
          const localMatch = localItems.find(
            (li) => String(li.identifier) === String(marketItem.identifier)
          );
          
          if (localMatch) fetchedIds.add(String(localMatch.identifier));

          return {
            ...localMatch, 
            ...marketItem, 
            identifier: marketItem.identifier,
            image_url: localMatch?.image_url || marketItem.image_url || localMatch?.display_image_url,
            name: localMatch?.name || marketItem.name || `#${marketItem.identifier}`
          };
        });
      }

      // 2. Get the "Rest" of the items (Local items NOT in Top 50)
      const remainingItems = localItems.filter(item => !fetchedIds.has(String(item.identifier)));

      // 3. Shuffle the remaining items
      const randomizedRest = shuffleArray(remainingItems);

      // 4. Combine: [Top 50 Real Data] + [Randomized Local Data]
      // This ensures the list is full (e.g. 3333 items) but starts with meaningful market data
      setDisplayItems([...topItems, ...randomizedRest]);
      
      // Auto-switch shape to circle for market view
      setViewShape("circle");

    } catch (error) {
      console.error("Gagal fetch market data:", error);
      // Fallback: just show local randomized if API fails
      setDisplayItems(shuffleArray(localItems));
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

    // C. Sorting Logic
    if (sortOption === "identifier") {
       // Only sort locally if we are in "Identifier" mode.
       // In "Market Mode", the array order is already set (Top 50 + Random)
       result.sort((a, b) => {
          const idA = parseInt(a.identifier);
          const idB = parseInt(b.identifier);
          return idA - idB;
       });
    } 

    // D. Direction Reverse
    if (sortDirection === "desc") {
        result.reverse();
    }

    return result;
  }, [displayItems, search, selectedAttributes, sortOption, sortDirection]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const pageItems = filteredAndSorted.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Handlers
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
      const h = await getNFTEventsAction(currentChain, currentContract, item.identifier);
      if (h?.asset_events) setHistory(h.asset_events);
    } catch (e) { console.error(e); } 
    finally { setIsLoadingDetail(false); }
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
        detail={{ ...selectedItem, contract: currentContract, chain: currentChain }}
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