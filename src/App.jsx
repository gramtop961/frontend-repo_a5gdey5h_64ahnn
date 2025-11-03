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
    // Normalize timeout error
    if (e?.name === 'AbortError') {
      const err = new Error('Request timed out');
      err.code = 'timeout';
      throw err;
    }
    throw e;
  }
}

function buildConnectionIssue({ type, url, status, note }) {
  const securePage = typeof window !== 'undefined' && window.location.protocol === 'https:';
  switch (type) {
    case 'mixed_content':
      return {
        code: 'mixed_content',
        title: 'Mixed content is blocked',
        details: 'Your app is served over HTTPS but the backend URL uses HTTP. Browsers block these requests for security.',
        fixes: [
          'Use an HTTPS backend URL (https://…) or put your server behind a secure proxy/tunnel (Cloudflare Tunnel, ngrok, Fly, Render).',
          'If developing locally, expose your backend via an HTTPS tunnel and use that URL here.',
        ],
        url,
      };
    case 'timeout':
      return {
        code: 'timeout',
        title: 'The request timed out',
        details: 'The server did not respond in time.',
        fixes: [
          'Verify the backend is running and reachable at the URL provided.',
          'Check that /test responds quickly; heavy startup work can delay responses.',
          'If using a free hosting tier that sleeps, wake it up and try again.',
        ],
        url,
      };
    case 'not_ok':
      return {
        code: 'not_ok',
        title: 'Endpoint reached but returned an error',
        details: `GET /test responded with status ${status ?? 'unknown'}.`,
        fixes: [
          'Ensure your backend defines GET /test and returns HTTP 200.',
          'Confirm CORS is enabled to allow this origin and includes Access-Control-Allow-Origin.',
        ],
        url,
      };
    case 'cors_or_network':
    default:
      return {
        code: 'cors_or_network',
        title: 'Request was blocked (CORS or network)',
        details: 'The browser blocked the request or could not reach the server.',
        fixes: [
          'Enable CORS on your backend and allow this app’s origin.',
          'Make sure the URL is correct and publicly reachable.',
          securePage ? 'On HTTPS pages, the backend must also be HTTPS.' : 'If testing locally, consider an HTTPS tunnel for reliability.',
        ],
        url,
      };
  }
}

export default function App() {
  const [backendUrl, setBackendUrl] = useState('');
  const [backendOk, setBackendOk] = useState(false);
  const [testing, setTesting] = useState(false);
  const [issue, setIssue] = useState(null); // connection diagnostics

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
        setIssue(null);
        return;
      }
      try {
        setTesting(true);
        const base = normalizeUrl(backendUrl);
        // Mixed-content guard
        if (typeof window !== 'undefined' && window.location.protocol === 'https:' && base.startsWith('http:')) {
          setBackendOk(false);
          setIssue(buildConnectionIssue({ type: 'mixed_content', url: base }));
          return;
        }
        const res = await safeFetch(`${base}/test`);
        if (!res.ok) {
          setBackendOk(false);
          setIssue(buildConnectionIssue({ type: 'not_ok', url: base, status: res.status }));
          return;
        }
        setBackendOk(true);
        setIssue(null);
      } catch (e) {
        if (e?.code === 'timeout') {
          setIssue(buildConnectionIssue({ type: 'timeout', url: backendUrl }));
        } else {
          setIssue(buildConnectionIssue({ type: 'cors_or_network', url: backendUrl }));
        }
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
    setIssue(null);
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
        const i = buildConnectionIssue({ type: 'mixed_content', url: norm });
        setIssue(i);
        setBackendOk(false);
        return;
      }
      const res = await safeFetch(`${norm}/test`);
      if (res.ok) {
        setBackendOk(true);
        setIssue(null);
        setBackendUrl(norm);
      } else {
        setBackendOk(false);
        setIssue(buildConnectionIssue({ type: 'not_ok', url: norm, status: res.status }));
      }
    } catch (e) {
      if (e?.code === 'timeout') {
        setIssue(buildConnectionIssue({ type: 'timeout', url: norm }));
      } else {
        setIssue(buildConnectionIssue({ type: 'cors_or_network', url: norm }));
      }
      setBackendOk(false);
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
          issue={issue}
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
