export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="rounded-2xl bg-white px-6 py-5 text-center shadow-card ring-1 ring-slate-200">
        <div className="mx-auto mb-3 h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-[#0D4676]" />
        <p className="text-sm font-semibold text-slate-700">Loading SIBS Academy...</p>
      </div>
    </div>
  );
}
