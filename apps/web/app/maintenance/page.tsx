import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Maintenance',
  description: 'IGshorts is temporarily offline for maintenance.',
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00d26a]">
          IGshorts
        </p>
        <h1 className="font-display font-black text-4xl sm:text-5xl tracking-tight">
          Under maintenance
        </h1>
        <p className="text-sm text-white/60 leading-relaxed">
          Charts and discovery are briefly offline while we run updates. Check back shortly — public
          rankings will resume with the next observation window.
        </p>
        <div className="h-px w-16 mx-auto bg-[#00d26a]" />
        <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">
          followers_v1 · editorial charts
        </p>
      </div>
    </div>
  );
}
