"use client"

import Link from "next/link"
import { ReactNode } from "react"
import { usePathname } from "next/navigation"

export default function CollectLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen px-4 md:px-0">

      {/* HERO */}
      <section className="pt-8">
        <div
          className="
            relative
            mx-auto
            max-w-5xl
            h-[clamp(220px,30vw,300px)]
            rounded-xl
            overflow-hidden
            border-4 border-black
            bg-cover bg-center
          "
          style={{ backgroundImage: "url('/images/Banner.png')" }}
        >
          <div className="absolute inset-0 bg-black/5" />

          <h1
            className="
              absolute inset-0
              flex items-center justify-center
              text-2xl md:text-4xl
              font-extrabold
              tracking-tight
            "
          >
            Parodee: Pixel Chaos
          </h1>
        </div>
      </section>

      {/* SUB NAV */}
      <section className="mt-6">
        <nav className="flex justify-center gap-8 text-sm">
          <NavItem href="/collect/about" label="About" />
          <NavItem href="/collect/items" label="Items" />
          <NavItem href="/collect/dashboard" label="Dashboard" />
        </nav>
      </section>

      {/* PAGE CONTENT */}
      <section className="mt-10 mx-auto max-w-5xl">
        {children}
      </section>

    </main>
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
