import React, { useEffect, useState } from 'react'

type Product = {
  id: number
  name: string
  desc: string
  price: number
  image: string
}

type CartItem = {
  product: Product
  qty: number
}

const PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Volume Hold Spray',
    desc: 'Strong hold finishing spray for event hairstyles.',
    price: 19.99,
    image: '/spray.png',
  },
  {
    id: 2,
    name: 'Shine Serum',
    desc: 'Lightweight serum for glossy, frizz-free finish.',
    price: 24.5,
    image: '/serum.png',
  },
  {
    id: 3,
    name: 'Heat Shield 230°',
    desc: 'Thermal protection spray for curling/ironing.',
    price: 17.0,
    image: '/heatshield.png',
  },
  {
    id: 4,
    name: 'Texturizing Powder',
    desc: 'Instant root lift + volume for braids & updos.',
    price: 14.75,
    image: '/powder.png',
  },
  {
    id: 5,
    name: 'Pro Bobby Pins (50pcs)',
    desc: 'Salon-grade matte black pins. Doesn’t slip.',
    price: 9.5,
    image: '/pins.png',
  },
  {
    id: 6,
    name: 'Luxury Hair Comb',
    desc: 'Carbon antistatic wide-tooth styling comb.',
    price: 12.0,
    image: '/comb.png',
  },
]

const LS_CART_KEY = 'izhairtrend_cart_v1'

function loadCartFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(LS_CART_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch (e) {
    console.warn('Failed to parse cart from localStorage:', e)
    return []
  }
}

function saveCartToStorage(cart: CartItem[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(LS_CART_KEY, JSON.stringify(cart))
  } catch (e) {
    console.warn('Failed to save cart to localStorage:', e)
  }
}

