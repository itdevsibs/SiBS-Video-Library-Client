import { Clapperboard, ShieldCheck, Users, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { apiFetch } from "../lib/api.js";
import StatCard from "../components/StatCard.jsx";

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!isAdmin) return;
    apiFetch("/admin/stats").then(setStats).catch(() => setStats(null));
  }, [isAdmin]);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[34px] bg-[#0D4676] p-7 text-white shadow-card sm:p-9">
        <p className="text-sm font-extrabold uppercase tracking-[0.25em] text-orange-200">SIBS Academy</p>
        <h2 className="mt-3 text-3xl font-extrabold">Welcome, {user?.fullName}</h2>
        <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-blue-100">
          This portal is designed for secure internal video learning with protected playback, watch logging, watermarking, and one-device account control.
        </p>
      </section>

      {isAdmin ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Users" value={stats?.users ?? "—"} icon={Users} />
            <StatCard label="Videos" value={stats?.videos ?? "—"} icon={Video} />
            <StatCard label="Published" value={stats?.publishedVideos ?? "—"} icon={Clapperboard} />
            <StatCard label="Watch Logs" value={stats?.watchLogs ?? "—"} icon={ShieldCheck} />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <AdminShortcut to="/admin/users" title="Create Accounts" description="Add user accounts and reset registered devices." />
            <AdminShortcut to="/admin/videos" title="Upload Videos" description="Upload MP4 videos and manage publishing status." />
            <AdminShortcut to="/admin/activity-logs" title="View Logs" description="Check video progress and completed viewing records." />
          </div>
        </>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Link to="/videos" className="rounded-[30px] bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:shadow-card">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-[#FF5C28]">
              <Clapperboard className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-extrabold text-[#0D4676]">View Training Videos</h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">Open your available video library and continue watching where you stopped.</p>
          </Link>
          <div className="rounded-[30px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#0D4676]">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-extrabold text-[#0D4676]">Device Protected</h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">Your account is intended for one device only. Ask the admin to reset if you change devices.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminShortcut({ to, title, description }) {
  return (
    <Link to={to} className="rounded-[30px] bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-card">
      <h3 className="text-lg font-extrabold text-[#0D4676]">{title}</h3>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{description}</p>
    </Link>
  );
}
