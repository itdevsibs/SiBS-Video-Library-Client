import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clapperboard, Lock, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(form);
      navigate(user.role === "admin" ? "/admin/videos" : "/videos", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative overflow-hidden rounded-[38px] bg-[#0D4676] p-8 text-white shadow-card lg:p-12">
          <div className="absolute right-[-80px] top-[-80px] h-64 w-64 rounded-full bg-white/10" />
          <div className="absolute bottom-[-120px] left-[-120px] h-80 w-80 rounded-full bg-[#FF5C28]/30" />
          <div className="relative z-10">
            <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/15">
              <Clapperboard className="h-8 w-8" />
            </div>
            <p className="text-sm font-extrabold uppercase tracking-[0.28em] text-orange-200">Private Learning Portal</p>
            <h1 className="mt-4 max-w-xl text-4xl font-extrabold leading-tight lg:text-6xl">
              SIBS Academy Video Library
            </h1>
            <p className="mt-5 max-w-lg text-base font-medium leading-8 text-blue-100">
              Watch internal training videos in a protected, user-friendly, one-device-per-account portal tailored for the SIBS design system.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {['Protected Playback', 'Device Lock', 'Watermarked Videos'].map((item) => (
                <div key={item} className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold backdrop-blur">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[34px] bg-white p-6 shadow-card ring-1 ring-slate-200 sm:p-8">
          <div className="mb-8">
            <p className="text-sm font-extrabold uppercase tracking-[0.25em] text-[#FF5C28]">Welcome back</p>
            <h2 className="mt-2 text-3xl font-extrabold text-[#0D4676]">Login to continue</h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">Use your assigned SIBS Academy account.</p>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-extrabold text-slate-700">Username / SIBS ID / Email</span>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-[#0D4676]">
                <UserRound className="h-5 w-5 text-slate-400" />
                <input
                  value={form.username}
                  onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                  className="w-full bg-transparent font-semibold text-slate-900 outline-none"
                  placeholder="Enter username, SIBS ID, or email"
                  autoComplete="username"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-extrabold text-slate-700">Password</span>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-[#0D4676]">
                <Lock className="h-5 w-5 text-slate-400" />
                <input
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  type="password"
                  className="w-full bg-transparent font-semibold text-slate-900 outline-none"
                  placeholder="Enter password"
                  autoComplete="current-password"
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#FF5C28] px-5 py-4 text-sm font-extrabold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-5 text-center text-xs font-semibold text-slate-400">
            This account will be locked to the first device used for login.
          </p>
        </section>
      </div>
    </div>
  );
}
