"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { LayoutDashboard, Package, Users, CreditCard, FileText, Bell, Settings, LogOut, Menu, X } from "lucide-react";

const ADMIN_EMAIL = "ahardoi30@gmail.com";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [active, setActive] = useState("Dashboard");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) { router.push("/login"); return; }
      if (u.email !== ADMIN_EMAIL) { router.push("/vle"); return; }
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  async function handleLogout() {
    await signOut(auth);
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { icon: <Package size={20} />, label: "Services" },
    { icon: <FileText size={20} />, label: "Applications" },
    { icon: <CreditCard size={20} />, label: "Payments" },
    { icon: <Users size={20} />, label: "VLE Users" },
    { icon: <Bell size={20} />, label: "Notifications" },
    { icon: <Settings size={20} />, label: "Settings" },
  ];

  const stats = [
    { label: "Total VLE", value: "0", color: "from-blue-500 to-blue-700" },
    { label: "Total Services", value: "0", color: "from-purple-500 to-purple-700" },
    { label: "Applications", value: "0", color: "from-green-500 to-green-700" },
    { label: "Successful Payments", value: "0", color: "from-emerald-500 to-emerald-700" },
    { label: "Pending Payments", value: "0", color: "from-amber-500 to-amber-700" },
    { label: "Failed Payments", value: "0", color: "from-red-500 to-red-700" },
    { label: "Today's Applications", value: "0", color: "from-indigo-500 to-indigo-700" },
    { label: "Today's Revenue", value: "₹0", color: "from-pink-500 to-pink-700" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 fixed h-full">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold">A</div>
          <div>
            <h1 className="font-bold">Anureet</h1>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((m, i) => (
            <button key={i} onClick={() => setActive(m.label)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${active === m.label ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-50"}`}>
              {m.icon}
              <span>{m.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-medium">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)}></div>
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white animate-fade-in">
            <div className="p-6 border-b flex items-center justify-between">
              <span className="font-bold">Anureet Admin</span>
              <button onClick={() => setSidebarOpen(false)}><X size={20} /></button>
            </div>
            <nav className="p-4 space-y-1">
              {menuItems.map((m, i) => (
                <button key={i} onClick={() => { setActive(m.label); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${active === m.label ? "bg-brand-50 text-brand-700" : "text-gray-600"}`}>
                  {m.icon}
                  <span>{m.label}</span>
                </button>
              ))}
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 font-medium mt-4">
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </nav>
          </aside>
        </div>
      )}

      <main className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100 px-4 py-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2"><Menu size={20} /></button>
          <h2 className="font-bold text-lg">{active}</h2>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold">{user?.email}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold">
              {user?.email?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8">
          {active === "Dashboard" && (
            <>
              <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, Admin 👋</h1>
                <p className="text-gray-600">Here's what's happening with your platform today.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {stats.map((s, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg transition-all animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} mb-3`}></div>
                    <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                    <p className="text-2xl font-bold">{s.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
                <div className="text-center py-12 text-gray-400">
                  <FileText size={48} className="mx-auto mb-3 opacity-40" />
                  <p>No activity yet. Add services to get started.</p>
                </div>
              </div>
            </>
          )}

          {active !== "Dashboard" && (
            <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
              <Package size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="font-bold text-xl mb-2">{active}</h3>
              <p className="text-gray-500">This section is under development.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
