import { useRef, useState } from 'react';
import { Upload, Scissors, Clock, Ratio, AlertCircle } from 'lucide-react';

const aspectOptions = [
  { label: 'Auto', value: 'auto' },
  { label: '16:9 (Landscape)', value: '16:9' },
  { label: '9:16 (Vertical)', value: '9:16' },
  { label: '1:1 (Square)', value: '1:1' },
];

const lengthOptions = [
  { label: 'Auto', value: 'auto' },
  { label: '15s', value: 15 },
  { label: '30s', value: 30 },
  { label: '45s', value: 45 },
  { label: '60s', value: 60 },
];

export default function UploadPanel({ onStart, disabled }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [aspectRatio, setAspectRatio] = useState('auto');
  const [clipLength, setClipLength] = useState('auto');
  const [autoHighlights, setAutoHighlights] = useState(true);
  const [error, setError] = useState('');

  const onDrop = (e) => {
    e.preventDefault();
    if (disabled) return;
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const handleFile = (f) => {
    setError('');
    const allowed = ['video/mp4', 'video/quicktime', 'video/mov', 'video/x-m4v'];
    if (!allowed.includes(f.type) && !f.name.match(/\.(mp4|mov|m4v)$/i)) {
      setError('Unsupported format. Please upload MP4 or MOV.');
      setFile(null);
      return;
    }
    if (f.size > 1024 * 1024 * 1024 * 4) {
      setError('File is too large. Max 4GB.');
      setFile(null);
      return;
    }
    setFile(f);
  };

  const handleStart = () => {
    if (!file) {
      setError('Please choose a video file first.');
      return;
    }
    onStart?.(file, { aspectRatio, clipLength, autoHighlights });
  };

  return (
    <section className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition ${
              disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-violet-400'
            } border-white/15 bg-black/20`}
          >
            <Upload className="h-8 w-8 text-white/80" />
            <div className="text-center">
              <p className="font-medium">Drag & drop your video here</p>
              <p className="text-sm text-white/60 mt-1">MP4 or MOV up to 4GB</p>
            </div>
            <button
              onClick={() => !disabled && inputRef.current?.click()}
              className="mt-2 inline-flex items-center gap-2 rounded-lg bg-violet-600 hover:bg-violet-500 transition px-4 py-2 text-sm font-medium"
              disabled={disabled}
            >
              <Upload className="h-4 w-4" /> Choose file
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="video/mp4,video/quicktime,video/mov,video/x-m4v"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
              disabled={disabled}
            />
            {file && (
              <div className="mt-3 text-sm text-white/80">
                Selected: <span className="font-medium">{file.name}</span>
              </div>
            )}
          </div>
          {error && (
            <div className="mt-3 flex items-center gap-2 text-amber-300 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">Aspect ratio</label>
            <div className="grid grid-cols-2 gap-2">
              {aspectOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setAspectRatio(opt.value)}
                  className={`text-sm rounded-lg px-3 py-2 border ${
                    aspectRatio === opt.value
                      ? 'bg-white/10 border-violet-400'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                  disabled={disabled}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-1">Clip length</label>
            <div className="grid grid-cols-3 gap-2">
              {lengthOptions.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setClipLength(opt.value)}
                  className={`text-sm rounded-lg px-3 py-2 border ${
                    clipLength === opt.value
                      ? 'bg-white/10 border-violet-400'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                  disabled={disabled}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-white/5 border border-white/10 px-3 py-2">
            <div className="flex items-center gap-2 text-sm text-white/80">
              <Scissors className="h-4 w-4" />
              <span>Auto select highlights</span>
            </div>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={autoHighlights}
                onChange={(e) => setAutoHighlights(e.target.checked)}
                disabled={disabled}
              />
              <div className="w-10 h-6 bg-white/20 peer-checked:bg-violet-500 rounded-full relative transition">
                <div className={`absolute top-1 left-1 h-4 w-4 bg-white rounded-full transition ${
                  autoHighlights ? 'translate-x-4' : ''
                }`} />
              </div>
            </label>
          </div>

          <button
            onClick={handleStart}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-95 transition px-4 py-2 text-sm font-medium disabled:opacity-50"
            disabled={disabled}
          >
            <Upload className="h-4 w-4" /> Start processing
          </button>
          <p className="text-xs text-white/50">By starting, you agree to our processing terms. Your video stays private.</p>
        </div>
      </div>
    </section>
  );
}
