"use client";

import { useState } from "react";
import WalletConnectModal from "./WalletConnectModal";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import WalletButton from "./WalletButton";
//import BottomTabs from "./BottomTabs";
import MobileMainMenu from "./MobileMenu";
import Image from "next/image";

export default function HeaderNav() {
  const searchParams = useSearchParams();

  const [isWalletModalOpen, setWalletModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Ambil slug aktif dari URL, jika kosong default ke pixel-chaos
  const activeSlug = searchParams.get("slug") || "parodee-pixel-chaos";

  // KONFIGURASI MENU COLLECT (Label + Slug)
  const collectMenuOptions = [
    { label: "Pixel Chaos", slug: "parodee-pixel-chaos" },
    { label: "HyperEVM", slug: "parodee-hyperevm" },
  ];

  const mobileMenuItems = collectMenuOptions.map((option) => ({
    label: option.label,
    href: `/collect?slug=${option.slug}`,
  }));

  const ctaLabel = "CONNECT WALLET";

  return (
    <header className="sticky top-0 z-30 bg-brand-blue">
      <div className="relative mx-auto max-w-6xl px-6 pt-7 pb-3 md:pb-6">
        
        {/* ROW: Logo | (menu kecil desktop) | CTA */}
        <div className="mt-3 md:mt-5 lg:mt-8 flex items-center justify-between gap-4">
          <Link href="/" className="flex flex-none items-center gap-3">
            <Image
              src="/icon/logo.svg"
              alt="P Icon"
              width={32}
              height={32}
              className="object-contain select-none"
            />
            <span className="text-xl md:text-2xl font-extrabold text-white">
              Marketplace
            </span>
          </Link>

          {/* Menu kecil – DESKTOP */}
          <nav className="hidden flex-1 items-center justify-center md:flex">
            <div className="flex items-center gap-10 text-md md:text-xl">
              {/* LOGIC RENDERING MENU: Only Collect Options */}
              {collectMenuOptions.map((option) => {
                const isActive = activeSlug === option.slug;
                return (
                  <Link
                    key={option.slug}
                    href={`/collect?slug=${option.slug}`}
                    className={[
                      "cursor-pointer whitespace-nowrap transition-colors",
                      isActive
                        ? "font-bold text-white decoration-2 underline-offset-4"
                        : "font-semibold text-white/80 hover:text-white text-sm",
                    ].join(" ")}
                  >
                    Parodee : {option.label}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Kanan: Desktop → CTA + avatar, Mobile → Hamburger */}
          <div className="flex flex-none items-center gap-3">
            {/* Desktop CTA + avatar */}
            <div className="hidden items-center gap-3 md:flex">
              <div className="min-w-[170px]">
                <WalletButton
                  label={ctaLabel}
                  onClick={() => setWalletModalOpen(true)}
                />
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-black bg-white">
                <span role="img" aria-label="avatar">
                  🧑‍🎨
                </span>
              </div>
            </div>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border-[3px] border-black bg-white shadow-cartoonTwo md:hidden active:translate-x-1 active:translate-y-1 active:shadow-none"
              aria-label="Open menu"
            >
              <div className="flex flex-col gap-[3px]">
                <span className="block h-[2px] w-4 bg-black" />
                <span className="block h-[2px] w-4 bg-black" />
                <span className="block h-[2px] w-4 bg-black" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      <MobileMainMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        smallMenu={mobileMenuItems}
        ctaLabel={ctaLabel}
      />

      {/*<BottomTabs />
      <WalletConnectModal
        open={isWalletModalOpen}
        onClose={() => setWalletModalOpen(false)}
      />*/}
    </header>
  );
}