import React from 'react'
import { Routes, Route } from 'react-router-dom'

import Home from './pages/Home'
import Shop from './pages/Shop'
import Login from './pages/Login'
import Register from './pages/Register'
import Success from './pages/Success'
import Cancel from './pages/Cancel'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/success" element={<Success />} />
      <Route path="/cancel" element={<Cancel />} />
    </Routes>
  )
}
