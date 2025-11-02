import { Rocket, Video, ShieldCheck } from 'lucide-react';

export default function Header({ backendConfigured }) {
  return (
    <header className="relative overflow-hidden">
      <div className="absolute inset-0 opacity-40 pointer-events-none" aria-hidden>
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-violet-600 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-fuchsia-600 blur-3xl" />
      </div>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
              <Video className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">ClipMaster</h1>
              <p className="text-xs sm:text-sm text-white/60">Auto-generate highlight clips without watermarks</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-white/70">
            <ShieldCheck className="h-4 w-4" />
            <span>{backendConfigured ? 'Processing server connected' : 'Awaiting server configuration'}</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-white/80">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
            <Rocket className="h-4 w-4 text-violet-300" />
            <span>Smart highlights from scenes and speech</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
            <Video className="h-4 w-4 text-fuchsia-300" />
            <span>Multiple aspect ratios: 16:9 · 9:16 · 1:1</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            <span>Watermark-free MP4 downloads</span>
          </div>
        </div>
      </div>
    </header>
  );
}
