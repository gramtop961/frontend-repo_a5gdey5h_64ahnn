import { Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

const statusCopy = {
  uploading: 'Uploading your video…',
  queued: 'Queued for processing…',
  processing: 'Analyzing scenes, audio and generating captions…',
  completed: 'All done! Your clips are ready below.',
  failed: 'Processing failed',
};

export default function ProcessingPanel({ job, error, onReset }) {
  if (!job && !error) return null;
  const status = job?.status;
  const progress = Math.max(0, Math.min(100, Math.round(job?.progress ?? (status === 'completed' ? 100 : 0))));

  return (
    <section className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          {status === 'completed' ? (
            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
          ) : status === 'failed' || error ? (
            <AlertCircle className="h-6 w-6 text-amber-300" />
          ) : (
            <Loader2 className="h-6 w-6 animate-spin text-violet-300" />
          )}
          <div>
            <p className="font-medium">
              {error ? 'There was a problem' : statusCopy[status] || 'Processing…'}
            </p>
            <p className="text-sm text-white/60">
              {error || job?.message || 'This usually takes a minute or two depending on video length.'}
            </p>
          </div>
        </div>
        <div className="min-w-[200px]">
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full ${status === 'failed' ? 'bg-amber-400' : 'bg-gradient-to-r from-violet-500 to-fuchsia-500'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-1 text-right text-xs text-white/60">{progress}%</div>
        </div>
      </div>

      {(status === 'completed' || status === 'failed' || error) && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-white/60 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Tip: Keep this tab open while processing for best experience.
          </p>
          <button
            onClick={onReset}
            className="text-sm px-3 py-1.5 rounded-md border border-white/15 hover:border-white/25 bg-white/5"
          >
            Start a new upload
          </button>
        </div>
      )}
    </section>
  );
}
