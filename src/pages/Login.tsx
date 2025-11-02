import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await login(email, password)
    if (!res.ok) setError(res.error || 'Login failed')
    else navigate('/shop')
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full rounded-3xl border border-white/10 bg-white/[0.07] backdrop-blur-xl p-8 shadow-lg">
        <h1 className="text-2xl font-semibold text-center mb-6">Log in</h1>
        {error && <div className="text-red-400 mb-3 text-sm text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black/40 border border-white/20 rounded-xl p-2 text-sm" required />
          <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black/40 border border-white/20 rounded-xl p-2 text-sm" required />
          <button type="submit" className="w-full bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl py-2 font-medium text-sm">Sign in</button>
        </form>
      </div>
    </div>
  )
}
