"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"

export default function CollectHeader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const slug = searchParams.get("slug")

  // ---- helpers ----
  const formatSlug = (value: string) =>
    value
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())

  // ---- title resolver ----
  const titleMap: Record<string, string> = {
    "/collect/about": "About",
    "/collect/items": "Parodee Pixel Chaos",
    "/collect/dashboard": "Dashboard",
  }

  let title = titleMap[pathname] ?? "Collection"

  if (pathname === "/collect/items" && slug) {
    title = formatSlug(slug)
  }

  return (
    <>
      {/* HERO */}
      <section className="pt-2 md:pt-8">
        <div
          className="
            relative
            mx-auto
            h-[clamp(220px,30vw,380px)]
            rounded-xl
            overflow-hidden
            border-4 border-black
            bg-cover bg-center
          "
          style={{ backgroundImage: "url('/images/Banner.png')" }}
        >
          {/* <div className="absolute inset-0 bg-black/5" /> */}

          <h1
            className="
              absolute inset-0
              flex items-center justify-center
              text-2xl md:text-4xl lg:text-5xl
              font-extrabold
              tracking-tight
              text-white
            "
          >
            {title}
          </h1>
        </div>
      </section>

      {/* SUB NAV */}
      <section className="mt-6 mb-6">
        <nav className="flex justify-center gap-8 md:gap-10 lg:gap-12 text-sm md:text-lg">
          <NavItem href="/collect/about" label="About" />
          <NavItem href="/collect/items" label="Items" />
          <NavItem href="/collect/dashboard" label="Dashboard" />
        </nav>
      </section>
    </>
  )
}

function NavItem({ href, label }: { href: string; label: string }) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={`
        relative
        font-medium
        transition
        ${
          isActive
            ? "text-white"
            : "text-zinc-400 hover:text-white"
        }
      `}
    >
      {label}
    </Link>
  )
}
