"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db, ADMIN_EMAIL } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import Link from "next/link";
import {
  LayoutDashboard, Package, FileText, CreditCard, User, Bell, LogOut,
  Menu, X, Loader2, ArrowRight,
} from "lucide-react";

interface Service {
  id: string; name: string; category: string; description: string;
  price: number; active: boolean;
}

export default function VLEDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [active, setActive] = useState("Dashboard");
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) { router.push("/login"); return; }
      if (u.email === ADMIN_EMAIL) { router.push("/admin"); return; }
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    if (!loading) loadServices();
  }, [loading]);

  async function loadServices() {
    setLoadingServices(true);
    try {
      const q = query(collection(db, "services"), where("active", "==", true));
      const snap = await getDocs(q);
      setServices(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Service)));
    } catch {
      setServices([]);
    } finally {
      setLoadingServices(false);
    }
  }

  async function handleLogout() {
    await signOut(auth);
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-600" size={40} />
      </div>
    );
  }

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { icon: <Package size={20} />, label: "Available Services" },
    { icon: <FileText size={20} />, label: "My Applications" },
    { icon: <CreditCard size={20} />, label: "Payment History" },
    { icon: <Bell size={20} />, label: "Notifications" },
    { icon: <User size={20} />, label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 fixed h-full">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold">A</div>
          <div>
            <h1 className="font-bold">Anureet</h1>
            <p className="text-xs text-gray-500">VLE Panel</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((m) => (
            <button key={m.label} onClick={() => setActive(m.label)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${active === m.label ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-50"}`}>
              {m.icon}<span>{m.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-medium">
            <LogOut size={20} /><span>Logout</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)}></div>
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white animate-fade-in">
            <div className="p-6 border-b flex items-center justify-between">
              <span className="font-bold">Anureet VLE</span>
              <button onClick={() => setSidebarOpen(false)}><X size={20} /></button>
            </div>
            <nav className="p-4 space-y-1">
              {menuItems.map((m) => (
                <button key={m.label} onClick={() => { setActive(m.label); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${active === m.label ? "bg-brand-50 text-brand-700" : "text-gray-600"}`}>
                  {m.icon}<span>{m.label}</span>
                </button>
              ))}
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 font-medium mt-4">
                <LogOut size={20} /><span>Logout</span>
              </button>
            </nav>
          </aside>
        </div>
      )}

      <main className="flex-1 lg:ml-64 min-w-0">
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100 px-4 py-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2"><Menu size={20} /></button>
          <h2 className="font-bold text-lg">{active}</h2>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold truncate max-w-[180px]">{user?.email}</p>
              <p className="text-xs text-gray-500">VLE Operator</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold">
              {user?.email?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8">
          {active === "Dashboard" && (
            <>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome, VLE 👋</h1>
              <p className="text-gray-600 mb-8">Browse and apply for services below.</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Available Services", value: services.length, color: "from-blue-500 to-blue-700" },
                  { label: "Total Applications", value: 0, color: "from-purple-500 to-purple-700" },
                  { label: "Pending", value: 0, color: "from-amber-500 to-amber-700" },
                  { label: "Completed", value: 0, color: "from-green-500 to-green-700" },
                ].map((s, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} mb-3`}></div>
                    <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                    <p className="text-2xl font-bold">{s.value}</p>
                  </div>
                ))}
              </div>
              <h2 className="text-xl font-bold mb-4">Available Services</h2>
              <ServiceGrid services={services} loading={loadingServices} />
            </>
          )}

          {active === "Available Services" && (
            <>
              <h1 className="text-2xl font-bold mb-6">All Available Services</h1>
              <ServiceGrid services={services} loading={loadingServices} />
            </>
          )}

          {active !== "Dashboard" && active !== "Available Services" && (
            <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
              <Package size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="font-bold text-xl mb-2">{active}</h3>
              <p className="text-gray-500">Coming soon in next update.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function ServiceGrid({ services, loading }: { services: Service[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse">
            <div className="w-12 h-12 bg-gray-200 rounded-xl mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-100 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-100 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
        <Package size={48} className="mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500">No services available right now.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {services.map((s) => (
        <div key={s.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center mb-4">
            <Package size={22} />
          </div>
          <h3 className="font-bold text-base mb-1">{s.name}</h3>
          <p className="text-xs text-gray-500 mb-2">{s.category}</p>
          {s.description && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{s.description}</p>}
          <p className="text-brand-600 font-bold text-2xl mb-4">₹{s.price}</p>
          <Link href={`/vle/apply/${s.id}`}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 active:scale-95 transition-all">
            Apply Now <ArrowRight size={16} />
          </Link>
        </div>
      ))}
    </div>
  );
}
