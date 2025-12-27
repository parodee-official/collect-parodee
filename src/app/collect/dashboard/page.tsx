import CollectHeader from "@/components/collect/CollectHeader";
import {
  getCollectionStatsAction,
  getCollectionMetadataAction
} from "@/app/actions/nftActions";
import Image from "next/image";
import { Suspense } from "react";
import pixelchaos from "@/data/pixelchaos.json";
import hyperevm from "@/data/hyperevm.json";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// Interface Data
interface OpenSeaStats {
  floor_price?: number;
  volume?: number;
  total_volume?: number;
  total_supply?: number;
  num_owners?: number;
  average_price?: number;
  sales?: number;
  market_cap?: number;
  intervals?: {
    [key: string]: {
      volume_change?: number;
    };
  };
}

interface OpenSeaMetadata {
  name: string;
  description: string;
  image_url: string;
  banner_image_url: string;
  safelist_request_status?: string;
  discord_url?: string;
  twitter_username?: string;
  project_url?: string;
}

const OPENSEA_SLUG_MAP: Record<string, string> = {
  "parodee-pixel-chaos": "parodee-pixel-chaos",
  "parodee-hyperevm": "parodee-hyperevm",
};

export default async function DashboardPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  // Variabel utama bernama 'slug'
  const slug = (resolvedSearchParams.slug as string) || "parodee-pixel-chaos";

  const isHyperevm = slug === "parodee-hyperevm";
  const currencyLabel = isHyperevm ? "HYPE" : "ETH";

  // Rate Konversi (Hanya untuk Volume)
  const ETH_TO_HYPE_RATE = 121.2;

  // --- FETCH DATA ---
  const openSeaSlug = OPENSEA_SLUG_MAP[slug];
  let statsData: OpenSeaStats | null = null;
  let metadata: OpenSeaMetadata | null = null;

  if (openSeaSlug) {
    try {
      const [stats, meta] = await Promise.all([
        getCollectionStatsAction(openSeaSlug) as Promise<OpenSeaStats | null>,
        getCollectionMetadataAction(openSeaSlug) as Promise<OpenSeaMetadata | null>
      ]);
      statsData = stats;
      metadata = meta;
    } catch (e) {
      console.error("[Dashboard] Error fetching:", e);
    }
  }

  // --- FORMAT DATA ---
  let localDataArray: any[] = pixelchaos;

  // [PERBAIKAN] Gunakan 'slug', bukan 'localSlug'
  if (slug === "parodee-hyperevm") {
    localDataArray = hyperevm;
  }

  const safeLocalData = Array.isArray(localDataArray) ? localDataArray : [];

  // Data Umum
  const valSupply = statsData?.total_supply ?? safeLocalData.length;
  const valOwners = statsData?.num_owners ?? 0;
  const valSales = statsData?.sales ?? 0;
  const volumeChange = statsData?.intervals?.one_day?.volume_change ?? 0;
  const uniqueOwnerRatio = valSupply > 0 ? ((valOwners / valSupply) * 100).toFixed(1) : "0";

  // Data Currency
  let valVolume = statsData?.volume ?? statsData?.total_volume ?? 0;
  const valFloor = statsData?.floor_price ?? 0;
  const valAvg = statsData?.average_price ?? 0;
  const valMarketCap = statsData?.market_cap ?? 0;

  // --- LOGIKA KONVERSI ---
  if (isHyperevm) {
    // HANYA VOLUME yang dikonversi ke HYPE
    valVolume = valVolume * ETH_TO_HYPE_RATE;
  }

  const fmt = (num: number, digits = 2) =>
    num > 0 ? `${num.toLocaleString("en-US", { maximumFractionDigits: digits })} ${currencyLabel}` : "-";

  return (
    <>
    <Suspense fallback={null}>
      <CollectHeader />
    </Suspense>

      <div className="max-w-6xl mx-auto mt-6 p-6 animate-in fade-in duration-500">

        {/* === HEADER METADATA === */}
        {metadata && (
          <div className="relative mb-10 bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800">
             <div className="h-48 w-full bg-zinc-800 relative">
                {metadata.banner_image_url && (
                  <Image src={metadata.banner_image_url} alt="Banner" fill className="object-cover opacity-60" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent"></div>
             </div>

             <div className="relative px-8 pb-8 -mt-16 flex flex-col md:flex-row gap-6 items-start">
                <div className="w-32 h-32 rounded-2xl border-4 border-zinc-900 bg-zinc-800 overflow-hidden shadow-xl relative shrink-0">
                  {metadata.image_url && (
                     <Image src={metadata.image_url} alt="Logo" fill className="object-cover" />
                  )}
                </div>
                <div className="flex-1 pt-16 md:pt-14">
                  <div className="flex items-center gap-3 mb-2">
                     <h1 className="text-3xl font-bold text-white">{metadata.name || slug}</h1>
                     {metadata.safelist_request_status === "verified" && (
                       <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs px-2 py-0.5 rounded-full font-medium">Verified</span>
                     )}
                  </div>
                  <p className="text-zinc-400 text-sm leading-relaxed max-w-3xl line-clamp-3">
                    {metadata.description}
                  </p>
                  <div className="flex gap-4 mt-4 text-xs font-medium text-zinc-500">
                    <a href={`https://opensea.io/collection/${openSeaSlug}`} target="_blank" className="hover:text-brand-yellow transition text-brand-yellow">View on OpenSea ↗</a>
                  </div>
                </div>
             </div>
          </div>
        )}

        {/* === GRID STATISTIK === */}
        <div className="mb-6">
           <h2 className="text-white font-semibold mb-4 text-lg">Market Statistics</h2>
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard label="Floor Price" value={fmt(valFloor, 4)} />
              <StatCard label="Total Volume" value={fmt(valVolume)} change={volumeChange} />
              <StatCard label="Avg Price" value={fmt(valAvg, 4)} />
              <StatCard label="Total Sales" value={valSales.toLocaleString()} />
              <StatCard label="Owners" value={valOwners.toLocaleString()} sub={`~${uniqueOwnerRatio}% Unique`} />
              <StatCard label="Total Supply" value={valSupply.toLocaleString()} />
              <StatCard label="Market Cap" value={fmt(valMarketCap)} />
           </div>
        </div>

      </div>
    </>
  );
}

function StatCard({ label, value, sub, change }: { label: string, value: string, sub?: string, change?: number }) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex flex-col justify-between hover:border-zinc-700 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <div className="text-zinc-500 text-xs uppercase tracking-wider">{label}</div>
        {change !== undefined && change !== 0 && (
          <div className={`text-xs font-medium px-1.5 py-0.5 rounded ${change > 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
            {change > 0 ? "+" : ""}{change.toFixed(1)}%
          </div>
        )}
      </div>
      <div>
        <div className="text-xl font-bold text-white truncate">{value}</div>
        {sub && <div className="text-xs text-zinc-500 mt-1">{sub}</div>}
      </div>
    </div>
  );
}
