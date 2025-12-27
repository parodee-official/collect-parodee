'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from "next/image"
import { usePathname, useSearchParams } from 'next/navigation' // Tambahkan useSearchParams

export default function HeaderNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams() // Hook untuk membaca ?slug=...

  // Cek apakah sedang di halaman collect
  const isCollectPage = pathname.startsWith('/collect')

  // Ambil slug aktif. Jika tidak ada, default ke 'parodee-pixel-chaos'
  // Ini penting agar menu 'Pixel Chaos' menyala saat pertama kali buka halaman dashboard
  const activeSlug = searchParams.get('slug') || 'parodee-pixel-chaos'

  const collectMenuOptions = [
    { label: 'Pixel Chaos', slug: 'parodee-pixel-chaos' },
    { label: 'First Gen', slug: 'parodee-hyperevm' },
  ]

  // Helper simpel untuk base path (tanpa regex berlebihan)
  const getCollectBasePath = () => {
    // Array whitelist path yang valid untuk navigasi slug
    const validPaths = ["/collect/about", "/collect/dashboard", "/collect/items"]
    return validPaths.find(path => pathname.startsWith(path)) || "/collect/items"
  }

  const basePath = getCollectBasePath()

  return (
    <nav className="w-full bg-brand-main md:border-b px-4 py-2 md:pt-6 md:px-8 border-[#1E1E1E]">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="text-white font-semibold text-lg tracking-wide">
            <Image
              src="/icon/logo.svg"
              alt="Parodee"
              width={200}
              height={64}
              className="w-auto h-6 sm:h-8 md:h-10"
              priority // Logo prioritas tinggi LCP
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 text-sm md:text-lg text-zinc-300">

            {!isCollectPage && (
              <>
                <Link href="/collect" className="hover:text-white transition-colors">
                  Collections
                </Link>
                <Link href="#/" className="hover:text-white transition-colors">
                  Art
                </Link>
                <Link href="#/" className="hover:text-white transition-colors">
                  Item
                </Link>
              </>
            )}

            {isCollectPage &&
              collectMenuOptions.map((option) => {
                const isActive = activeSlug === option.slug

                return (
                  <Link
                    key={option.slug}
                    href={`${basePath}?slug=${option.slug}`}
                    prefetch={true} // ⚡️ OPTIMASI: Load data saat hover
                    className={`
                      transition-colors duration-200
                      ${isActive
                        ? "text-white font-bold" // Visual feedback aktif
                        : "text-zinc-400 hover:text-white"
                      }
                    `}
                  >
                    {option.label}
                  </Link>
                )
              })}

          </div>

          {/* Mobile Button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t border-[#1E1E1E]">
          <div className="flex flex-col px-4 py-3 text-[15px] text-white">
            {!isCollectPage && (
              <>
                <Link href="/collect" className="py-2 hover:text-zinc-300" onClick={() => setOpen(false)}>
                  Collections
                </Link>
                <Link href="/art" className="py-2 hover:text-zinc-300" onClick={() => setOpen(false)}>
                  Art
                </Link>
                <Link href="/item" className="py-2 hover:text-zinc-300" onClick={() => setOpen(false)}>
                  Item
                </Link>
              </>
            )}

            {isCollectPage &&
              collectMenuOptions.map((option) => {
                 const isActive = activeSlug === option.slug
                 return (
                  <Link
                    key={option.slug}
                    href={`${basePath}?slug=${option.slug}`}
                    prefetch={true}
                    onClick={() => setOpen(false)} // Tutup menu setelah klik
                    className={`
                      py-2 block
                      ${isActive ? "text-brand-yellow font-bold" : "text-zinc-300"}
                    `}
                  >
                    {option.label}
                  </Link>
                )
              })}
          </div>
        </div>
      )}
    </nav>
  )
}
