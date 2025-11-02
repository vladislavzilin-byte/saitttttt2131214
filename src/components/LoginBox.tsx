import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

export default function LoginBox() {
  const { user, login, logout } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await login(email, password)
    if (!res.ok) {
      setError(res.error || 'Login failed')
    } else {
      setEmail('')
      setPassword('')
      navigate('/shop')
    }
  }

  if (user) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl p-4 w-full max-w-xs text-sm text-white/80 shadow-[0_30px_120px_rgba(255,255,255,0.2)]">
        <div className="text-white font-semibold mb-1">Hi, {user.name}</div>
        <div className="text-white/60 mb-3 text-xs leading-relaxed">
          <div className="truncate">Email: {user.email}</div>
          {user.instagram && <div className="truncate">IG: {user.instagram}</div>}
          {user.phone && <div className="truncate">Phone: {user.phone}</div>}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/shop')}
            className="flex-1 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl py-2 text-[11px] font-medium active:scale-[0.98]"
          >
            Shop
          </button>
          <button
            onClick={() => logout()}
            className="flex-1 bg-black/40 hover:bg-black/30 border border-white/20 rounded-xl py-2 text-[11px] font-medium text-white/70 hover:text-white active:scale-[0.98]"
          >
            Logout
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl p-4 w-full max-w-xs text-sm text-white/80 shadow-[0_30px_120px_rgba(255,255,255,0.2)]">
      <div className="text-white text-sm font-semibold mb-2">Sign in</div>
      {error && <div className="text-red-400 text-[11px] mb-2">{error}</div>}
      <form className="space-y-2 mb-2" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full bg-black/40 border border-white/20 rounded-xl p-2 text-[11px] text-white placeholder-white/30 outline-none focus:border-white/40"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="w-full bg-black/40 border border-white/20 rounded-xl p-2 text-[11px] text-white placeholder-white/30 outline-none focus:border-white/40"
        />
        <button
          type="submit"
          className="w-full bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl py-2 text-[11px] font-medium active:scale-[0.98]"
        >
          Login
        </button>
      </form>
      <div className="text-[11px] text-white/40">
        No account?
        <Link
          to="/register"
          className="text-white/70 hover:text-white underline ml-1"
        >
          Create
        </Link>
      </div>
    </div>
  )
}
