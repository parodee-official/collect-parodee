import Link from "next/link";
import { ReactNode } from "react";

export default function CollectLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen  ">

      {/* HERO */}
      <section className="pt-8">
        <div
          className="
            relative h-[280px]
            rounded-2xl overflow-hidden
            border-4 border-black
            bg-cover bg-center
          "
          style={{ backgroundImage: "url('/images/Banner.png')" }}
        >
          <div className="absolute inset-0 bg-black/10" />
          <h1 className="absolute text-white inset-0 flex items-center justify-center text-4xl font-extrabold">
            Parodee: Pixel Chaos
          </h1>
        </div>
      </section>

      {/* SUB NAV */}
      <section className="mt-6">
        <div className="flex justify-center gap-10 text-sm text-zinc-400">
          <NavItem href="/collect/about" label="About" />
          <NavItem href="/collect/items" label="Items" />
          <NavItem href="/collect/dashboard" label="Dashboard" />
        </div>
      </section>

      {/* PAGE CONTENT */}
      <section className="mt-10">
        {children}
      </section>

    </main>
  );
}

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="hover:text-white transition"
    >
      {label}
    </Link>
  );
}
