// src/components/layout/Footer.tsx
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="">
      <div className="mx-auto flex flex-col items-center px-4 py-3 md:py-5 text-white">
        {/* Garis tipis di tengah, tidak full-bleed ke edge window */}
        <div className="mb-5 h-[1px] w-full max-w-5xl bg-[#1E1E1E]" />

        {/* Teks copyright di tengah */}
        <p className="text-center text-[10px] font-black sm:text-xs md:text-md">
          © {year} Parodee. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
