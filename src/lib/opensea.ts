const API_KEY = process.env.OPENSEA_API_KEY;
const BASE_URL = "https://api.opensea.io/api/v2";

// Fungsi Helper Internal
async function _fetchOpenSea(endpoint: string, options: RequestInit = {}) {
  if (!API_KEY) {
    console.warn("Missing OpenSea API Key. Requests might fail if not proxied.");
  }

  const mergedOptions: RequestInit & { next?: { revalidate?: number } } = {
    ...options,
    headers: {
      accept: "application/json",
      "x-api-key": API_KEY || "",
      ...(options.headers || {}),
    },
    // Default cache 1 jam
    next: { revalidate: 3600, ...(options as any).next },
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, mergedOptions);

  if (!response.ok) {
    throw new Error(`OpenSea API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export const openSeaClient = {
  // 👇👇👇 INI YANG KURANG SEBELUMNYA 👇👇👇
  // Kita expose fungsi internal agar bisa dipanggil dari nftActions.ts
  fetchOpenSea: async (endpoint: string, options: RequestInit = {}) => {
    return _fetchOpenSea(endpoint, options);
  },
  // 👆👆👆 ----------------------------- 👆👆👆

  getCollectionNFTs: async (slug: string, limit = 20) => {
    return _fetchOpenSea(`/collection/${slug}/nfts?limit=${limit}`);
  },

  getCollectionTraits: async (slug: string) => {
    return _fetchOpenSea(`/traits/${slug}`, {
      next: { revalidate: 3600 }
    });
  },

  getCollectionStats: async (slug: string) => {
    return _fetchOpenSea(`/collections/${slug}/stats`);
  },

  getSingleNFT: async (chain: string, address: string, identifier: string) => {
    return _fetchOpenSea(`/chain/${chain}/contract/${address}/nfts/${identifier}`);
  },

  getNFTEvents: async (chain: string, address: string, identifier: string) => {
    return _fetchOpenSea(
      `/events/chain/${chain}/contract/${address}/nfts/${identifier}?limit=20`,
      {
        next: { revalidate: 0 }, 
        cache: 'no-store'
      }
    );
  },

  getBestListing: async (chain: string, address: string, identifier: string) => {
     return _fetchOpenSea(
        `/listings/chain/${chain}/nfts/${address}/${identifier}/best`,
        { cache: 'no-store' }
     );
  },

  getNFTOffers: async (chain: string, protocol: string, address: string, identifier: string) => {
    return _fetchOpenSea(
      `/orders/${chain}/${protocol}/offers?asset_contract_address=${address}&token_ids=${identifier}&order_by=eth_price&order_direction=desc`,
      {
        next: { revalidate: 60 }, 
      }
    );
  },
};