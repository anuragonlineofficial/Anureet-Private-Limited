import { NextResponse } from "next/server";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { Cashfree } from "cashfree-pg";

export const runtime = "nodejs";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { serviceId, userId, formData } = body;

    if (!serviceId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const serviceSnap = await getDoc(doc(db, "services", serviceId));
    if (!serviceSnap.exists()) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }
    const service = serviceSnap.data();
    if (!service.active) {
      return NextResponse.json(
        { error: "Service not available" },
        { status: 400 }
      );
    }

    const trustedAmount = Number(service.price);
    if (!trustedAmount || trustedAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid service price" },
        { status: 400 }
      );
    }

    const orderId = `ORD_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;

    await setDoc(doc(db, "payments", orderId), {
      orderId,
      vleId: userId,
      serviceId,
      serviceName: service.name,
      formData: formData || {},
      amount: trustedAmount,
      paymentStatus: "PENDING",
      applicationStatus: "PAYMENT_PENDING",
      createdAt: new Date().toISOString(),
    });

    Cashfree.XClientId = process.env.CASHFREE_APP_ID as string;
    Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY as string;
    Cashfree.XEnvironment =
      process.env.CASHFREE_ENV === "production"
        ? Cashfree.Environment.PRODUCTION
        : Cashfree.Environment.SANDBOX;

    const response = await Cashfree.PGCreateOrder("2023-08-01", {
      order_amount: trustedAmount,
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
    console.error(
      "Create order error:",
      error?.response?.data || error?.message || error
    );
    return NextResponse.json(
      { error: "Order creation failed" },
      { status: 500 }
    );
  }
}
