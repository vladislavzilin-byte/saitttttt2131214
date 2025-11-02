import React from 'react'
import AccountMenu from './AccountMenu'

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex items-start justify-between px-4 py-4 md:px-6 md:py-5 pointer-events-none">
      {/* LEFT: Account / Login */}
      <div className="pointer-events-auto">
        <AccountMenu />
      </div>

      {/* RIGHT: Language toggle (пример, замени своей логикой языка) */}
      <div className="pointer-events-auto flex items-center gap-2">
        <button
          className="rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-[11px] font-medium leading-none px-3 py-2 backdrop-blur-xl shadow-[0_30px_120px_rgba(255,255,255,0.2)] active:scale-[0.97] transition-all"
        >
          EN
        </button>
        <button
          className="rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-[11px] font-medium leading-none px-3 py-2 backdrop-blur-xl shadow-[0_30px_120px_rgba(255,255,255,0.2)] active:scale-[0.97] transition-all"
        >
          LT
        </button>
      </div>
    </header>
  )
}
