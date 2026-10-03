export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { order_id } = req.body

  try {
    const response = await fetch(`https://api.cashfree.com/pg/orders/${order_id}`, {
      method: 'GET',
      headers: {
        'x-api-version': '2023-08-01',
        'x-client-id': process.env.CASHFREE_APP_ID,
        'x-client-secret': process.env.CASHFREE_SECRET_KEY
      }
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message })
    }

    return res.status(200).json({
      order_status: data.order_status,
      order_id: data.order_id,
      order_amount: data.order_amount,
      customer_details: data.customer_details
    })
  } catch (err) {
    console.error('Verify error:', err)
    return res.status(500).json({ error: err.message })
  }
}