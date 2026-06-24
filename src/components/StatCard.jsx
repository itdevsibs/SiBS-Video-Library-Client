export default function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-[26px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-extrabold text-[#0D4676]">{value}</p>
        </div>
        {Icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-[#FF5C28]">
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  );
}