export default function Shop() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const restored = loadCartFromStorage()
    setCart(restored)
  }, [])

  useEffect(() => {
    if (!isClient) return
    saveCartToStorage(cart)
  }, [cart, isClient])

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        )
      } else {
        return [...prev, { product, qty: 1 }]
      }
    })
  }

  function inc(productId: number) {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, qty: item.qty + 1 }
          : item
      )
    )
  }

  function dec(productId: number) {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, qty: item.qty - 1 }
            : item
        )
        .filter((item) => item.qty > 0)
    )
  }

  function removeItem(productId: number) {
    setCart((prev) => prev.filter((item) => item.product.id !== productId))
  }

  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.qty,
    0
  )

  async function handleCheckout(provider: 'stripe' | 'paypal') {
    if (cart.length === 0) {
      alert('Корзина пуста 🙃')
      return
    }

    const line_items = cart.map((item) => ({
      name: item.product.name,
      unit_amount: Math.round(item.product.price * 100),
      quantity: item.qty,
      currency: 'eur',
    }))

    try {
      const res = await fetch(
        provider === 'stripe'
          ? 'http://localhost:5000/api/checkout/stripe'
          : 'http://localhost:5000/api/checkout/paypal',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ line_items }),
        }
      )

      const data = await res.json()

      if (!data.ok) {
        console.error(data)
        alert('Payment init error: ' + data.error)
        return
      }

      window.location.href = data.checkout_url
    } catch (err) {
      console.error(err)
      alert('Payment request failed')
    }
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-10 md:py-16 flex flex-col md:flex-row gap-8 md:gap-10">
      {/* PRODUCTS */}
      <div className="w-full md:flex-1">
        <h1 className="text-3xl font-semibold mb-2 flex items-baseline gap-3">
          <span>Shop</span>
          <span className="text-sm font-normal text-white/50 tracking-wide">
            Pro hair essentials
          </span>
        </h1>
        <p className="text-white/60 mb-8 max-w-lg text-sm leading-relaxed">
          Официальный магазин IZ HAIR TREND. Добавляй в корзину, сумма
          сохраняется даже после перезагрузки 💅.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {PRODUCTS.map((p) => (
            <div
              key={p.id}
              className="group relative rounded-3xl border border-white/10 bg-white/[0.07] backdrop-blur-xl p-5 flex flex-col shadow-[0_30px_120px_-10px_rgba(255,255,255,0.15)]"
            >
              {/* product image */}
              <div className="rounded-2xl bg-gradient-to-br from-white/20 via-white/5 to-transparent border border-white/10 aspect-[4/3] mb-4 flex items-center justify-center overflow-hidden">
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-contain p-4"
                    draggable={false}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center text-xs text-white/60 font-light tracking-wide opacity-80">
                    <div className="text-base font-medium text-white">
                      {p.name}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-white/40">
                      izhairtrend
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col">
                <div className="text-lg font-medium leading-snug mb-1">
                  {p.name}
                </div>
                <div className="text-white/60 text-sm leading-relaxed flex-1">
                  {p.desc}
                </div>

                <div className="mt-4 flex items-end justify-between">
                  <div className="text-xl font-semibold">
                    €{p.price.toFixed(2)}
                  </div>

                  <button
                    onClick={() => addToCart(p)}
                    className="relative overflow-hidden rounded-2xl px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-xl transition-all active:scale-[0.97] shadow-[0_20px_80px_rgba(255,255,255,0.2)]"
                  >
                    <span className="relative z-10">Add to Cart</span>
                    <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CART */}
      <div className="w-full md:w-80 lg:w-96 md:sticky md:top-10 self-start">
        <div className="rounded-3xl border border-white/10 bg-white/[0.07] backdrop-blur-xl p-6 shadow-[0_40px_140px_-10px_rgba(255,255,255,0.2)]">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-xl font-semibold">Your Cart</h2>
            <div className="text-xs text-white/50 tracking-wide">
              {cart.length === 0
                ? 'empty'
                : `${cart.reduce((n, i) => n + i.qty, 0)} item(s)`}
            </div>
          </div>

          {cart.length === 0 ? (
            <div className="text-white/50 text-sm leading-relaxed">
              Корзина пуста. Добавь товар →
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="rounded-2xl border border-white/10 bg-black/30 p-4 flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="text-sm font-medium leading-snug">
                      <div className="text-white">{item.product.name}</div>
                      <div className="text-white/50 text-xs">
                        €{item.product.price.toFixed(2)} each
                      </div>
                    </div>

                    <button
                      className="text-white/40 hover:text-white/70 text-xs"
                      onClick={() => removeItem(item.product.id)}
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => dec(item.product.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-sm font-medium"
                      >
                        −
                      </button>
                      <div className="min-w-[2rem] text-center text-white text-sm font-medium">
                        {item.qty}
                      </div>
                      <button
                        onClick={() => inc(item.product.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-sm font-medium"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-white font-semibold text-sm">
                      €{(item.product.price * item.qty).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}

              <div className="border-t border-white/10 pt-4 flex items-center justify-between text-lg font-semibold">
                <div>Total</div>
                <div>€{total.toFixed(2)}</div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  className="w-full relative overflow-hidden rounded-2xl px-4 py-3 text-sm font-medium text-white bg-white/15 hover:bg-white/20 border border-white/20 backdrop-blur-xl transition-all active:scale-[0.98] shadow-[0_30px_120px_rgba(255,255,255,0.25)]"
                  onClick={() => handleCheckout('stripe')}
                >
                  <span className="relative z-10 tracking-wide">
                    Pay with Stripe 💳
                  </span>
                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity" />
                </button>

                <button
                  className="w-full relative overflow-hidden rounded-2xl px-4 py-3 text-sm font-medium text-white bg-white/15 hover:bg-white/20 border border-white/20 backdrop-blur-xl transition-all active:scale-[0.98] shadow-[0_30px_120px_rgba(255,255,255,0.25)]"
                  onClick={() => handleCheckout('paypal')}
                >
                  <span className="relative z-10 tracking-wide">
                    Pay with PayPal 🅿️
                  </span>
                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity" />
                </button>

                <p className="text-[10px] text-white/40 leading-relaxed tracking-wide text-center">
                  Secure checkout · SSL · No card data stored on site
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
