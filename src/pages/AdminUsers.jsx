import { RefreshCcw, Search, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api.js";

const emptyForm = {
  sibsId: "",
  fullName: "",
  email: "",
  username: "",
  password: "",
  role: "user",
  status: "active",
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    try {
      const data = await apiFetch(`/admin/users?search=${encodeURIComponent(search)}`);
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message || "Failed to load users.");
    }
  }

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [search]);

  async function createUser(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await apiFetch("/admin/users", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setMessage("User account created.");
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err.message || "Failed to create user.");
    } finally {
      setLoading(false);
    }
  }

  async function resetDevice(userId) {
    if (!confirm("Reset this user's registered device?")) return;
    setError("");
    setMessage("");
    try {
      await apiFetch(`/admin/users/${userId}/reset-device`, { method: "POST" });
      setMessage("Device reset successfully.");
      await load();
    } catch (err) {
      setError(err.message || "Failed to reset device.");
    }
  }

  async function updateStatus(userId, status) {
    try {
      await apiFetch(`/admin/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (err) {
      setError(err.message || "Failed to update status.");
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-[#FF5C28]">
            <UserPlus className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-[#FF5C28]">Admin</p>
            <h2 className="text-2xl font-extrabold text-[#0D4676]">Create User Account</h2>
          </div>
        </div>

        {message && <div className="mb-4 rounded-2xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700">{message}</div>}
        {error && <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}

        <form onSubmit={createUser} className="grid gap-4 lg:grid-cols-4">
          <Input label="SIBS ID" value={form.sibsId} onChange={(v) => setForm({ ...form, sibsId: v })} />
          <Input label="Full Name" value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} required />
          <Input label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <Input label="Username" value={form.username} onChange={(v) => setForm({ ...form, username: v })} required />
          <Input label="Password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} required />
          <Select label="Role" value={form.role} onChange={(v) => setForm({ ...form, role: v })} options={["user", "admin"]} />
          <Select label="Status" value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={["active", "inactive"]} />
          <div className="flex items-end">
            <button disabled={loading} className="w-full rounded-2xl bg-[#FF5C28] px-4 py-3 text-sm font-extrabold text-white hover:bg-orange-600 disabled:opacity-60">
              {loading ? "Creating..." : "Create Account"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-[30px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-[#0D4676]">User Accounts</h2>
            <p className="text-sm font-semibold text-slate-500">Manage account status and device locks.</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 lg:w-96">
            <Search className="h-5 w-5 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="w-full bg-transparent text-sm font-semibold outline-none" />
          </div>
        </div>

        <div className="overflow-x-auto sibs-scrollbar">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Device</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-slate-100">
                  <td className="px-4 py-4">
                    <p className="font-extrabold text-slate-900">{user.fullName}</p>
                    <p className="text-xs font-semibold text-slate-500">{user.sibsId || "No SIBS ID"} {user.email ? `• ${user.email}` : ""}</p>
                  </td>
                  <td className="px-4 py-4 font-bold text-slate-600">{user.username}</td>
                  <td className="px-4 py-4"><Capsule>{user.role}</Capsule></td>
                  <td className="px-4 py-4">
                    <select value={user.status} onChange={(e) => updateStatus(user.id, e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold outline-none">
                      <option value="active">active</option>
                      <option value="inactive">inactive</option>
                    </select>
                  </td>
                  <td className="px-4 py-4">
                    <p className="max-w-[260px] truncate font-semibold text-slate-600">{user.deviceId ? "Registered" : "No device"}</p>
                    <p className="text-xs font-semibold text-slate-400">{user.deviceLastSeen ? new Date(user.deviceLastSeen).toLocaleString() : "—"}</p>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button onClick={() => resetDevice(user.id)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-extrabold text-[#0D4676] hover:border-[#FF5C28] hover:text-[#FF5C28]">
                      <RefreshCcw className="h-4 w-4" /> Reset Device
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!users.length && <div className="py-10 text-center font-bold text-slate-400">No users found.</div>}
        </div>
      </section>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", required = false }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-extrabold text-slate-700">{label}</span>
      <input required={required} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#0D4676]" />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-extrabold text-slate-700">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#0D4676]">
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function Capsule({ children }) {
  return <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold uppercase text-[#0D4676]">{children}</span>;
}
