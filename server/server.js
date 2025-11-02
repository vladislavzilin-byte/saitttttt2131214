import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import Stripe from 'stripe'
import paypal from 'paypal-rest-sdk'

dotenv.config()

const app = express()
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  })
)
app.use(express.json())

// --- Stripe init ---
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
})

// --- PayPal init ---
paypal.configure({
  mode: process.env.PAYPAL_MODE || 'sandbox', // 'live' on production
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET,
})

/**
 * helper: validate/normalize cart from frontend
 * frontend sends:
 * {
 *   line_items:[
 *     { name:'Shine Serum', unit_amount:2450, quantity:2, currency:'eur' },
 *     ...
 *   ]
 * }
 */
function normalizeCartForStripe(line_items) {
  if (!Array.isArray(line_items) || line_items.length === 0) {
    throw new Error('Cart is empty or invalid')
  }

  return line_items.map((item) => ({
    price_data: {
      currency: item.currency || 'eur',
      product_data: {
        name: item.name,
      },
      unit_amount: item.unit_amount, // in cents
    },
    quantity: item.quantity,
  }))
}

function normalizeCartForPayPal(line_items) {
  if (!Array.isArray(line_items) || line_items.length === 0) {
    throw new Error('Cart is empty or invalid')
  }

  const items = line_items.map((item) => ({
    name: item.name,
    currency: (item.currency || 'EUR').toUpperCase(),
    price: (item.unit_amount / 100).toFixed(2),
    quantity: String(item.quantity),
  }))

  const total = items.reduce((sum, it) => {
    const priceNum = parseFloat(it.price)
    const qtyNum = parseInt(it.quantity, 10)
    return sum + priceNum * qtyNum
  }, 0)

  return {
    items,
    currency: items[0].currency,
    total: total.toFixed(2),
  }
}

// ========= STRIPE CHECKOUT =========
app.post('/api/checkout/stripe', async (req, res) => {
  try {
    const { line_items } = req.body

    const stripeLineItems = normalizeCartForStripe(line_items)

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: stripeLineItems,
      success_url: process.env.FRONTEND_URL + '/success',
      cancel_url: process.env.FRONTEND_URL + '/cancel',
      currency: 'eur',
    })

    return res.json({
      ok: true,
      provider: 'stripe',
      checkout_url: session.url,
    })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return res.status(400).json({
      ok: false,
      error: String(err.message || err),
    })
  }
})

// ========= PAYPAL CHECKOUT =========
app.post('/api/checkout/paypal', (req, res) => {
  try {
    const { line_items } = req.body
    const ppCart = normalizeCartForPayPal(line_items)

    const create_payment_json = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal',
      },
      redirect_urls: {
        return_url: process.env.FRONTEND_URL + '/success',
        cancel_url: process.env.FRONTEND_URL + '/cancel',
      },
      transactions: [
        {
          item_list: {
            items: ppCart.items,
          },
          amount: {
            currency: ppCart.currency,
            total: ppCart.total,
          },
          description: 'IZ HAIR TREND order',
        },
      ],
    }

    paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
        console.error('PayPal checkout error:', error.response || error)
        return res.status(400).json({
          ok: false,
          error: String(
            (error.response && error.response.message) ||
              error.message ||
              error
          ),
        })
      } else {
        const approvalLinkObj = payment.links.find(
          (l) => l.rel === 'approval_url'
        )

        if (!approvalLinkObj) {
          return res.status(500).json({
            ok: false,
            error: 'No approval_url from PayPal',
          })
        }

        return res.json({
          ok: true,
          provider: 'paypal',
          checkout_url: approvalLinkObj.href,
        })
      }
    })
  } catch (err) {
    console.error('PayPal route error:', err)
    return res.status(400).json({
      ok: false,
      error: String(err.message || err),
    })
  }
})

const port = process.env.PORT || 5000
app.listen(port, () => {
  console.log(`Payments server running on :${port}`)
})
