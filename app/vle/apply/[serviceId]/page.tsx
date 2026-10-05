"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { auth, db, ADMIN_EMAIL } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { load } from "@cashfreepayments/cashfree-js";
import { ArrowLeft, Loader2, CreditCard, AlertCircle } from "lucide-react";
import Link from "next/link";

interface Field { name: string; label: string; type: string; required: boolean; }
interface Service {
  id: string; name: string; category: string; description: string;
  price: number; active: boolean; fields?: Field[];
}

export default function ApplyPage() {
  const router = useRouter();
  const params = useParams();
  const serviceId = params.serviceId as string;

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (!u) { router.push("/login"); return; }
      if (u.email === ADMIN_EMAIL) { router.push("/admin"); return; }
      setUser(u);
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    async function loadService() {
      try {
        const snap = await getDoc(doc(db, "services", serviceId));
        if (!snap.exists()) { router.push("/vle"); return; }
        const data = { id: snap.id, ...snap.data() } as Service;
        if (!data.active) { router.push("/vle"); return; }
        setService(data);
        const initial: Record<string, string> = {};
        (data.fields || []).forEach((f) => { initial[f.name] = ""; });
        setFormData(initial);
      } catch {
        router.push("/vle");
      } finally {
        setLoading(false);
      }
    }
    if (serviceId) loadService();
  }, [serviceId, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!service || !user) return;

    // Validate
    for (const f of service.fields || []) {
      if (f.required && !formData[f.name]?.trim()) {
        setError(`${f.label} is required`);
        return;
      }
    }

    setSubmitting(true);
    try {
      // 1. Create order via backend (server-side price fetch)
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service.id,
          userId: user.uid,
          formData,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.paymentSessionId) {
        throw new Error(data.error || "Order creation failed");
      }

      // 2. Open Cashfree checkout
      const cashfree = await load({ mode: "sandbox" });
      const checkoutOptions = {
        paymentSessionId: data.paymentSessionId,
        redirectTarget: "_self" as const,
      };
      cashfree.checkout(checkoutOptions);
    } catch (err: any) {
      setError(err.message || "Payment failed. Please try again.");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-600" size={40} />
      </div>
    );
  }

  if (!service) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/vle" className="inline-flex items-center gap-2 text-gray-600 hover:text-brand-600 mb-6 text-sm font-medium">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-semibold text-brand-600 uppercase mb-1">{service.category}</p>
              <h1 className="text-2xl font-bold">{service.name}</h1>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Fee</p>
              <p className="text-2xl font-bold text-brand-600">₹{service.price}</p>
            </div>
          </div>
          {service.description && <p className="text-gray-600 text-sm">{service.description}</p>}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-5">
          <h2 className="text-lg font-bold mb-2">Application Details</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex gap-2">
              <AlertCircle size={18} className="shrink-0 mt-0.5" /> {error}
            </div>
          )}

          {(service.fields || []).map((f) => (
            <div key={f.name}>
              <label className="block text-sm font-semibold mb-2">
                {f.label} {f.required && <span className="text-red-500">*</span>}
              </label>
              {f.type === "textarea" ? (
                <textarea
                  className="input"
                  rows={3}
                  value={formData[f.name] || ""}
                  onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })}
                  required={f.required}
                />
              ) : (
                <input
                  type={f.type}
                  className="input"
                  value={formData[f.name] || ""}
                  onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })}
                  required={f.required}
                  pattern={f.name === "mobile" ? "[0-9]{10}" : undefined}
                  maxLength={f.name === "mobile" ? 10 : undefined}
                />
              )}
            </div>
          ))}

          <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 flex items-start gap-3">
            <CreditCard className="text-brand-600 shrink-0 mt-0.5" size={20} />
            <div className="text-sm">
              <p className="font-semibold text-brand-900">Secure Payment via Cashfree</p>
              <p className="text-brand-700 text-xs mt-1">
                Your application will be submitted only after successful payment verification.
              </p>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? (
              <><Loader2 className="animate-spin" size={18} /> Processing...</>
            ) : (
              <>Pay ₹{service.price} &amp; Submit</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
