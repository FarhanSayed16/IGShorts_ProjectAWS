export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-3 w-24 bg-[#00d26a]/30" />
      <div className="h-8 w-72 bg-white/10" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-white/5 border border-white/10" />
        ))}
      </div>
      <div className="h-48 rounded-2xl bg-white/5 border border-white/10" />
    </div>
  );
}
