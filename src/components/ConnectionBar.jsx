import { useEffect, useState } from 'react';
import { Link as LinkIcon, ShieldCheck, AlertTriangle, RefreshCw, Save } from 'lucide-react';

export default function ConnectionBar({ value, onChange, onTest, ok, loading }) {
  const [temp, setTemp] = useState(value || '');

  useEffect(() => {
    setTemp(value || '');
  }, [value]);

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="flex-1">
          <label className="block text-xs text-white/60 mb-1">Processing server URL</label>
          <div className="flex items-stretch gap-2">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 min-w-[46px]">
              <LinkIcon className="h-4 w-4 text-violet-300" />
            </div>
            <input
              className="flex-1 bg-transparent border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-violet-400/50 placeholder:text-white/40 text-sm"
              placeholder="https://your-backend.example.com:8000"
              value={temp}
              onChange={(e) => setTemp(e.target.value)}
            />
            <button
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 active:bg-violet-700 transition-colors px-3 py-2 rounded-lg text-sm"
              onClick={() => onChange(temp)}
              type="button"
              title="Save URL"
            >
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">Save</span>
            </button>
            <button
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 transition-colors px-3 py-2 rounded-lg text-sm"
              onClick={() => onTest(temp)}
              type="button"
              title="Test connection"
              disabled={loading || !temp}
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              <span className="hidden sm:inline">Test</span>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs rounded-lg px-3 py-2 border min-w-[210px]"
          style={{
            borderColor: ok ? 'rgba(16,185,129,0.4)' : 'rgba(251,191,36,0.35)',
            background: ok ? 'rgba(16,185,129,0.07)' : 'rgba(251,191,36,0.07)'
          }}
        >
          {ok ? <ShieldCheck className="h-4 w-4 text-emerald-300" /> : <AlertTriangle className="h-4 w-4 text-amber-300" />}
          <span>{ok ? 'Connected' : 'Not connected'}</span>
        </div>
      </div>
    </div>
  );
}
