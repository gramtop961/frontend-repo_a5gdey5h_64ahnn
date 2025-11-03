import { useEffect, useMemo, useRef, useState } from 'react';
import Header from './components/Header.jsx';
import HeroCover from './components/HeroCover.jsx';
import UploadPanel from './components/UploadPanel.jsx';
import ProcessingPanel from './components/ProcessingPanel.jsx';
import ClipsGallery from './components/ClipsGallery.jsx';
import ConnectionBar from './components/ConnectionBar.jsx';

const ENV_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';
const LS_KEY = 'clipmaster.backendUrl';

function normalizeUrl(url) {
  if (!url) return '';
  try {
    const trimmed = url.trim().replace(/\/$/, '');
    const u = new URL(trimmed);
    return `${u.origin}${u.pathname.replace(/\/$/, '')}`;
  } catch {
    return url.trim().replace(/\/$/, '');
  }
}

async function safeFetch(input, init = {}, timeoutMs = 8000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(input, { mode: 'cors', credentials: 'omit', ...init, signal: ctrl.signal });
    clearTimeout(id);
    return res;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

export default function App() {
  const [backendUrl, setBackendUrl] = useState('');
  const [backendOk, setBackendOk] = useState(false);
  const [testing, setTesting] = useState(false);

  const [job, setJob] = useState(null); // { id, status, progress, message }
  const [clips, setClips] = useState([]); // [{ id, thumbnail_url, caption, download_url, duration, aspect_ratio }]
  const [history, setHistory] = useState([]); // [{ id, createdAt, clips }]
  const [error, setError] = useState('');
  const pollRef = useRef(null);

  // Initialize backend URL from localStorage override or env
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem(LS_KEY) : '';
    const initial = normalizeUrl(saved || ENV_BACKEND_URL);
    setBackendUrl(initial);
  }, []);

  const backendConfigured = useMemo(() => Boolean(backendUrl), [backendUrl]);

  // Probe backend whenever URL changes
  useEffect(() => {
    const test = async () => {
      if (!backendConfigured) {
        setBackendOk(false);
        return;
      }
      try {
        setTesting(true);
        const base = normalizeUrl(backendUrl);
        const res = await safeFetch(`${base}/test`);
        setBackendOk(res.ok);
      } catch {
        setBackendOk(false);
      } finally {
        setTesting(false);
      }
    };
    test();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendUrl]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const startPollingStatus = (jobId) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const base = normalizeUrl(backendUrl);
        const res = await safeFetch(`${base}/status/${jobId}`);
        if (!res.ok) throw new Error('Failed to fetch status');
        const data = await res.json();
        setJob((prev) => ({ ...prev, status: data.status, progress: data.progress ?? prev?.progress ?? 0, message: data.message || '' }));
        if (data.status === 'completed') {
          clearInterval(pollRef.current);
          pollRef.current = null;
          const receivedClips = Array.isArray(data.clips) ? data.clips : [];
          setClips(receivedClips);
          setHistory((h) => [{ id: jobId, createdAt: new Date().toISOString(), clips: receivedClips }, ...h]);
        }
        if (data.status === 'failed') {
          clearInterval(pollRef.current);
          pollRef.current = null;
          setError(data.error || 'Processing failed. Please try again.');
        }
      } catch (err) {
        setError((e) => e || 'Unable to reach processing service. If your app is served over HTTPS, using an HTTP backend will be blocked by the browser. Use an HTTPS backend or a proxy.');
      }
    }, 3000);
  };

  const handleStartProcessing = async (source, options) => {
    setError('');
    setClips([]);
    if (!backendConfigured) {
      setError('Backend URL is not configured. Set it using the field above.');
      return;
    }
    try {
      const form = new FormData();
      if (source.file) {
        form.append('file', source.file);
      }
      if (source.links && source.links.length > 0) {
        form.append('source_url', source.links[0]);
        form.append('sources', JSON.stringify(source.links));
      }
      form.append('clip_length', String(options.clipLength || 'auto'));
      form.append('aspect_ratio', options.aspectRatio || 'auto');
      form.append('auto_highlights', String(options.autoHighlights));

      setJob({ id: null, status: 'uploading', progress: 5, message: source.file ? 'Uploading video…' : 'Submitting link(s)…' });
      const base = normalizeUrl(backendUrl);
      const res = await safeFetch(`${base}/process`, {
        method: 'POST',
        body: form,
      }, 30000);
      if (!res.ok) throw new Error('Submission failed');
      const data = await res.json();
      if (!data.job_id) throw new Error('Invalid response from server');
      const jobId = data.job_id;
      setJob({ id: jobId, status: 'queued', progress: 10, message: 'Queued for processing' });
      startPollingStatus(jobId);
    } catch (err) {
      setError(err.message || 'Something went wrong during submission');
      setJob(null);
    }
  };

  const handleReset = () => {
    setJob(null);
    setClips([]);
    setError('');
  };

  const handleSaveUrl = (url) => {
    const norm = normalizeUrl(url);
    setBackendOk(false);
    setBackendUrl(norm);
    if (typeof window !== 'undefined') {
      if (norm) {
        window.localStorage.setItem(LS_KEY, norm);
      } else {
        window.localStorage.removeItem(LS_KEY);
      }
    }
  };

  const handleTestUrl = async (url) => {
    const norm = normalizeUrl(url);
    if (!norm) return;
    try {
      setTesting(true);
      // Mixed-content guard
      if (typeof window !== 'undefined' && window.location.protocol === 'https:' && norm.startsWith('http:')) {
        throw new Error('Mixed content blocked: Your site is HTTPS but backend is HTTP. Use HTTPS backend or a secure proxy.');
      }
      const res = await safeFetch(`${norm}/test`);
      setBackendOk(res.ok);
      if (res.ok) setBackendUrl(norm);
      if (!res.ok) setError('Backend responded but did not return OK at /test');
    } catch (e) {
      setBackendOk(false);
      setError(e.message || 'Failed to connect. Check URL, CORS, and network.');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0616] via-[#120a26] to-[#0a0717] text-white">
      <HeroCover />
      <Header backendConfigured={backendConfigured && backendOk} />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <ConnectionBar
          value={backendUrl}
          onChange={handleSaveUrl}
          onTest={handleTestUrl}
          ok={backendOk}
          loading={testing}
        />

        {!backendConfigured && (
          <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 text-amber-200 px-4 py-3 text-sm">
            Enter your processing server URL above and click Test to connect.
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 text-amber-200 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <UploadPanel onStart={handleStartProcessing} disabled={job && ['uploading','queued','processing'].includes(job.status)} />

        <ProcessingPanel job={job} error={error} onReset={handleReset} />

        <ClipsGallery clips={clips} history={history} />
      </main>

      <footer className="border-t border-white/10 mt-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 text-sm text-white/70 flex items-center justify-between">
          <p>ClipMaster — Generate watermark-free highlight clips instantly.</p>
          <p className="hidden sm:block">Powered by your processing server.</p>
        </div>
      </footer>
    </div>
  );
}
