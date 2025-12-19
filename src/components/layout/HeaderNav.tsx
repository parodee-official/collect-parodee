'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const isCollectPage = pathname === '/collect/items'

  const collectMenuOptions = [
  { label: 'Pixel Chaos', slug: 'parodee-pixel-chaos' },
  { label: 'HyperEVM', slug: 'parodee-hyperevm' },
]

  return (
    <nav className="w-full bg-brand-main border-b border-[#1E1E1E]">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="text-white font-semibold text-lg tracking-wide">
            Collect<span className="text-zinc-400">.parodee</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 text-sm text-zinc-300">

            {!isCollectPage && (
              <>
                <Link href="/collect" className="hover:text-white">
                  Collections
                </Link>
                <Link href="/art" className="hover:text-white">
                  Art
                </Link>
                <Link href="/item" className="hover:text-white">
                  Item
                </Link>
              </>
            )}

            {isCollectPage &&
              collectMenuOptions.map((option) => (
                <Link
                  key={option.slug}
                  href={`/collect/items?slug=${option.slug}`}
                  className="hover:text-white transition"
                >
                  {option.label}
                </Link>
              ))}

          </div>

          {/* Mobile Button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-zinc-300"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t border-zinc-800 bg-zinc-900">
          <div className="flex flex-col px-4 py-3 text-sm text-zinc-300">

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
                  href={`/collect?slug=${option.slug}`}
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
