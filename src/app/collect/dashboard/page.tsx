import CollectHeader from "@/components/collect/CollectHeader";
import { Suspense } from "react"

// app/collect/dashboard/page.tsx
export default function CollectDashboardPage() {
  return (
     <>
    <Suspense fallback={null}>
      <CollectHeader />
    </Suspense>

    <div className="text-center text-zinc-400 text-sm">
      Dashboard coming soon.
    </div>
    </>
  );
}
