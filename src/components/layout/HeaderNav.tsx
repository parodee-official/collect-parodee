'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Navbar() {
  const [open, setOpen] = useState(false)

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
            <Link href="/collect" className="hover:text-white transition">
              Collections
            </Link>
            <Link href="/art" className="hover:text-white transition">
              Art
            </Link>
            <Link href="/item" className="hover:text-white transition">
              Item
            </Link>
          </div>

          {/* Mobile Button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-zinc-300 hover:text-white"
            aria-label="Toggle Menu"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t border-zinc-800 bg-zinc-900">
          <div className="flex flex-col px-4 py-3 text-sm text-zinc-300">
            <Link href="/collections" className="py-2 hover:text-white">
              Collections
            </Link>
            <Link href="/art" className="py-2 hover:text-white">
              Art
            </Link>
            <Link href="/item" className="py-2 hover:text-white">
              Item
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
