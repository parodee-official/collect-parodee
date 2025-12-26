import CollectHeader from "@/components/collect/CollectHeader";
import { Suspense } from "react";
import {
  getCollectionStatsAction,
  getCollectionMetadataAction
} from "@/app/actions/nftActions";
import Image from "next/image";

import pixelchaos from "@/data/pixelchaos.json";
import hyperevm from "@/data/hyperevm.json";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// Interface yang lebih longgar untuk menangkap berbagai format respon OpenSea
interface OpenSeaStats {
  floor_price?: number;
  volume?: number;
  total_volume?: number;
  total_supply?: number;
  num_owners?: number;
  average_price?: number;
  sales?: number;
  market_cap?: number;
}

interface OpenSeaMetadata {
  name: string;
  description: string;
  image_url: string;
  banner_image_url: string;
  owner?: string;
  safelist_request_status?: string;
  discord_url?: string;
  twitter_username?: string;
  project_url?: string;
}

const OPENSEA_SLUG_MAP: Record<string, string> = {
  "parodee-pixel-chaos": "parodee-pixel-chaos",
  // ⚠️ PASTIKAN SLUG INI BENAR. Cek URL: opensea.io/collection/parodee-hyperevm
  "parodee-hyperevm": "parodee-hyperevm",
};

export default async function CollectDashboardPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const localSlug = (resolvedSearchParams.slug as string) || "parodee-pixel-chaos";
  const currencyLabel = localSlug === "parodee-hyperevm" ? "HYPE" : "ETH";

  // --- FETCH DATA ---
  const openSeaSlug = OPENSEA_SLUG_MAP[localSlug];

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

      // 👇👇 DEBUGGING: LIHAT INI DI TERMINAL VS CODE 👇👇
      console.log(`[Dashboard] DEBUG ${localSlug}:`);
      console.log("Stats Raw:", stats); // Cek apakah floor_price 0 atau ada angkanya
      console.log("Metadata Found:", !!meta);
      // --------------------------------------------------

    } catch (e) {
      console.error("[Dashboard] Error fetching:", e);
    }
  }

  // --- FORMAT DATA ---

  // A. Total Supply
  let localDataArray: any[] = pixelchaos;
  if (localSlug === "parodee-hyperevm") localDataArray = hyperevm;
  const safeLocalData = Array.isArray(localDataArray) ? localDataArray : [];

  const valSupply = statsData?.total_supply ?? safeLocalData.length;

  // Owners & Ratio
  const valOwners = statsData?.num_owners ?? 0;
  const uniqueOwnerRatio = valSupply > 0 ? ((valOwners / valSupply) * 100).toFixed(1) : "0";

  // B. Market Data (Logika Prioritas)
  // Volume: Cek volume (V2) dulu, baru total_volume (V1)
  const valVolume = statsData?.volume ?? statsData?.total_volume ?? 0;

  // Floor: Ambil langsung. Jika 0, berarti memang tidak ada listing di OpenSea.
  const valFloor = statsData?.floor_price ?? 0;

  const valAvg = statsData?.average_price ?? 0;
  const valSales = statsData?.sales ?? 0;

  // Helper Formatter
  const fmt = (num: number, digits = 2) =>
    num > 0 ? `${num.toLocaleString("en-US", { maximumFractionDigits: digits })} ${currencyLabel}` : "-";

  return (
    <>
      <Suspense fallback={null}>
        <CollectHeader />
      </Suspense>

      <div className="max-w-6xl mx-auto mt-6 p-6">

        {/* === HEADER METADATA === */}
        {metadata && (
          <div className="relative mb-10 bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800">
            <div className="h-48 w-full bg-zinc-800 relative">
              {metadata.banner_image_url && (
                <Image
                  src={metadata.banner_image_url}
                  alt="Banner"
                  fill
                  className="object-cover opacity-60"
                />
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
                   <h1 className="text-3xl font-bold text-white">{metadata.name || localSlug}</h1>
                   {metadata.safelist_request_status === "verified" && (
                     <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs px-2 py-0.5 rounded-full font-medium">Verified</span>
                   )}
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed max-w-3xl line-clamp-3">
                  {metadata.description}
                </p>

                {/* Links */}
                <div className="flex gap-4 mt-4 text-xs font-medium text-zinc-500">
                  <a href={`https://opensea.io/collection/${openSeaSlug}`} target="_blank" className="hover:text-brand-yellow transition text-brand-yellow">
                    View on OpenSea ↗
                  </a>
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
              <StatCard label="Total Volume" value={fmt(valVolume)} />
              <StatCard label="Avg Price" value={fmt(valAvg, 4)} />
              <StatCard label="Total Sales" value={valSales.toLocaleString()} />
              <StatCard label="Owners" value={valOwners.toLocaleString()} sub={`~${uniqueOwnerRatio}% Unique`} />
              <StatCard label="Total Supply" value={valSupply.toLocaleString()} />
           </div>
        </div>

        {/* INFO FOOTER */}
        <div className="text-center text-zinc-600 text-xs mt-8">
           {valFloor === 0 ? (
             <span className="text-orange-500">
               Note: Floor Price is 0 or hidden because there are no active listings on OpenSea for this collection.
             </span>
           ) : (
             "Data fetched via OpenSea API."
           )}
        </div>

      </div>
    </>
  );
}

function StatCard({ label, value, sub }: { label: string, value: string, sub?: string }) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex flex-col justify-between">
      <div className="text-zinc-500 text-xs uppercase tracking-wider mb-2">{label}</div>
      <div>
        <div className="text-xl font-bold text-white truncate">{value}</div>
        {sub && <div className="text-xs text-zinc-500 mt-1">{sub}</div>}
      </div>
    </div>
  );
}
