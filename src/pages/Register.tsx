import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [instagram, setInstagram] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await register({ name, email, password, instagram, phone })
    if (!res.ok) {
      setError(res.error || 'Registration error')
    } else {
      navigate('/shop')
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full rounded-3xl border border-white/10 bg-white/[0.07] backdrop-blur-xl p-8 shadow-[0_40px_140px_-10px_rgba(255,255,255,0.2)]">
        <h1 className="text-2xl font-semibold text-center mb-6">Create account</h1>

        {error && <div className="text-red-400 mb-3 text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full bg-black/40 border border-white/20 rounded-xl p-2 text-sm text-white placeholder-white/30 outline-none focus:border-white/40"
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <input
            className="w-full bg-black/40 border border-white/20 rounded-xl p-2 text-sm text-white placeholder-white/30 outline-none focus:border-white/40"
            placeholder="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full bg-black/40 border border-white/20 rounded-xl p-2 text-sm text-white placeholder-white/30 outline-none focus:border-white/40"
            placeholder="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={4}
          />
          <input
            className="w-full bg-black/40 border border-white/20 rounded-xl p-2 text-sm text-white placeholder-white/30 outline-none focus:border-white/40"
            placeholder="Instagram @handle"
            value={instagram}
            onChange={e => setInstagram(e.target.value)}
          />
          <input
            className="w-full bg-black/40 border border-white/20 rounded-xl p-2 text-sm text-white placeholder-white/30 outline-none focus:border-white/40"
            placeholder="Phone (+370...)"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />

          <button
            type="submit"
            className="w-full bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl py-3 font-medium text-sm active:scale-[0.98] shadow-[0_30px_120px_rgba(255,255,255,0.25)]"
          >
            Sign up
          </button>
        </form>

        <div className="text-center text-white/40 text-xs mt-6">
          Already have account?{' '}
          <Link to="/login" className="text-white/70 hover:text-white underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  )
}
