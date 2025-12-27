// src/app/collect/dashboard/loading.tsx
import CollectHeader from "@/components/collect/CollectHeader";
import { Suspense } from "react";

export default function Loading() {
  return (
    <>
      <Suspense fallback={null}>
        <CollectHeader />
      </Suspense>

      <div className="max-w-6xl mx-auto mt-6 p-6 animate-pulse">

        {/* Skeleton Banner */}
        <div className="relative mb-10 bg-zinc-900/50 rounded-2xl overflow-hidden border border-zinc-800 h-64">
          <div className="h-48 w-full bg-zinc-800/50"></div>
          <div className="absolute bottom-8 left-8 flex gap-6 items-end">
             <div className="w-32 h-32 rounded-2xl bg-zinc-800 border-4 border-zinc-900"></div>
             <div className="mb-4 space-y-2">
               <div className="h-8 w-48 bg-zinc-800 rounded"></div>
               <div className="h-4 w-96 bg-zinc-800/50 rounded"></div>
             </div>
          </div>
        </div>

        {/* Skeleton Grid Stats */}
        <div className="mb-6">
           <div className="h-6 w-32 bg-zinc-800/50 rounded mb-4"></div>
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl h-24">
                  <div className="h-3 w-20 bg-zinc-800 rounded mb-4"></div>
                  <div className="h-6 w-24 bg-zinc-800/50 rounded"></div>
                </div>
              ))}
           </div>
        </div>

      </div>
    </>
  );
}
