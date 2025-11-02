import React from 'react'
import { Link } from 'react-router-dom'

export default function Success() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-20">
      <div className="max-w-md w-full rounded-3xl border border-white/10 bg-white/[0.07] backdrop-blur-xl p-8 text-center shadow-[0_40px_140px_-10px_rgba(255,255,255,0.2)]">
        <div className="text-2xl font-semibold mb-2">Спасибо! 🖤</div>
        <div className="text-white/60 text-sm leading-relaxed mb-6">
          Оплата прошла успешно. Мы получили заказ и скоро с тобой свяжемся,
          чтобы подтвердить детали.
        </div>

        <Link
          to="/shop"
          className="inline-block relative overflow-hidden rounded-2xl px-4 py-3 text-sm font-medium text-white bg-white/15 hover:bg-white/20 border border-white/20 backdrop-blur-xl transition-all active:scale-[0.98] shadow-[0_30px_120px_rgba(255,255,255,0.25)]"
        >
          <span className="relative z-10 tracking-wide">Вернуться в магазин</span>
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity" />
        </Link>

        <p className="text-[10px] text-white/40 leading-relaxed tracking-wide text-center mt-6">
          Чек отправлен на email, указанный при оплате.
        </p>
      </div>
    </div>
  )
}
