import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import Stripe from 'stripe'
import paypal from 'paypal-rest-sdk'
import nodemailer from 'nodemailer'
import bodyParser from 'body-parser'

dotenv.config()

const app = express()

// CORS for frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
}))

// For normal JSON routes:
app.use('/api', bodyParser.json())

// Stripe init
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
})

// PayPal init
paypal.configure({
  mode: process.env.PAYPAL_MODE || 'sandbox',
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET,
})

// email transport (owner notification)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

async function notifyOwnerByEmail(orderData) {
  try {
    const info = await transporter.sendMail({
      from: `"IZ HAIR TREND Shop" <${process.env.SMTP_USER}>`,
      to: process.env.NOTIFY_EMAIL_TO,
      subject: `Новый заказ на сумму €${orderData.total}`,
      text: [
        `Новый заказ 💸`,
        ``,
        `Сумма: €${orderData.total}`,
        `Метод оплаты: ${orderData.method}`,
        ``,
        `Позиции:`,
        ...orderData.items.map(
          it => `- ${it.name} x${it.quantity} = €${(it.price * it.quantity).toFixed(2)}`
        ),
        ``,
        orderData.customerEmail
          ? `Email клиента: ${orderData.customerEmail}`
          : `Email клиента: (не указал)`,
        orderData.customerInstagram
          ? `Instagram: ${orderData.customerInstagram}`
          : '',
        orderData.customerPhone
          ? `Phone: ${orderData.customerPhone}`
          : '',
      ].join('\n'),
    })
    console.log('Email sent:', info.messageId)
  } catch (err) {
    console.error('Email send error:', err)
  }
}

// helper: convert frontend cart → stripe/paypal format
function normalizeCartForStripe(line_items) {
  if (!Array.isArray(line_items) || line_items.length === 0) {
    throw new Error('Cart is empty or invalid')
  }
  return line_items.map(item => ({
    price_data: {
      currency: item.currency || 'eur',
      product_data: {
        name: item.name,
      },
      unit_amount: item.unit_amount, // cents
    },
    quantity: item.quantity,
  }))
}

function normalizeCartForPayPal(line_items) {
  if (!Array.isArray(line_items) || line_items.length === 0) {
    throw new Error('Cart is empty or invalid')
  }
  const items = line_items.map(item => ({
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

// === STRIPE CHECKOUT ===
// client POST /api/checkout/stripe { line_items, customer_hint }
app.post('/api/checkout/stripe', async (req, res) => {
  try {
    const { line_items, customer_hint } = req.body
    const stripeLineItems = normalizeCartForStripe(line_items)

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: stripeLineItems,
      success_url: process.env.FRONTEND_URL + '/success',
      cancel_url: process.env.FRONTEND_URL + '/cancel',
      currency: 'eur',
      metadata: {
        customer_name: customer_hint?.name || '',
        customer_email: customer_hint?.email || '',
        customer_instagram: customer_hint?.instagram || '',
        customer_phone: customer_hint?.phone || '',
      }
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

// === PAYPAL CHECKOUT ===
// client POST /api/checkout/paypal { line_items, customer_hint }
app.post('/api/checkout/paypal', (req, res) => {
  try {
    const { line_items, customer_hint } = req.body
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
          item_list: { items: ppCart.items },
          amount: {
            currency: ppCart.currency,
            total: ppCart.total,
          },
          description: 'IZ HAIR TREND order',
          custom: JSON.stringify({
            customer_name: customer_hint?.name || '',
            customer_email: customer_hint?.email || '',
            customer_instagram: customer_hint?.instagram || '',
            customer_phone: customer_hint?.phone || '',
          }),
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
        const approvalLinkObj = payment.links.find(l => l.rel === 'approval_url')
        if (!approvalLinkObj) {
          return res.status(500).json({ ok: false, error: 'No approval_url from PayPal' })
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

// ---- Stripe webhook ----
// needs raw body parsing:
app.post(
  '/webhook/stripe',
  bodyParser.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature']
    let event
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      console.error('Stripe webhook signature error:', err.message)
      return res.status(400).send(`Webhook Error: ${err.message}`)
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object

      const totalEur = session.amount_total
        ? (session.amount_total / 100).toFixed(2)
        : '0.00'

      const orderData = {
        method: 'Stripe',
        total: totalEur,
        items: [], // можно загрузить line items Stripe API, если надо
        customerEmail: session.customer_details?.email || session.metadata?.customer_email || null,
        customerInstagram: session.metadata?.customer_instagram || null,
        customerPhone: session.metadata?.customer_phone || null,
      }

      console.log('Stripe PAYMENT CONFIRMED ✅', orderData)
      await notifyOwnerByEmail(orderData)
    }

    res.json({ received: true })
  }
)

// ---- PayPal webhook ----
// NOTE: for production you'd verify the signature with PayPal.
// For MVP/demo we just log and email.
app.post('/webhook/paypal', bodyParser.json(), async (req, res) => {
  const body = req.body
  console.log('PayPal webhook raw:', body)

  if (
    body &&
    body.event_type === 'PAYMENT.SALE.COMPLETED' &&
    body.resource
  ) {
    const sale = body.resource
    const total = sale.amount?.total
    const currency = sale.amount?.currency
    const payerEmail =
      sale.payer && sale.payer.payer_info
        ? sale.payer.payer_info.email
        : null

    const orderData = {
      method: 'PayPal',
      total: total ? `${total}` : 'unknown',
      items: [],
      customerEmail: payerEmail,
      customerInstagram: null,
      customerPhone: null,
    }

    console.log('PayPal PAYMENT CONFIRMED ✅', orderData)
    await notifyOwnerByEmail(orderData)
  }

  res.json({ received: true })
})

// quick test endpoint to force-send email manually
app.post('/test/email', bodyParser.json(), async (req, res) => {
  try {
    await notifyOwnerByEmail({
      method: 'TEST',
      total: '123.45',
      items: [
        { name: 'Demo Product', quantity: 2, price: 19.99 },
        { name: 'Something Else', quantity: 1, price: 12.5 },
      ],
      customerEmail: 'testbuyer@example.com',
      customerInstagram: '@test_ig',
      customerPhone: '+37060000000',
    })
    res.json({ ok: true, sent: true })
  } catch (err) {
    console.error('test/email error:', err)
    res.status(500).json({ ok: false, error: String(err.message || err) })
  }
})

const port = process.env.PORT || 5000
app.listen(port, () => {
  console.log(`Payments server running on :${port}`)
})
