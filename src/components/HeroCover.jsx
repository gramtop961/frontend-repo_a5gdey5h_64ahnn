import Spline from '@splinetool/react-spline';

export default function HeroCover() {
  return (
    <section className="relative h-[42vh] sm:h-[52vh] w-full overflow-hidden">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/9QzN3CTDRDtw5ogp/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Soft purple gradient overlay with bubble-like highlights */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#2a0a4f]/70 via-[#1b0a2e]/60 to-[#0b0616]/90" />
      <div className="pointer-events-none absolute -top-10 left-6 h-56 w-56 rounded-full bg-fuchsia-600/25 blur-3xl" />
      <div className="pointer-events-none absolute top-8 right-10 h-40 w-40 rounded-full bg-violet-500/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-6 left-1/3 h-32 w-32 rounded-full bg-purple-400/20 blur-2xl" />

      {/* Headline */}
      <div className="relative z-10 h-full flex items-center">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight leading-tight">
              Create highlight clips in seconds
            </h1>
            <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-white/80">
              Paste a link or upload a video. We detect the best moments, add captions, and export clean MP4s.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
