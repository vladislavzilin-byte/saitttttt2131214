import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const { login } = useAuth()
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
      navigate('/shop')
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full rounded-3xl border border-white/10 bg-white/[0.07] backdrop-blur-xl p-8 shadow-[0_40px_140px_-10px_rgba(255,255,255,0.2)]">
        <h1 className="text-2xl font-semibold text-center mb-6">Log in</h1>

        {error && <div className="text-red-400 mb-3 text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            placeholder="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full bg-black/40 border border-white/20 rounded-xl p-2 text-sm text-white placeholder-white/30 outline-none focus:border-white/40"
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full bg-black/40 border border-white/20 rounded-xl p-2 text-sm text-white placeholder-white/30 outline-none focus:border-white/40"
          />
          <button
            type="submit"
            className="w-full bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl py-3 font-medium text-sm active:scale-[0.98] shadow-[0_30px_120px_rgba(255,255,255,0.25)]"
          >
            Sign in
          </button>
        </form>

        <div className="text-center text-white/40 text-xs mt-6">
          New here?{' '}
          <Link to="/register" className="text-white/70 hover:text-white underline">
            Create account
          </Link>
        </div>
      </div>
    </div>
  )
}
