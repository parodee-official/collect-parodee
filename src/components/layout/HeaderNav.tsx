'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from "next/image"
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // const isCollectPage = pathname === '/collect/items'
  const isCollectPage = pathname.startsWith('/collect')

  const collectMenuOptions = [
  { label: 'Pixel Chaos', slug: 'parodee-pixel-chaos' },
  { label: 'First Gen', slug: 'parodee-hyperevm' },
]

const getCollectBasePath = () => {
  if (pathname.startsWith("/collect/about")) return "/collect/about"
  if (pathname.startsWith("/collect/dashboard")) return "/collect/dashboard"
  if (pathname.startsWith("/collect/items")) return "/collect/items"

  // fallback kalau masih di /collect
  return "/collect/items"
}

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
            />

          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 text-sm md:text-lg text-zinc-300">

            {!isCollectPage && (
              <>
                <Link href="/collect" className="hover:text-white">
                  Collections
                </Link>
                <Link href="#/" className="hover:text-white">
                  Art
                </Link>
                <Link href="#/" className="hover:text-white">
                  Item
                </Link>
              </>
            )}

            {isCollectPage &&
              collectMenuOptions.map((option) => (
                <Link
                  key={option.slug}
                  // href={`/collect/items?slug=${option.slug}`}
                  href={`${getCollectBasePath()}?slug=${option.slug}`}
                  className="hover:text-white transition"
                >
                  {option.label}
                </Link>
              ))}

          </div>

          {/* Mobile Button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden flex items-center justify-center  text-zinc-300 hover:text-white"
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t border-[#1E1E1E] ">
          <div className="flex flex-col px-4 py-3 text-[15px] text-white">

            {!isCollectPage && (
              <>
                <Link href="/collect" className="py-2">
                  Collections
                </Link>
                <Link href="/art" className="py-2">
                  Art
                </Link>
                <Link href="/item" className="py-2">
                  Item
                </Link>
              </>
            )}

            {isCollectPage &&
              collectMenuOptions.map((option) => (
                <Link
                  key={option.slug}
                  href={`${getCollectBasePath()}?slug=${option.slug}`}
                  // href={`/collect?slug=${option.slug}`}
                  className="py-2"
                >
                  {option.label}
                </Link>
              ))}

          </div>
        </div>
      )}
    </nav>
  )
}
