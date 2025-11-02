import Spline from '@splinetool/react-spline';
import { Youtube, Twitch, Share2 } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative">
      <div className="h-[420px] sm:h-[480px] lg:h-[520px] w-full rounded-2xl overflow-hidden border border-white/10 bg-black/40">
        <Spline scene="https://prod.spline.design/ezRAY9QD27kiJcur/scene.splinecode" style={{ width: '100%', height: '100%' }} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
            Turn long videos into viral-ready clips
          </h2>
          <p className="max-w-2xl text-white/70">
            Smart highlight detection, auto captions, and multiple aspect ratios. No watermarks. Download instantly.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://www.youtube.com/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 px-4 py-2 text-sm"
            >
              <Youtube className="h-4 w-4 text-red-400" /> YouTube
            </a>
            <a
              href="https://www.twitch.tv/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 px-4 py-2 text-sm"
            >
              <Twitch className="h-4 w-4 text-violet-400" /> Twitch
            </a>
            <a
              href="https://kick.com/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 px-4 py-2 text-sm"
            >
              <Share2 className="h-4 w-4 text-emerald-400" /> Kick
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
