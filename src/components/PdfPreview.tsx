import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw, AlertCircle, ZoomIn, ZoomOut } from 'lucide-react';
import type { PDFDocumentProxy, PDFDocumentLoadingTask, RenderTask } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
export function PdfPreview({
  url,
  name,
  page: controlledPage,
  onPageChange,
}: {
  url: string;
  name: string;
  page?: number;
  onPageChange?: (page: number) => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null),
    [page, setPage] = useState(1),
    [zoom, setZoom] = useState(1),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(true);
  const currentPage = controlledPage || page;
  useEffect(() => {
    let alive = true;
    let loading: PDFDocumentLoadingTask | undefined;
    const controller = new AbortController();
    setPdf(null);
    setError('');
    setBusy(true);
    setPage(1);
    void (async () => {
      const response = await fetch(url, { credentials: 'same-origin', signal: controller.signal });
      if (!response.ok) throw new Error('The original could not be loaded. Refresh and try again.');
      const data = new Uint8Array(await response.arrayBuffer());
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
      if (!alive) return;
      loading = pdfjs.getDocument({ data, verbosity: 0 });
      const loaded = await loading.promise;
      if (alive) setPdf(loaded);
      else void loading.destroy();
    })().catch((e) => {
      if (alive) {
        setError((e as Error).message);
        setBusy(false);
      }
    });
    return () => {
      alive = false;
      controller.abort();
      if (loading) void loading.destroy();
    };
  }, [url]);
  useEffect(() => {
    if (!pdf || !canvas.current) return;
    let alive = true;
    let task: RenderTask | undefined;
    setBusy(true);
    setError('');
    void (async () => {
      const docPage = await pdf.getPage(currentPage);
      if (!alive) return;
      const element = canvas.current!;
      const base = docPage.getViewport({ scale: 1 });
      const width = Math.min(680, Math.max(220, element.parentElement!.clientWidth - 24));
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const viewport = docPage.getViewport({ scale: (width / base.width) * zoom * ratio });
      element.width = Math.ceil(viewport.width);
      element.height = Math.ceil(viewport.height);
      element.style.width = `${viewport.width / ratio}px`;
      element.style.height = `${viewport.height / ratio}px`;
      task = docPage.render({ canvas: element, viewport });
      await task.promise;
      if (alive) setBusy(false);
    })().catch((e) => {
      if (alive && e?.name !== 'RenderingCancelledException') {
        setError('This page could not be rendered. Download the original to review it.');
        setBusy(false);
      }
    });
    return () => {
      alive = false;
      task?.cancel();
    };
  }, [pdf, currentPage, zoom]);
  function navigate(next: number) {
    if (onPageChange) onPageChange(next);
    else setPage(next);
  }
  return (
    <div className="pdf-viewer">
      <div className="pdf-viewer-toolbar">
        <div>
          <button
            type="button"
            className="icon-button"
            aria-label="Previous PDF page"
            disabled={!pdf || currentPage <= 1}
            onClick={() => navigate(currentPage - 1)}
          >
            <ChevronLeft size={17} />
          </button>
          <span>
            Page {currentPage} / {pdf?.numPages || '…'}
          </span>
          <button
            type="button"
            className="icon-button"
            aria-label="Next PDF page"
            disabled={!pdf || currentPage >= pdf.numPages}
            onClick={() => navigate(currentPage + 1)}
          >
            <ChevronRight size={17} />
          </button>
        </div>
        <div>
          <button
            type="button"
            className="icon-button"
            aria-label="Zoom out PDF"
            disabled={zoom <= 0.75}
            onClick={() => setZoom(Math.max(0.75, zoom - 0.25))}
          >
            <ZoomOut size={16} />
          </button>
          <span>{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            className="icon-button"
            aria-label="Zoom in PDF"
            disabled={zoom >= 1.75}
            onClick={() => setZoom(Math.min(1.75, zoom + 0.25))}
          >
            <ZoomIn size={16} />
          </button>
        </div>
      </div>
      <div className="pdf-canvas-area">
        {busy && !error && (
          <p className="pdf-loading" role="status">
            <RefreshCw size={18} className="spin" />
            Rendering original page…
          </p>
        )}
        {error ? (
          <p className="pdf-error" role="alert">
            <AlertCircle size={18} />
            {error}
          </p>
        ) : (
          <canvas
            ref={canvas}
            role="img"
            aria-label={`Document preview: ${name}, page ${currentPage}`}
            style={{ visibility: busy ? 'hidden' : 'visible' }}
          />
        )}
      </div>
    </div>
  );
}
