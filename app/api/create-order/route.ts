import { NextResponse } from "next/server";
import { Cashfree } from "cashfree-pg";

export async function POST(req: Request) {
  try {
    const { serviceId, amount, userId, formData } = await req.json();

    if (!serviceId || !amount || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const orderId = `ORD_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    Cashfree.XClientId = process.env.CASHFREE_APP_ID!;
    Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY!;
    Cashfree.XEnvironment =
      process.env.CASHFREE_ENV === "production"
        ? Cashfree.Environment.PRODUCTION
        : Cashfree.Environment.SANDBOX;

    const response = await Cashfree.PGCreateOrder("2023-08-01", {
      order_amount: amount,
      order_currency: "INR",
      order_id: orderId,
      customer_details: { customer_id: userId },
      order_meta: {
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/verify-payment?order_id={order_id}`,
      },
    });

    return NextResponse.json({
      orderId,
      paymentSessionId: response.data.payment_session_id,
    });
  } catch (error: any) {
    console.error("Cashfree order error:", error?.response?.data || error.message);
    return NextResponse.json({ error: "Order creation failed" }, { status: 500 });
  }
}
