import { useEffect, useMemo, useRef, useState } from 'react';
import Header from './components/Header.jsx';
import HeroCover from './components/HeroCover.jsx';
import UploadPanel from './components/UploadPanel.jsx';
import ProcessingPanel from './components/ProcessingPanel.jsx';
import ClipsGallery from './components/ClipsGallery.jsx';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

export default function App() {
  const [job, setJob] = useState(null); // { id, status, progress, message }
  const [clips, setClips] = useState([]); // [{ id, thumbnail_url, caption, download_url, duration, aspect_ratio }]
  const [history, setHistory] = useState([]); // [{ id, createdAt, clips }]
  const [error, setError] = useState('');
  const [backendOk, setBackendOk] = useState(false);
  const pollRef = useRef(null);

  const backendConfigured = useMemo(() => Boolean(BACKEND_URL), []);

  useEffect(() => {
    // Probe backend connectivity when configured
    const test = async () => {
      if (!backendConfigured) return;
      try {
        const res = await fetch(`${BACKEND_URL}/test`);
        setBackendOk(res.ok);
      } catch {
        setBackendOk(false);
      }
    };
    test();
  }, [backendConfigured]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const startPollingStatus = (jobId) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/status/${jobId}`);
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
        setError((e) => e || 'Unable to reach processing service. Check backend URL and CORS.');
      }
    }, 3000);
  };

  const handleStartProcessing = async (source, options) => {
    setError('');
    setClips([]);
    if (!backendConfigured) {
      setError('Backend URL is not configured. Set VITE_BACKEND_URL to enable processing.');
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
      const res = await fetch(`${BACKEND_URL}/process`, {
        method: 'POST',
        body: form,
      });
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0616] via-[#120a26] to-[#0a0717] text-white">
      <HeroCover />
      <Header backendConfigured={backendConfigured && backendOk} />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {!backendConfigured && (
          <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 text-amber-200 px-4 py-3 text-sm">
            Backend URL is not set. Set VITE_BACKEND_URL to your API (e.g. https://...:8000) and reload.
          </div>
        )}

        <UploadPanel onStart={handleStartProcessing} disabled={job && ['uploading','queued','processing'].includes(job.status)} />

        <ProcessingPanel job={job} error={error} onReset={handleReset} />

        <ClipsGallery clips={clips} history={history} />
      </main>

      <footer className="border-t border-white/10 mt-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 text-sm text-white/70 flex items-center justify-between">
          <p>ClipMaster — Generate watermark-free highlight clips instantly.</p>
          <p className="hidden sm:block">Powered by your local processing server.</p>
        </div>
      </footer>
    </div>
  );
}
