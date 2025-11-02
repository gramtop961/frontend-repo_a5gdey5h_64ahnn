import { Download, History } from 'lucide-react';

function ClipCard({ clip }) {
  const handleDownload = () => {
    if (clip.download_url) {
      window.open(clip.download_url, '_blank');
    }
  };

  return (
    <div className="group rounded-xl overflow-hidden border border-white/10 bg-white/5">
      <div className="relative aspect-video bg-black/50">
        {clip.thumbnail_url ? (
          <img
            src={clip.thumbnail_url}
            alt={clip.caption || 'Clip preview'}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-white/50 text-sm">
            No thumbnail available
          </div>
        )}
        <div className="absolute bottom-0 inset-x-0 p-3 flex items-end justify-between bg-gradient-to-t from-black/70 to-transparent">
          <div className="text-xs sm:text-sm max-w-[75%] line-clamp-2">
            {clip.caption || 'Auto-generated highlight'}
          </div>
          <div className="ml-2 shrink-0 text-[10px] sm:text-xs text-white/80 bg-black/50 rounded px-2 py-1">
            {clip.duration ? `${Math.round(clip.duration)}s` : ''}
          </div>
        </div>
      </div>
      <div className="p-3 flex items-center justify-between">
        <div className="text-xs text-white/60">{clip.aspect_ratio || 'auto'}</div>
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-md border border-white/15 hover:border-white/25 bg-white/5"
          disabled={!clip.download_url}
        >
          <Download className="h-4 w-4" /> Download
        </button>
      </div>
    </div>
  );
}

export default function ClipsGallery({ clips, history }) {
  const hasClips = Array.isArray(clips) && clips.length > 0;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Your clips</h2>
        <div className="text-sm text-white/60 flex items-center gap-2">
          <History className="h-4 w-4" />
          <span>Recent sessions: {history?.length || 0}</span>
        </div>
      </div>

      {!hasClips && (
        <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-white/60">
          Once processing completes, your highlights will appear here with captions and quick downloads.
        </div>
      )}

      {hasClips && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clips.map((clip) => (
            <ClipCard key={clip.id || clip.download_url || Math.random()} clip={clip} />
          ))}
        </div>
      )}

      {history && history.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm text-white/70 mb-3">History</h3>
          <div className="space-y-2">
            {history.map((h) => (
              <div key={h.id} className="flex items-center justify-between text-sm text-white/70 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                <div className="flex items-center gap-3">
                  <div className="text-white/60">
                    #{String(h.id).slice(0, 8)}
                  </div>
                  <div className="text-white/50">
                    {new Date(h.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="text-white/60">{h.clips?.length || 0} clip(s)</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
