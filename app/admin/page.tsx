"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db, ADMIN_EMAIL } from "@/lib/firebase";
import {
  collection, addDoc, getDocs, doc, updateDoc, deleteDoc,
  serverTimestamp, query, orderBy,
} from "firebase/firestore";
import {
  LayoutDashboard, Package, Users, CreditCard, FileText, Bell, Settings,
  LogOut, Menu, X, Plus, Trash2, Edit, Loader2, Save, ToggleLeft, ToggleRight,
} from "lucide-react";

interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  active: boolean;
  fields: { name: string; label: string; type: string; required: boolean }[];
}

const DEFAULT_FIELDS = [
  { name: "fullName", label: "Full Name", type: "text", required: true },
  { name: "mobile", label: "Mobile Number", type: "tel", required: true },
  { name: "address", label: "Address", type: "textarea", required: true },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [active, setActive] = useState("Dashboard");
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);

  // Service form
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "", category: "General", description: "", price: 0, active: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) { router.push("/login"); return; }
      if (u.email !== ADMIN_EMAIL) { router.push("/vle"); return; }
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  async function loadServices() {
    setLoadingServices(true);
    try {
      const q = query(collection(db, "services"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setServices(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Service)));
    } catch {
      setServices([]);
    } finally {
      setLoadingServices(false);
    }
  }

  useEffect(() => { if (!loading) loadServices(); }, [loading]);

  async function handleSave() {
    if (!formData.name || formData.price <= 0) {
      alert("Service name and price required");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, "services", editingId), {
          ...formData, updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "services"), {
          ...formData,
          fields: DEFAULT_FIELDS,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: "", category: "General", description: "", price: 0, active: true });
      await loadServices();
    } catch (e) {
      alert("Failed to save service");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(s: Service) {
    await updateDoc(doc(db, "services", s.id), { active: !s.active, updatedAt: serverTimestamp() });
    loadServices();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this service?")) return;
    await deleteDoc(doc(db, "services", id));
    loadServices();
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
    { icon: <Package size={20} />, label: "Services" },
    { icon: <FileText size={20} />, label: "Applications" },
    { icon: <CreditCard size={20} />, label: "Payments" },
    { icon: <Users size={20} />, label: "VLE Users" },
    { icon: <Bell size={20} />, label: "Notifications" },
    { icon: <Settings size={20} />, label: "Settings" },
  ];

  const stats = [
    { label: "Total Services", value: services.length, color: "from-purple-500 to-purple-700" },
    { label: "Active Services", value: services.filter(s => s.active).length, color: "from-green-500 to-green-700" },
    { label: "Total VLE", value: "0", color: "from-blue-500 to-blue-700" },
    { label: "Applications", value: "0", color: "from-emerald-500 to-emerald-700" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 fixed h-full">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold">A</div>
          <div>
            <h1 className="font-bold">Anureet</h1>
            <p className="text-xs text-gray-500">Admin Panel</p>
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

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)}></div>
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white animate-fade-in">
            <div className="p-6 border-b flex items-center justify-between">
              <span className="font-bold">Anureet Admin</span>
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
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, Admin 👋</h1>
              <p className="text-gray-600 mb-8">Here&apos;s your platform overview.</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} mb-3`}></div>
                    <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                    <p className="text-2xl font-bold">{s.value}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {active === "Services" && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold">Service Management</h1>
                  <p className="text-gray-600 text-sm">Create and manage your services</p>
                </div>
                <button onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: "", category: "General", description: "", price: 0, active: true }); }}
                  className="btn-primary text-sm">
                  <Plus size={16} /> Add Service
                </button>
              </div>

              {showForm && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 animate-fade-up">
                  <h3 className="font-bold text-lg mb-4">{editingId ? "Edit Service" : "Create New Service"}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1">Service Name *</label>
                      <input className="input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Ration Card" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Category</label>
                      <input className="input" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="General" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Price (₹) *</label>
                      <input type="number" className="input" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} min="1" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Status</label>
                      <select className="input" value={formData.active ? "1" : "0"} onChange={(e) => setFormData({ ...formData, active: e.target.value === "1" })}>
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-1">Description</label>
                      <textarea className="input" rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button onClick={handleSave} disabled={saving} className="btn-primary">
                      {saving ? <><Loader2 className="animate-spin" size={16} /> Saving...</> : <><Save size={16} /> Save Service</>}
                    </button>
                    <button onClick={() => { setShowForm(false); setEditingId(null); }} className="btn-secondary">Cancel</button>
                  </div>
                </div>
              )}

              {loadingServices ? (
                <div className="text-center py-12"><Loader2 className="animate-spin mx-auto text-brand-600" size={32} /></div>
              ) : services.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                  <Package size={48} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500">No services yet. Add your first service.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {services.map((s) => (
                    <div key={s.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center">
                          <Package size={22} />
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${s.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                          {s.active ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </div>
                      <h3 className="font-bold mb-1">{s.name}</h3>
                      <p className="text-xs text-gray-500 mb-2">{s.category}</p>
                      <p className="text-brand-600 font-bold text-xl mb-4">₹{s.price}</p>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingId(s.id); setFormData({ name: s.name, category: s.category, description: s.description, price: s.price, active: s.active }); setShowForm(true); }}
                          className="flex-1 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium flex items-center justify-center gap-1">
                          <Edit size={14} /> Edit
                        </button>
                        <button onClick={() => handleToggle(s)} className="flex-1 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium flex items-center justify-center gap-1">
                          {s.active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                          {s.active ? "Disable" : "Enable"}
                        </button>
                        <button onClick={() => handleDelete(s.id)} className="py-2 px-3 rounded-lg bg-red-50 hover:bg-red-100 text-red-600">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {active !== "Dashboard" && active !== "Services" && (
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
