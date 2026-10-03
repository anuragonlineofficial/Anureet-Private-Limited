export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { uid, orderId } = req.body

  try {
    // Send Telegram notification to admin
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID

    if (botToken && chatId) {
      const message = `🎉 <b>New Signup!</b>\n\nUser ID: <code>${uid}</code>\nOrder: <code>${orderId}</code>\n\nKYC + Payment done. Please review and approve.`
      
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

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Notify error:', err)
    return res.status(500).json({ error: err.message })
  }
}