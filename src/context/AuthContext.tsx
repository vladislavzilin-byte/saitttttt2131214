import React, { createContext, useContext, useEffect, useState } from 'react'

export type User = {
  id: string
  name: string
  email: string
  instagram?: string
  phone?: string
}

type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
  register: (data: {
    name: string
    email: string
    password: string
    instagram?: string
    phone?: string
  }) => Promise<{ ok: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const USERS_KEY = 'iz_users_v1'
const SESSION_KEY = 'iz_session_v1'

function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function saveUsers(users: any[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function loadSession() {
  return localStorage.getItem(SESSION_KEY)
}

function saveSession(userId: string | null) {
  if (userId) localStorage.setItem(SESSION_KEY, userId)
  else localStorage.removeItem(SESSION_KEY)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const users = loadUsers()
    const currentId = loadSession()
    if (currentId) {
      const u = users.find((u: any) => u.id === currentId)
      if (u) setUser(u)
    }
  }, [])

  async function register(data: any) {
    const users = loadUsers()
    const exists = users.find((u: any) => u.email.toLowerCase() === data.email.toLowerCase())
    if (exists) return { ok: false, error: 'Email already registered' }

    const newUser = {
      id: crypto.randomUUID(),
      ...data,
    }
    users.push(newUser)
    saveUsers(users)
    saveSession(newUser.id)
    setUser(newUser)
    return { ok: true }
  }

  async function login(email: string, password: string) {
    const users = loadUsers()
    const found = users.find(
      (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )
    if (!found) return { ok: false, error: 'Wrong email or password' }
    saveSession(found.id)
    setUser(found)
    return { ok: true }
  }

  function logout() {
    saveSession(null)
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout, register }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
