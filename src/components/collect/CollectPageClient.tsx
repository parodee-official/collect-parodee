"use client";

import { useMemo, useState, useEffect, useRef } from "react";
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
  const localItems = initialItems;

  // --- STATE ---
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string[]>>({});

  // Tampilan & Sorting
  const [viewShape, setViewShape] = useState<ViewShape>("square");
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOptionId>("rarity");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Market Data (API)
  const [marketItems, setMarketItems] = useState<any[]>([]);
  const [isFetchingMarket, setIsFetchingMarket] = useState(false);
  const dataCache = useRef<Record<string, any[]>>({});
  const hasPrefetched = useRef(false);

  // Modal Detail
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);

  // 1. PRE-FETCH
  useEffect(() => {
    if (hasPrefetched.current) return;
    hasPrefetched.current = true;
    const runPreFetch = async () => {
      const targets = ["last-sale", "price_asc"];
      for (const targetSort of targets) {
        try {
          const res = await getMarketDataAction(targetSort, currentChain, activeSlug, currentContract);
          if (res && res.items) {
             const validData = res.items.filter((i:any) => i !== null);
             dataCache.current[targetSort] = validData;
          }
        } catch (e) { console.error(e); }
      }
    };
    const timer = setTimeout(runPreFetch, 1000);
    return () => clearTimeout(timer);
  }, [currentChain, activeSlug, currentContract]);

  // 2. DATA SWITCHING
  useEffect(() => {
    const apiSortOptions = ["last-sale", "price_asc", "best-offer"];
    if (apiSortOptions.includes(sortOption)) {
      if (dataCache.current[sortOption]) {
        setMarketItems(dataCache.current[sortOption]);
        setIsFetchingMarket(false);
      } else {
        setIsFetchingMarket(true);
        setMarketItems([]);
        const fetchManual = async () => {
          try {
            const res = await getMarketDataAction(sortOption, currentChain, activeSlug, currentContract);
            if (res && res.items) {
              const validData = res.items.filter((i:any) => i !== null);
              dataCache.current[sortOption] = validData;
              setMarketItems(validData);
            }
          } finally { setIsFetchingMarket(false); }
        };
        fetchManual();
      }
    } else {
      setMarketItems([]);
    }
  }, [sortOption, currentChain, activeSlug, currentContract]);

  // ============================================================
  // 🔥 3. FILTERING & SORTING LOGIC (BAGIAN INI YANG DIPERBAIKI)
  // ============================================================
  const filtered = useMemo(() => {
    const isApiMode = ["last-sale", "price_asc", "best-offer"].includes(sortOption);
    
    let rawSource = localItems;

    // A. MERGING (Jika Mode API)
    if (isApiMode && marketItems.length > 0) {
       rawSource = marketItems.map((apiItem) => {
          const localMatch = localItems.find(l => String(l.identifier) === String(apiItem.identifier));
          if (localMatch) {
             return {
                ...localMatch, 
                display_price: apiItem.display_price,
                contract: apiItem.contract || currentContract,
                chain: currentChain
             };
          }
          return apiItem;
       });
    } else if (isApiMode && marketItems.length === 0) {
      rawSource = [];
    }

    let result = [...rawSource];

    // B. Search
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((item: any) => {
        const name = (item.name ?? "").toLowerCase();
        const id = String(item.identifier ?? "").toLowerCase();
        return name.includes(q) || id.includes(q);
      });
    }

    // C. Attribute Filter (Local Only)
    if (!isApiMode && Object.keys(selectedAttributes).length > 0) {
      result = result.filter((item: any) => {
        const itemTraits = item.attributes || [];
        return Object.entries(selectedAttributes).every(([cat, vals]) => {
          if (vals.length === 0) return true;
          return itemTraits.some((t: any) => {
            const tType = t.trait_type;
            const normType = String(tType).charAt(0).toUpperCase() + String(tType).slice(1);
            return normType === cat && vals.includes(String(t.value));
          });
        });
      });
    }

    // 🔥 D. HANDLING ASC / DESC
    
    // KASUS 1: MODE API
    if (isApiMode) {
        if (sortOption === "price_asc") {
            // API Default: Termurah (Asc) -> Termahal
            // Jika user minta DESC, kita balik
            if (sortDirection === "desc") result.reverse();
        } 
        else if (sortOption === "last-sale") {
            // API Default: Terbaru (Desc secara waktu) -> Terlama
            // Jika user minta ASC (Terlama), kita balik
            // NOTE: Di SortModal, biasanya "Asc" dianggap default, tapi untuk waktu "Newest" itu Descending.
            // Mari kita sepakati: 
            // - Desc = Newest First (Default API)
            // - Asc = Oldest First (Reverse API)
            if (sortDirection === "asc") result.reverse();
        }
    } 
    // KASUS 2: MODE LOKAL (Rarity / ID)
    else {
       // Default Sort: ID 1, 2, 3 (Asc)
       result.sort((a, b) => parseInt(a.identifier) - parseInt(b.identifier));
       
       // Jika user minta Desc (ID Besar dulu), kita balik
       if (sortDirection === "desc") result.reverse();
    }

    return result;
  }, [localItems, marketItems, search, sortOption, sortDirection, selectedAttributes, currentContract, currentChain]);

  
  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const pageItems = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Traits Helper
  const availableTraits = useMemo(() => {
    const traitsMap: Record<string, Set<string>> = {};
    for (const item of localItems) {
      const rawTraits = item.attributes || [];
      for (const t of rawTraits) {
        if (!t.trait_type) continue;
        const normType = String(t.trait_type).charAt(0).toUpperCase() + String(t.trait_type).slice(1);
        if (ALLOWED_TRAIT_TYPES.includes(normType)) {
          if (!traitsMap[normType]) traitsMap[normType] = new Set();
          traitsMap[normType].add(String(t.value));
        }
      }
    }
    const result: Record<string, string[]> = {};
    for (const key in traitsMap) result[key] = Array.from(traitsMap[key]).sort();
    return result;
  }, [localItems]);

  // Handlers
  const handleViewShapeChange = (shape: ViewShape) => {
    setViewShape(shape);
    if (shape === "square") {
       setSortOption("rarity");    
       setSortDirection("asc"); // Reset ke Asc
    } else if (shape === "circle") {
       setSortOption("last-sale"); 
       setSortDirection("desc"); // Default Last Sale biasanya Desc (Newest)
    }
    setCurrentPage(1);
  };

  const applySortOption = (opt: SortOptionId) => {
    setSortOption(opt);
    setCurrentPage(1);
    
    // Auto set direction default biar user experience enak
    if (opt === "rarity") {
        setViewShape("square");
        setSortDirection("asc");
    } else if (opt === "price_asc") {
        setViewShape("circle");
        setSortDirection("asc"); // Default Best Listing: Murah (Asc)
    } else if (opt === "last-sale") {
        setViewShape("circle");
        setSortDirection("desc"); // Default Last Sale: Baru (Desc)
    }
  };

  const handleOpenItem = async (item: any) => {
    setSelectedItem(item);
    setIsItemModalOpen(true);
    setHistory([]);
    setIsLoadingDetail(true);
    try {
      const h = await getNFTEventsAction(currentChain, currentContract, item.identifier);
      if (h?.asset_events) setHistory(h.asset_events);
    } catch(e) { console.error(e); } 
    finally { setIsLoadingDetail(false); }
  };

  return (
    <section className="mt-4 md:mt-6">
      <div className="flex gap-10">
        
        {/* Sidebar disabled saat API mode */}
        <div className={["last-sale", "price_asc", "best-offer"].includes(sortOption) ? "opacity-50 pointer-events-none" : ""}>
          <FilterSidebar
            availableTraits={availableTraits}
            selectedAttributes={selectedAttributes}
            onToggleAttribute={(t, v) => {
                setSelectedAttributes(prev => {
                    const cur = prev[t] || [];
                    const nextVal = cur.includes(v) ? cur.filter(x=>x!==v) : [...cur, v];
                    const next = {...prev};
                    if (nextVal.length===0) delete next[t]; else next[t]=nextVal;
                    return next;
                });
                setCurrentPage(1);
            }}
          />
        </div>

        <div className="flex-1">
          <CollectToolbar
            search={search}
            onSearchChange={(v) => { setSearch(v); setCurrentPage(1); }}
            onOpenFilter={() => setIsMobileFilterOpen(true)}
            viewShape={viewShape}
            onViewShapeChange={handleViewShapeChange} 
            onOpenSortMenu={() => setIsSortModalOpen(true)}
          />

          {isFetchingMarket ? (
             <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 animate-pulse">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex flex-col gap-2 rounded-xl border border-gray-200 p-2">
                     <div className="aspect-square w-full rounded-lg bg-gray-200"></div>
                     <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                     <div className="h-3 w-1/2 rounded bg-gray-200"></div>
                  </div>
                ))}
             </div>
          ) : marketItems.length === 0 && ["last-sale", "price_asc", "best-offer"].includes(sortOption) ? (
             <div className="text-center py-20 text-gray-500 font-bold">
                 No market data found.<br/>
                 <button onClick={() => applySortOption("rarity")} className="text-blue-500 underline mt-2">Back to Local View</button>
             </div>
          ) : (
             <CollectGrid items={pageItems} onItemClick={handleOpenItem} viewShape={viewShape} />
          )}

          {!isFetchingMarket && (
             <PaginationDots currentPage={safePage} totalPages={totalPages} onChange={setCurrentPage} />
          )}
        </div>
      </div>

      <MobileFilterSidebar
        open={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        availableTraits={availableTraits}
        selectedAttributes={selectedAttributes}
        onToggleAttribute={() => {}} 
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