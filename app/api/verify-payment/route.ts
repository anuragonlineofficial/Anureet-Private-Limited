import { NextResponse } from "next/server";
import { Cashfree } from "cashfree-pg";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("order_id");

    if (!orderId) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 });
    }

    Cashfree.XClientId = process.env.CASHFREE_APP_ID!;
    Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY!;
    Cashfree.XEnvironment =
      process.env.CASHFREE_ENV === "production"
        ? Cashfree.Environment.PRODUCTION
        : Cashfree.Environment.SANDBOX;

    const response = await Cashfree.PGOrderFetchPayments("2023-08-01", orderId);
    const payments = response.data || [];
    const success = payments.find((p: any) => p.payment_status === "SUCCESS");

    if (success) {
      // Send Telegram notification (non-blocking)
      const msg = `✅ *Payment Success*\n\nOrder ID: ${orderId}\nAmount: ₹${success.payment_amount}\nPayment ID: ${success.cf_payment_id}`;
      await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: msg, parse_mode: "Markdown" }),
      }).catch(() => {});

      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/vle?payment=success&orderId=${orderId}`);
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/vle?payment=failed&orderId=${orderId}`);
  } catch (error: any) {
    console.error("Verify error:", error?.response?.data || error.message);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/vle?payment=error`);
  }
}
