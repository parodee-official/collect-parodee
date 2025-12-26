"use server";

import { openSeaClient } from "@/lib/opensea";

// =================================================================
// 1. FUNGSI STANDAR
// =================================================================

export async function getNFTDetailsAction(chain: string, address: string, identifier: string) {
  try {
    const data = await openSeaClient.getSingleNFT(chain, address, identifier);
    return data;
  } catch (error) { return null; }
}

export async function getNFTEventsAction(chain: string, address: string, identifier: string) {
  try {
    const data = await openSeaClient.getNFTEvents(chain, address, identifier);
    return data;
  } catch (error) { return { asset_events: [] }; }
}

export async function getBestListingAction(chain: string, address: string, identifier: string) {
  try {
    const data = await openSeaClient.getBestListing(chain, address, identifier);
    return data;
  } catch (error) { return null; }
}

export async function getCollectionTraitsAction(slug: string) {
  try {
    const data = await openSeaClient.getCollectionTraits(slug);
    return data;
  } catch (error) { return null; }
}

export async function getNFTDetailAction(chain: string, address: string, identifier: string) {
  try {
    const data = await openSeaClient.getSingleNFT(chain, address, identifier);
    return data.nft || data;
  } catch (error) { return null; }
}

export async function getNFTOffersAction(chain: string, address: string, identifier: string) {
  try {
    const data = await openSeaClient.getNFTOffers(chain, "seaport", address, identifier);
    return data;
  } catch (error) { return { orders: [] }; }
}

export async function getCollectionStatsAction(collectionSlug: string) {
  if (!collectionSlug) return null;

  try {
    // Memanggil fungsi yang sudah ada di opensea.ts
    const data = await openSeaClient.getCollectionStats(collectionSlug);

    // OpenSea API V2 mengembalikan stats di dalam object properti 'total'
    return data.total || null;
  } catch (error) {
    console.error("[NFTAction] Error fetching collection stats:", error);
    return null;
  }
}


/**
 * 2. Action untuk mengambil METADATA (Profil: Deskripsi, Banner, Image)
 */
export async function getCollectionMetadataAction(collectionSlug: string) {
  if (!collectionSlug) return null;

  try {
    // Panggil fungsi dari opensea.ts
    const data = await openSeaClient.getCollectionMetadata(collectionSlug);

    // API OpenSea V2 Collection Metadata mengembalikan object langsung
    return data || null;
  } catch (error) {
    console.error("[NFTAction] Error metadata:", error);
    return null;
  }
}

// =================================================================
// 2. FUNGSI HYBRID SORTING (MARKET DATA)
// =================================================================

export async function getMarketDataAction(
  sortOption: string,
  chain: string,
  slug: string,
  address: string
) {
  try {
    let items: any[] = [];
    const CACHE_TIME = 60;
    const LIMIT = 50;

    // --- A. BEST LISTING (Price Low to High) ---
    if (sortOption === "price_asc") {
      // [FIX] Gunakan Endpoint 'Listings Collection' yang khusus
      // Endpoint ini otomatis mengurutkan dari harga terendah (Floor)
      const url = `/listings/collection/${slug}/all?limit=${LIMIT}`;

      console.log(`[Server] Fetching Listings: ${url}`);

      const data = await openSeaClient.fetchOpenSea(url, { next: { revalidate: CACHE_TIME } });

      if (data && data.listings) {
        items = data.listings.map((l:any) => normalizeCollectionListings(l, chain));
      }
    }

    // --- B. LAST SALE (Events Sale) ---
    else if (sortOption === "last-sale") {
      const url = `/events/collection/${slug}?event_type=sale&limit=${LIMIT}`;
      const data = await openSeaClient.fetchOpenSea(url, { next: { revalidate: CACHE_TIME } });

      if (data && data.asset_events) {
         items = data.asset_events.map((e:any) => {
             const price = e.payment ? (parseInt(e.payment.quantity)/Math.pow(10, e.payment.decimals)) : 0;
             return {
                 identifier: e.nft.identifier,
                 display_price: `Sold: ${price.toFixed(4)} ETH`,
                 contract: e.contract,
                 chain: chain
             };
         });
      }
    }

    // --- C. BEST OFFER ---
    else if (sortOption === "best-offer") {
      // [FIX] Gunakan Endpoint 'Offers Collection' yang khusus
      const url = `/offers/collection/${slug}/all?limit=${LIMIT}`;

      console.log(`[Server] Fetching Offers: ${url}`);

      const data = await openSeaClient.fetchOpenSea(url, { next: { revalidate: CACHE_TIME } });

      if (data && data.offers) {
         items = data.offers.map((o:any) => normalizeCollectionOffers(o, chain));
      }
    }

    // Filter null & Unique
    const validItems = items.filter(i => i !== null);
    const uniqueItems = Array.from(new Map(validItems.map(item => [item.identifier, item])).values());

    return { items: uniqueItems };

  } catch (error) {
    console.error(`[MarketData] Error fetching ${sortOption}:`, error);
    return { items: [] };
  }
}

// ---------------------------------------------------------
// HELPER NORMALISASI KHUSUS ENDPOINT COLLECTION
// ---------------------------------------------------------

// Helper untuk Endpoint /listings/collection/...
function normalizeCollectionListings(listing: any, chain: string) {
  try {
    // Struktur data endpoint ini berbeda, token ID ada di dalam protocol_data
    const params = listing.protocol_data?.parameters;
    const offerItem = params?.offer?.[0]; // Item yang dijual

    if (!offerItem) return null;

    const tokenId = offerItem.identifierOrCriteria;

    // Harga ada di listing.price.current
    const priceData = listing.price?.current;
    let priceVal = 0;
    if (priceData) {
        priceVal = parseInt(priceData.value) / Math.pow(10, priceData.decimals);
    }

    return {
      identifier: tokenId,
      display_price: `${priceVal.toFixed(4)} ETH`,
      contract: params.offerer, // Atau ambil dari context jika perlu
      chain: chain,
    };
  } catch (e) {
    return null;
  }
}

// Helper untuk Endpoint /offers/collection/...
function normalizeCollectionOffers(offer: any, chain: string) {
  try {
    const params = offer.protocol_data?.parameters;

    // Di endpoint Offer, 'consideration' adalah item yang diminta (NFT kita)
    // NAMUN, Collection Offer biasanya tidak punya Token ID spesifik (Criteria based).
    // Jika ini adalah Item Offer spesifik, token ID ada di criteria.
    // Jika ini Collection Offer, token ID mungkin tidak ada (semua item).

    // KITA CARI OFFER YANG PUNYA TOKEN ID SPESIFIK SAJA (Item Offer)
    const considerationItem = params?.consideration?.[0];
    if (!considerationItem) return null;

    const tokenId = considerationItem.identifierOrCriteria;

    // Jika tokenId '0' atau kosong, biasanya ini Collection Offer (Bid ke semua item).
    // Kita skip Collection Offer karena tidak bisa di-map ke satu gambar spesifik di Grid.
    if (!tokenId || tokenId === "0") return null;

    const priceData = offer.price;
    let priceVal = 0;
    if (priceData) {
       priceVal = parseInt(priceData.value) / Math.pow(10, priceData.decimals);
    }

    return {
      identifier: tokenId,
      display_price: `Bid: ${priceVal.toFixed(4)} WETH`,
      contract: null, // Endpoint ini tidak selalu return contract address eksplisit
      chain: chain,
    };
  } catch (e) {
    return null;
  }
}
