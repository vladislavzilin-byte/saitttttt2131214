import React from 'react'
import LoginBox from '../components/LoginBox'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-16 text-center">
      <img src="/favicon.svg" className="w-40 opacity-90 mb-4" alt="logo" />
      <p className="max-w-xl text-white/70 mb-8 text-sm leading-relaxed">
        IZ HAIR TREND · future-ready beauty system. Online shop, pro styling,
        booking & private training.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 w-full max-w-md">
        <Link
          to="/shop"
          className="rounded-2xl border border-white/20 bg-white/10 hover:bg-white/20 text-white/90 hover:text-white font-medium text-sm py-3 px-4 backdrop-blur-xl shadow-[0_30px_120px_rgba(255,255,255,0.2)] text-center"
        >
          Shop
        </Link>
        <Link
          to="/register"
          className="rounded-2xl border border-white/20 bg-white/10 hover:bg-white/20 text-white/90 hover:text-white font-medium text-sm py-3 px-4 backdrop-blur-xl shadow-[0_30px_120px_rgba(255,255,255,0.2)] text-center"
        >
          Create Account
        </Link>
        <Link
          to="/login"
          className="rounded-2xl border border-white/20 bg-white/10 hover:bg-white/20 text-white/90 hover:text-white font-medium text-sm py-3 px-4 backdrop-blur-xl shadow-[0_30px_120px_rgba(255,255,255,0.2)] text-center"
        >
          Log in
        </Link>
        <a
          className="rounded-2xl border border-white/20 bg-white/10 hover:bg-white/20 text-white/90 hover:text-white font-medium text-sm py-3 px-4 backdrop-blur-xl shadow-[0_30px_120px_rgba(255,255,255,0.2)] text-center"
          href="https://instagram.com"
          target="_blank"
          rel="noreferrer"
        >
          Instagram
        </a>
      </div>

      <LoginBox />

      <div className="mt-10 text-xs text-white/50">
        izhairtrend.shop · support@izhairtrend.shop
      </div>
    </div>
  )
}
