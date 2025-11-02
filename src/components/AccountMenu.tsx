import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'

export default function AccountMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const boxRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!boxRef.current) return
      if (!boxRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const pillClass =
    'flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-[11px] font-medium leading-none px-3 py-2 backdrop-blur-xl shadow-[0_30px_120px_rgba(255,255,255,0.2)] active:scale-[0.97] transition-all cursor-pointer select-none'

  if (!user) {
    return (
      <Link to="/login" className={pillClass}>
        <span className="block w-1.5 h-1.5 rounded-full bg-white/60 shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
        <span>Login</span>
      </Link>
    )
  }

  return (
    <div className="relative" ref={boxRef}>
      <button
        onClick={() => setOpen(o => !o)}
        className={pillClass}
      >
        <span className="block w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
        <span className="truncate max-w-[6rem]">
          {user.name || 'Account'}
        </span>
        <svg
          className={
            'w-3 h-3 text-white/60 transition-transform ' +
            (open ? 'rotate-180' : '')
          }
          viewBox="0 0 10 6"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 1L5 5L9 1"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 mt-2 min-w-[160px] rounded-2xl border border-white/15 bg-black/70 backdrop-blur-xl text-white text-xs shadow-[0_40px_140px_-10px_rgba(255,255,255,0.4)] p-2 z-50">
          <div className="px-3 py-2 border-b border-white/10 text-[11px] text-white/60 leading-relaxed">
            <div className="font-medium text-white truncate">{user.name}</div>
            <div className="truncate text-white/50">{user.email}</div>
            {user.instagram ? (
              <div className="truncate text-white/40">{user.instagram}</div>
            ) : null}
            {user.phone ? (
              <div className="truncate text-white/40">{user.phone}</div>
            ) : null}
          </div>

          <button
            onClick={() => {
              setOpen(false)
              navigate('/shop')
            }}
            className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition text-[12px] leading-none"
          >
            🛒 My cart / Shop
          </button>

          <button
            onClick={() => {
              setOpen(false)
              navigate('/login')
            }}
            className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition text-[12px] leading-none"
          >
            👤 Account / Login page
          </button>

          <button
            onClick={() => {
              setOpen(false)
              logout()
            }}
            className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 text-red-300 hover:text-red-400 transition text-[12px] leading-none"
          >
            ⏏ Logout
          </button>
        </div>
      )}
    </div>
  )
}
