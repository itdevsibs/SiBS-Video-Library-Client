import { BookOpen, Clapperboard, Home, LogOut, Menu, ShieldCheck, Users, X } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

const userLinks = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/videos", label: "Videos", icon: Clapperboard },
];

const adminLinks = [
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/videos", label: "Manage Videos", icon: BookOpen },
  { to: "/admin/activity-logs", label: "Activity Logs", icon: ShieldCheck },
];

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);

  const links = isAdmin ? [...userLinks, ...adminLinks] : userLinks;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0D4676] text-white">
                <Clapperboard className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-extrabold text-[#0D4676]">SIBS Academy</p>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FF5C28]">Private Portal</p>
              </div>
            </div>
            <button className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 lg:hidden" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-2 px-4 py-5">
            {links.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                      isActive
                        ? "bg-[#0D4676] text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-[#0D4676]"
                    }`
                  }
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="border-t border-slate-100 p-4">
            <div className="mb-3 rounded-2xl bg-slate-50 p-4">
              <p className="truncate text-sm font-extrabold text-slate-900">{user?.fullName}</p>
              <p className="truncate text-xs font-semibold text-slate-500">{user?.sibsId || user?.username}</p>
              <p className="mt-2 inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-bold uppercase text-[#FF5C28]">
                {user?.role}
              </p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 hover:border-[#FF5C28] hover:text-[#FF5C28]"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-slate-900/30 lg:hidden" onClick={() => setOpen(false)} />}

      <main className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-[#F8FAFC]/90 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <button className="rounded-2xl bg-white p-3 text-[#0D4676] shadow-sm ring-1 ring-slate-200 lg:hidden" onClick={() => setOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden lg:block">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF5C28]">SIBS Design</p>
              <h1 className="text-xl font-extrabold text-[#0D4676]">Learning Video Portal</h1>
            </div>
            <div className="rounded-2xl bg-white px-4 py-3 text-right shadow-sm ring-1 ring-slate-200">
              <p className="text-sm font-extrabold text-slate-900">{user?.fullName}</p>
              <p className="text-xs font-semibold text-slate-500">One device protected</p>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
