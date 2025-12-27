import CollectHeader from "@/components/collect/CollectHeader";
import { Suspense } from "react";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// 1. DATABASE KONTEN (Bisa ditaruh di sini atau file json terpisah)
const COLLECTION_INFO: Record<string, { title: string; subtitle: string; description: string; highlights: string[] }> = {
  "parodee-pixel-chaos": {
    title: "Pixel Chaos",
    subtitle: "The Genesis Collection on Ethereum",
    description: `
      Parodee Pixel Chaos
    `,
    highlights: [
    ]
  },
  "parodee-hyperevm": {
    title: "HyperEVM Edition",
    subtitle: "Expanding Horizons on HyperEVM",
    description: `
    parodee-hyperevm
    `,
    highlights: [
    ]
  }
};

export default async function CollectAboutPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  // Default ke pixel-chaos jika slug kosong
  const slug = (resolvedSearchParams.slug as string) || "parodee-pixel-chaos";

  // Ambil data konten berdasarkan slug
  // Jika slug tidak dikenali, fallback ke pixel-chaos
  const content = COLLECTION_INFO[slug] || COLLECTION_INFO["parodee-pixel-chaos"];

  return (
    <>
      <Suspense fallback={null}>
        <CollectHeader />
      </Suspense>

      <div className="max-w-4xl mx-auto mt-12 ">

        {/* JUDUL UTAMA */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
            {content.title}
          </h1>
          <p className="text-brand-yellow text-lg font-medium tracking-wide uppercase">
            {content.subtitle}
          </p>
        </div>

        {/* CONTAINER KONTEN */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-8 md:p-12">

          {/* DESKRIPSI (Support Newline) */}
          <div className="text-zinc-300 leading-relaxed text-lg whitespace-pre-line mb-10">
            {content.description}
          </div>

          {/* HIGHLIGHTS / FITUR */}
          <div className="border-t border-zinc-800 pt-8">
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Collection Highlights
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {content.highlights.map((item, index) => (
                <li key={index} className="flex items-center text-zinc-400 text-sm">
                  <span className="w-2 h-2 bg-brand-yellow rounded-full mr-3"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>
    </>
  );
}
