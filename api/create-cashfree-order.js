export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { order_amount, order_currency, customer_details, order_meta } = req.body

  try {
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Use PRODUCTION Cashfree API
    const response = await fetch('https://api.cashfree.com/pg/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': process.env.CASHFREE_APP_ID,
        'x-client-secret': process.env.CASHFREE_SECRET_KEY
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount,
        order_currency,
        customer_details,
        order_meta: {
          return_url: order_meta.return_url.replace('{order_id}', orderId)
        }
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Cashfree error:', data)
      return res.status(response.status).json({ error: data.message || 'Failed to create order' })
    }

    // Send Telegram notification to admin
    try {
      await sendTelegramNotification(orderId, customer_details, order_amount)
    } catch (e) {
      console.error('Telegram notify failed:', e)
    }

    return res.status(200).json({
      payment_session_id: data.payment_session_id,
      order_id: orderId
    })
  } catch (err) {
    console.error('Server error:', err)
    return res.status(500).json({ error: err.message })
  }
}

async function sendTelegramNotification(orderId, customer, amount) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!botToken || !chatId) return

  const message = `🎉 <b>New Signup Payment</b>\n\n` +
    `Order: <code>${orderId}</code>\n` +
    `Name: ${customer.customer_name}\n` +
    `Email: ${customer.customer_email}\n` +
    `Phone: ${customer.customer_phone}\n` +
    `Amount: ₹${amount}\n\n` +
    `Check admin panel for details.`

  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML'
    })
  })
}