"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"

export default function CollectHeader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Ambil slug saat ini, default null jika tidak ada
  const currentSlug = searchParams.get("slug")

  // ---- helpers ----
  const formatSlug = (value: string) =>
    value
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())

  // Helper untuk membuat URL tetap membawa slug
  // Jika slug ada, tambahkan ke URL tujuan. Jika tidak, biarkan polos.
  const getLink = (path: string) => {
    return currentSlug ? `${path}?slug=${currentSlug}` : path
  }

  // ---- title resolver ----
  const titleMap: Record<string, string> = {
    "/collect/about": "About",
    "/collect/items": "Parodee Pixel Chaos",
    "/collect/dashboard": "Dashboard",
  }

  let title = titleMap[pathname] ?? "Collection"

  if (pathname === "/collect/items" && currentSlug) {
    title = formatSlug(currentSlug)
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
          {/* Gunakan helper getLink di sini */}
          <NavItem href={getLink("/collect/about")} label="About" activePath="/collect/about" />
          <NavItem href={getLink("/collect/items")} label="Items" activePath="/collect/items" />
          <NavItem href={getLink("/collect/dashboard")} label="Dashboard" activePath="/collect/dashboard" />
        </nav>
      </section>
    </>
  )
}

// Update NavItem agar logic active-nya benar
function NavItem({ href, label, activePath }: { href: string; label: string; activePath: string }) {
  const pathname = usePathname()

  // Cek active hanya berdasarkan pathname (abaikan query params slug)
  const isActive = pathname === activePath

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
