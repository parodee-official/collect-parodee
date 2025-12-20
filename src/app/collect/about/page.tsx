import CollectHeader from "@/components/collect/CollectHeader";
import { Suspense } from "react"

// app/collect/about/page.tsx
export default function CollectAboutPage() {
  return (
    <>
    <Suspense fallback={null}>
      <CollectHeader />
    </Suspense>

    <div className="text-center text-zinc-400 text-sm">
      About coming soon.
    </div>
    </>
  );
}
