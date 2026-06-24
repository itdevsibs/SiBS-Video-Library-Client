import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api.js";

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/admin/activity-logs")
      .then((data) => setLogs(data.logs || []))
      .catch((err) => setError(err.message || "Failed to load logs."));
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-[#FF5C28]">Admin</p>
        <h2 className="mt-1 text-2xl font-extrabold text-[#0D4676]">Activity Logs</h2>
        <p className="mt-2 text-sm font-semibold text-slate-500">Latest watch progress records from users.</p>
      </section>

      {error && <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}

      <section className="overflow-hidden rounded-[30px] bg-white shadow-sm ring-1 ring-slate-200">
        <div className="overflow-x-auto sibs-scrollbar">
          <table className="w-full min-w-[950px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-4">User</th>
                <th className="px-5 py-4">Video</th>
                <th className="px-5 py-4">Progress</th>
                <th className="px-5 py-4">Completed</th>
                <th className="px-5 py-4">IP</th>
                <th className="px-5 py-4">Updated</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-slate-100">
                  <td className="px-5 py-4">
                    <p className="font-extrabold text-slate-900">{log.full_name}</p>
                    <p className="text-xs font-semibold text-slate-500">{log.sibs_id || log.username}</p>
                  </td>
                  <td className="px-5 py-4 font-bold text-slate-700">{log.video_title}</td>
                  <td className="px-5 py-4 font-semibold text-slate-600">{formatSeconds(log.progress_seconds)}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${log.completed ? "bg-green-50 text-green-700" : "bg-orange-50 text-[#FF5C28]"}`}>
                      {log.completed ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-500">{log.ip_address || "—"}</td>
                  <td className="px-5 py-4 font-semibold text-slate-500">{log.updated_at ? new Date(log.updated_at).toLocaleString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!logs.length && <div className="py-10 text-center font-bold text-slate-400">No activity logs yet.</div>}
        </div>
      </section>
    </div>
  );
}

function formatSeconds(value) {
  const seconds = Number(value || 0);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}
