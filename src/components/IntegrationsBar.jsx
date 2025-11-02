import { Cloud, FolderUp } from 'lucide-react';

export default function IntegrationsBar() {
  return (
    <section className="bg-white/5 border border-white/10 rounded-2xl p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium">Connect your libraries</h3>
          <p className="text-xs text-white/60">Quickly grab videos from cloud drives. Links open in a new tab.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="https://drive.google.com/drive/my-drive"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 text-sm"
            aria-label="Open Google Drive in new tab"
          >
            <Cloud className="h-4 w-4 text-sky-300" /> Google Drive
          </a>
          <a
            href="https://www.dropbox.com/home"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 text-sm"
            aria-label="Open Dropbox in new tab"
          >
            <FolderUp className="h-4 w-4 text-blue-300" /> Dropbox
          </a>
        </div>
      </div>
    </section>
  );
}
