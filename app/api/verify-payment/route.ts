import { NextResponse } from "next/server";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
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

export async function GET(req: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL as string;
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("order_id");
    if (!orderId) {
      return NextResponse.redirect(`${baseUrl}/vle?payment=error`);
    }

    const payRef = doc(db, "payments", orderId);
    const paySnap = await getDoc(payRef);
    if (!paySnap.exists()) {
      return NextResponse.redirect(`${baseUrl}/vle?payment=error`);
    }

    const payment = paySnap.data();

    if (payment.paymentStatus === "SUCCESS" && payment.applicationId) {
      return NextResponse.redirect(
        `${baseUrl}/vle?payment=success&orderId=${orderId}`
      );
    }

    Cashfree.XClientId = process.env.CASHFREE_APP_ID as string;
    Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY as string;
    Cashfree.XEnvironment =
      process.env.CASHFREE_ENV === "production"
        ? Cashfree.Environment.PRODUCTION
        : Cashfree.Environment.SANDBOX;

    const response = await Cashfree.PGOrderFetchPayments(
      "2023-08-01",
      orderId
    );
    const payments = response.data || [];
    const success = (payments as any[]).find(
      (p: any) => p.payment_status === "SUCCESS"
    );

    if (!success) {
      await updateDoc(payRef, {
        paymentStatus: "FAILED",
        applicationStatus: "CANCELLED",
        updatedAt: new Date().toISOString(),
      });
      return NextResponse.redirect(
        `${baseUrl}/vle?payment=failed&orderId=${orderId}`
      );
    }

    if (Number(success.payment_amount) !== Number(payment.amount)) {
      await updateDoc(payRef, {
        paymentStatus: "FAILED",
        applicationStatus: "CANCELLED",
        updatedAt: new Date().toISOString(),
      });
      return NextResponse.redirect(
        `${baseUrl}/vle?payment=failed&orderId=${orderId}`
      );
    }

    const applicationId = `APP_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;

    await setDoc(doc(db, "applications", applicationId), {
      applicationId,
      vleId: payment.vleId,
      serviceId: payment.serviceId,
      serviceName: payment.serviceName,
      formData: payment.formData,
      amount: payment.amount,
      paymentOrderId: orderId,
      paymentId: success.cf_payment_id,
      paymentStatus: "SUCCESS",
      applicationStatus: "SUBMITTED",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await updateDoc(payRef, {
      paymentStatus: "SUCCESS",
      applicationStatus: "SUBMITTED",
      paymentId: success.cf_payment_id,
      applicationId,
      updatedAt: new Date().toISOString(),
    });

    try {
      const msg = `✅ *New Payment Received*\n\n*App ID:* ${applicationId}\n*Service:* ${payment.serviceName}\n*Amount:* ₹${payment.amount}\n*Order ID:* ${orderId}\n*Payment ID:* ${success.cf_payment_id}`;
      await fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text: msg,
            parse_mode: "Markdown",
          }),
        }
      );
    } catch {
      // Telegram failure should not break flow
    }

    return NextResponse.redirect(
      `${baseUrl}/vle?payment=success&orderId=${orderId}`
    );
  } catch (error: any) {
    console.error(
      "Verify error:",
      error?.response?.data || error?.message || error
    );
    return NextResponse.redirect(`${baseUrl}/vle?payment=error`);
  }
}
