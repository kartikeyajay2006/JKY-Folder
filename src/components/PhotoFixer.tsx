import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import { AlertCircle, Check, RotateCcw, RotateCw } from 'lucide-react';
import { Dialog } from './Dialog';
import { api } from '../api';
import { size as formatSize } from './Status';
import type { DocumentRecord, Requirement } from '../../shared/model';
import {
  describeLimits,
  fittable,
  kb,
  largest,
  outputSize,
  range,
  ratioFor,
  targetOf,
  within,
  type Crop,
  type FitTarget,
  type Shape,
} from '../photo-fit';
export { fittable } from '../photo-fit';

type Corner = 'nw' | 'ne' | 'sw' | 'se';
interface Fitted {
  blob: Blob;
  url: string;
  width: number;
  height: number;
  quality: number;
  problem?: 'too-big' | 'too-small';
}
function rotated(bitmap: ImageBitmap, quarter: number) {
  const canvas = document.createElement('canvas');
  canvas.width = quarter % 2 ? bitmap.height : bitmap.width;
  canvas.height = quarter % 2 ? bitmap.width : bitmap.height;
  const ctx = canvas.getContext('2d')!;
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((quarter * Math.PI) / 2);
  ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);
  return canvas;
}
function draw(source: HTMLCanvasElement, crop: Crop, w: number, h: number, clean: boolean) {
  let image: CanvasImageSource = source,
    area = { ...crop };
  // Halve in steps first: one big downscale in a single draw looks jagged.
  while (area.w / 2 > w && area.h / 2 > h) {
    const step = document.createElement('canvas');
    step.width = Math.round(area.w / 2);
    step.height = Math.round(area.h / 2);
    const ctx = step.getContext('2d')!;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(image, area.x, area.y, area.w, area.h, 0, 0, step.width, step.height);
    image = step;
    area = { x: 0, y: 0, w: step.width, h: step.height };
  }
  const out = document.createElement('canvas');
  out.width = w;
  out.height = h;
  const ctx = out.getContext('2d')!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image, area.x, area.y, area.w, area.h, 0, 0, w, h);
  if (clean) {
    // Paper becomes white and ink becomes dark, keeping soft edges on the strokes.
    const pixels = ctx.getImageData(0, 0, w, h);
    const d = pixels.data;
    for (let i = 0; i < d.length; i += 4) {
      const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      const v = Math.round(255 * Math.min(1, Math.max(0, (lum - 105) / 85)));
      d[i] = d[i + 1] = d[i + 2] = v;
    }
    ctx.putImageData(pixels, 0, 0);
  }
  return out;
}
const encode = (canvas: HTMLCanvasElement, quality: number) =>
  new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(Error('This browser could not save a JPEG.'))),
      'image/jpeg',
      quality,
    ),
  );
/** Finds the best-quality JPEG inside the size limits, shrinking pixels only if it must. */
async function fit(source: HTMLCanvasElement, crop: Crop, t: FitTarget, clean: boolean) {
  let { w, h } = outputSize(crop, t);
  for (let attempt = 0; attempt < 12; attempt++) {
    const canvas = draw(source, crop, w, h, clean);
    let quality = 0.92,
      blob = await encode(canvas, quality);
    if (t.maxBytes && blob.size > t.maxBytes) {
      let lo = 0.3,
        hi = 0.92,
        best: { blob: Blob; quality: number } | null = null;
      for (let i = 0; i < 7; i++) {
        const mid = (lo + hi) / 2,
          b = await encode(canvas, mid);
        if (b.size <= t.maxBytes) {
          best = { blob: b, quality: mid };
          lo = mid;
        } else hi = mid;
      }
      if (!best) {
        const low = await encode(canvas, 0.3);
        if (low.size <= t.maxBytes) best = { blob: low, quality: 0.3 };
      }
      if (!best) {
        const nw = Math.round(w * 0.85),
          nh = Math.round(h * 0.85);
        if ((t.minWidth && nw < t.minWidth) || (t.minHeight && nh < t.minHeight) || nw < 16)
          return { blob, width: w, height: h, quality, problem: 'too-big' as const };
        w = nw;
        h = nh;
        continue;
      }
      ({ blob, quality } = best);
    }
    if (t.minBytes && blob.size < t.minBytes) {
      const top = await encode(canvas, 1);
      if (top.size < t.minBytes) {
        // Even the best quality is too small: more pixels are the only honest way up.
        const nw = Math.round(w * 1.2),
          nh = Math.round(h * 1.2);
        if ((t.maxWidth && nw > t.maxWidth) || (t.maxHeight && nh > t.maxHeight) || nw > crop.w)
          return { blob: top, width: w, height: h, quality: 1, problem: 'too-small' as const };
        w = nw;
        h = nh;
        continue;
      }
      let lo = quality,
        hi = 1;
      blob = top;
      quality = 1;
      for (let i = 0; i < 7; i++) {
        const mid = (lo + hi) / 2,
          b = await encode(canvas, mid);
        if (b.size < t.minBytes) lo = mid;
        else if (t.maxBytes && b.size > t.maxBytes) hi = mid;
        else {
          blob = b;
          quality = mid;
          break;
        }
      }
    }
    return { blob, width: w, height: h, quality };
  }
  throw Error('The image could not be fitted to these limits.');
}

/**
 * Crops, rotates, resizes and compresses a JPEG in the browser so it meets a checklist item's
 * pixel and file-size limits. The result is saved as a new version; the original is kept.
 */
export function PhotoFixer({
  packetId,
  packetRevision,
  document: original,
  requirements,
  initialRequirementId,
  onClose,
  onSaved,
}: {
  packetId: string;
  packetRevision: number;
  document: DocumentRecord;
  requirements: Requirement[];
  initialRequirementId?: string;
  onClose: () => void;
  onSaved: (saved: DocumentRecord, replaced: string | null) => Promise<void> | void;
}) {
  const options = requirements.filter(fittable);
  const [choice, setChoice] = useState(
    initialRequirementId && options.some((r) => r.id === initialRequirementId)
      ? initialRequirementId
      : options[0]?.id || 'custom',
  );
  const [custom, setCustom] = useState({ width: '', height: '', minKb: '', maxKb: '' });
  const requirement = options.find((r) => r.id === choice);
  const target: FitTarget = useMemo(() => {
    if (requirement) return targetOf(requirement);
    const n = (v: string) => (v.trim() && Number(v) > 0 ? Number(v) : undefined);
    return {
      minWidth: n(custom.width),
      maxWidth: n(custom.width),
      minHeight: n(custom.height),
      maxHeight: n(custom.height),
      minBytes: n(custom.minKb) && n(custom.minKb)! * 1024,
      maxBytes: n(custom.maxKb) && n(custom.maxKb)! * 1024,
    };
  }, [requirement, custom]);
  const [bitmap, setBitmap] = useState<ImageBitmap | null>(null),
    [quarter, setQuarter] = useState(0),
    [shape, setShape] = useState<Shape>(ratioFor('limit', target) ? 'limit' : 'free'),
    [crop, setCrop] = useState<Crop | null>(null),
    [clean, setClean] = useState(false),
    [useFor, setUseFor] = useState(true),
    [result, setResult] = useState<Fitted | null>(null),
    [working, setWorking] = useState(false),
    [saving, setSaving] = useState(false),
    [error, setError] = useState('');
  const source = useMemo(() => (bitmap ? rotated(bitmap, quarter) : null), [bitmap, quarter]);
  const ratio = ratioFor(shape, target);
  // Once a width and height are known, the frame takes that shape so nothing is stretched.
  const limitRatio = ratioFor('limit', target);
  useEffect(() => {
    if (limitRatio) setShape('limit');
  }, [limitRatio]);
  // Load the original; the browser applies its camera orientation.
  useEffect(() => {
    let alive = true;
    fetch(`/api/packets/${packetId}/documents/${original.id}/content`, {
      credentials: 'same-origin',
    })
      .then((r) => {
        if (!r.ok) throw Error('The original could not be opened.');
        return r.blob();
      })
      .then((blob) => createImageBitmap(blob))
      .then((b) => alive && setBitmap(b))
      .catch((e) => alive && setError((e as Error).message));
    return () => {
      alive = false;
    };
  }, [packetId, original.id]);
  // A new shape, rotation or image starts from the largest centred crop.
  useEffect(() => {
    if (source) setCrop(largest(source.width, source.height, ratio));
  }, [source, ratio]);
  // Draw the image into the stage.
  const stage = useRef<HTMLDivElement>(null),
    view = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    if (!source || !stage.current || !view.current) return;
    const paint = () => {
      const width = Math.min(stage.current!.clientWidth || 520, 560);
      const s = Math.min(width / source.width, 420 / source.height);
      const canvas = view.current!;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(source.width * s * dpr);
      canvas.height = Math.round(source.height * s * dpr);
      canvas.style.width = `${Math.round(source.width * s)}px`;
      canvas.style.height = `${Math.round(source.height * s)}px`;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
      setScale(s);
    };
    paint();
    const observer = new ResizeObserver(paint);
    observer.observe(stage.current);
    return () => observer.disconnect();
  }, [source]);
  // Re-fit shortly after the last change; older runs are ignored.
  const run = useRef(0);
  useEffect(() => {
    if (!source || !crop) return;
    const id = ++run.current;
    setWorking(true);
    const timer = setTimeout(() => {
      fit(source, crop, target, clean)
        .then((fitted) => {
          if (id !== run.current) return;
          setResult({ ...fitted, url: URL.createObjectURL(fitted.blob) });
          setError('');
        })
        .catch((e) => id === run.current && setError((e as Error).message))
        .finally(() => id === run.current && setWorking(false));
    }, 220);
    return () => clearTimeout(timer);
  }, [source, crop, target, clean]);
  // Each preview URL is released when it is replaced or the dialog closes.
  useEffect(() => {
    return () => {
      if (result) URL.revokeObjectURL(result.url);
    };
  }, [result]);

  // Moving and resizing the crop with a pointer or the keyboard.
  const drag = useRef<{ mode: 'move' | Corner; x: number; y: number; start: Crop } | null>(null);
  function bounded(next: Crop): Crop {
    if (!source) return next;
    const w = Math.min(Math.max(next.w, 24), source.width),
      h = Math.min(Math.max(next.h, 24), source.height);
    return {
      w,
      h,
      x: Math.min(Math.max(next.x, 0), source.width - w),
      y: Math.min(Math.max(next.y, 0), source.height - h),
    };
  }
  function resize(start: Crop, corner: Corner, dx: number, dy: number): Crop {
    const left = corner.includes('w'),
      top = corner.includes('n');
    const ax = left ? start.x + start.w : start.x,
      ay = top ? start.y + start.h : start.y;
    const maxW = left ? ax : source!.width - ax,
      maxH = top ? ay : source!.height - ay;
    let w = Math.min(Math.max(start.w + (left ? -dx : dx), 24), maxW);
    let h = ratio ? w / ratio : Math.min(Math.max(start.h + (top ? -dy : dy), 24), maxH);
    if (ratio && h > maxH) {
      h = maxH;
      w = h * ratio;
    }
    return { w, h, x: left ? ax - w : ax, y: top ? ay - h : ay };
  }
  function zoomTo(percent: number) {
    if (!source || !crop) return;
    const max = largest(source.width, source.height, ratio ?? crop.w / crop.h);
    const w = (max.w * percent) / 100,
      h = (max.h * percent) / 100;
    setCrop(bounded({ x: crop.x + (crop.w - w) / 2, y: crop.y + (crop.h - h) / 2, w, h }));
  }
  const zoom =
    source && crop
      ? Math.round(
          (crop.w / largest(source.width, source.height, ratio ?? crop.w / crop.h).w) * 100,
        )
      : 100;
  const begin = (mode: 'move' | Corner) => (event: PointerEvent<HTMLElement>) => {
    if (!crop) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { mode, x: event.clientX, y: event.clientY, start: crop };
  };
  function moveDrag(event: PointerEvent<HTMLElement>) {
    const d = drag.current;
    if (!d || !source) return;
    const dx = (event.clientX - d.x) / scale,
      dy = (event.clientY - d.y) / scale;
    setCrop(
      d.mode === 'move'
        ? bounded({ ...d.start, x: d.start.x + dx, y: d.start.y + dy })
        : resize(d.start, d.mode, dx, dy),
    );
  }

  const changes = useMemo(() => {
    if (!source || !crop || !result) return [];
    const full = Math.round(crop.w) >= source.width - 1 && Math.round(crop.h) >= source.height - 1;
    return [
      quarter ? `Rotated ${quarter * 90}° clockwise` : '',
      full ? '' : `Cropped to ${Math.round(crop.w)} × ${Math.round(crop.h)} px`,
      `Saved at ${result.width} × ${result.height} px`,
      `Compressed to ${kb(result.blob.size)} as JPEG`,
      clean ? 'Paper background whitened' : '',
    ].filter(Boolean);
  }, [source, crop, result, quarter, clean]);
  const checks = result
    ? [
        {
          label: 'Width',
          value: `${result.width} px`,
          rule: range(target.minWidth, target.maxWidth, (n) => `${n} px`),
          ok: within(result.width, target.minWidth, target.maxWidth),
        },
        {
          label: 'Height',
          value: `${result.height} px`,
          rule: range(target.minHeight, target.maxHeight, (n) => `${n} px`),
          ok: within(result.height, target.minHeight, target.maxHeight),
        },
        {
          label: 'File size',
          value: kb(result.blob.size),
          rule: range(target.minBytes, target.maxBytes, kb),
          ok: within(result.blob.size, target.minBytes, target.maxBytes),
        },
        { label: 'Format', value: 'JPEG (.jpg)', rule: '', ok: true },
      ]
    : [];
  const passes = !!result && checks.every((c) => c.ok);
  const base = original.name.replace(/\.(jpe?g)$/i, '').replace(/-\d+x\d+$/, '');
  const fileName = result ? `${base}-${result.width}x${result.height}.jpg` : '';
  async function save() {
    if (!result) return;
    setSaving(true);
    setError('');
    try {
      const form = new FormData();
      form.append('expectedRevision', String(packetRevision));
      form.append('name', fileName);
      form.append('changes', JSON.stringify(changes));
      if (requirement && useFor) form.append('useFor', JSON.stringify([requirement.id]));
      form.append('file', new File([result.blob], fileName, { type: 'image/jpeg' }));
      const saved = await api<{ document: DocumentRecord; duplicate: boolean }>(
        `/packets/${packetId}/documents/${original.id}/versions`,
        { method: 'POST', body: form },
      );
      await onSaved(saved.document, requirement && useFor ? requirement.title : null);
    } catch (e) {
      setError((e as Error).message);
      setSaving(false);
    }
  }
  return (
    <Dialog wide title="Fit photo or signature" onClose={() => !saving && onClose()}>
      <div className="dialog-body photo-fixer">
        <div className="fixer-layout">
          <div className="fixer-image">
            <div className="fixer-stage" ref={stage}>
              {!source && !error && <p role="status">Opening {original.name}…</p>}
              <div className="fixer-canvas">
                <canvas ref={view} aria-hidden="true" />
                {crop && source && (
                  <div
                    className="crop-box"
                    role="group"
                    aria-label="Crop area"
                    aria-describedby="crop-help"
                    tabIndex={0}
                    style={{
                      left: crop.x * scale,
                      top: crop.y * scale,
                      width: crop.w * scale,
                      height: crop.h * scale,
                    }}
                    onPointerDown={begin('move')}
                    onPointerMove={moveDrag}
                    onPointerUp={() => (drag.current = null)}
                    onPointerCancel={() => (drag.current = null)}
                    onKeyDown={(event) => {
                      const step = Math.max(1, source.width / 100) * (event.shiftKey ? 10 : 1);
                      const moves: Record<string, [number, number]> = {
                        ArrowLeft: [-step, 0],
                        ArrowRight: [step, 0],
                        ArrowUp: [0, -step],
                        ArrowDown: [0, step],
                      };
                      if (event.key in moves) {
                        event.preventDefault();
                        const [dx, dy] = moves[event.key];
                        setCrop(bounded({ ...crop, x: crop.x + dx, y: crop.y + dy }));
                      } else if (event.key === '+' || event.key === '=') {
                        event.preventDefault();
                        zoomTo(Math.min(100, zoom + 5));
                      } else if (event.key === '-') {
                        event.preventDefault();
                        zoomTo(Math.max(10, zoom - 5));
                      }
                    }}
                  >
                    {(['nw', 'ne', 'sw', 'se'] as const).map((corner) => (
                      <span
                        key={corner}
                        className={`crop-handle handle-${corner}`}
                        aria-hidden="true"
                        onPointerDown={begin(corner)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
            <p className="field-help" id="crop-help">
              Drag the frame or its corners. With the keyboard, use the arrow keys to move it and +
              or − to resize.
            </p>
            <div className="fixer-tools">
              <button
                type="button"
                className="outline small-button"
                onClick={() => setQuarter((q) => (q + 3) % 4)}
                disabled={!source}
              >
                <RotateCcw size={14} aria-hidden="true" />
                Rotate left
              </button>
              <button
                type="button"
                className="outline small-button"
                onClick={() => setQuarter((q) => (q + 1) % 4)}
                disabled={!source}
              >
                <RotateCw size={14} aria-hidden="true" />
                Rotate right
              </button>
              <label className="zoom-control">
                Frame size
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={zoom}
                  disabled={!source}
                  onChange={(e) => zoomTo(Number(e.target.value))}
                />
              </label>
            </div>
            <p className="microcopy">
              Original: {bitmap ? `${bitmap.width} × ${bitmap.height} px, ` : ''}
              {formatSize(original.size)}. It stays in your folder unchanged.
            </p>
          </div>
          <div className="fixer-settings">
            <label>
              Fit to
              <select value={choice} onChange={(e) => setChoice(e.target.value)}>
                {options.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
                <option value="custom">Sizes I enter</option>
              </select>
            </label>
            {requirement ? (
              <p className="field-help">
                Limits from your checklist: {describeLimits(target) || 'none recorded'}.
              </p>
            ) : (
              <div className="fixer-custom">
                {(
                  [
                    ['width', 'Width (px)'],
                    ['height', 'Height (px)'],
                    ['minKb', 'Smallest file (KB)'],
                    ['maxKb', 'Largest file (KB)'],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key}>
                    {label}
                    <input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      value={custom[key]}
                      onChange={(e) => setCustom((c) => ({ ...c, [key]: e.target.value }))}
                    />
                  </label>
                ))}
                <p className="field-help">
                  Enter the sizes from your application’s instructions. Leave a box empty for no
                  limit.
                </p>
              </div>
            )}
            <fieldset className="choice-row fixer-shape">
              <legend>Frame shape</legend>
              {(
                [
                  ['limit', 'Match the size limit', !!ratioFor('limit', target)],
                  ['passport', 'Passport photo (3.5 × 4.5)', true],
                  ['square', 'Square', true],
                  ['free', 'Free', true],
                ] as const
              )
                .filter(([, , available]) => available)
                .map(([value, label]) => (
                  <label key={value} className={shape === value ? 'selected' : ''}>
                    <input
                      type="radio"
                      name="fixer-shape"
                      checked={shape === value}
                      onChange={() => setShape(value)}
                    />
                    {label}
                  </label>
                ))}
            </fieldset>
            <label className="checkbox-line">
              <input type="checkbox" checked={clean} onChange={(e) => setClean(e.target.checked)} />
              <span>Whiten the paper background (for signatures)</span>
            </label>
            <div className="fixer-result" aria-live="polite">
              <div className="fixer-preview">
                {result ? (
                  <img
                    src={result.url}
                    alt={`Result: ${result.width} by ${result.height} pixels`}
                    style={{ aspectRatio: `${result.width} / ${result.height}` }}
                  />
                ) : (
                  <span className="fixer-placeholder" />
                )}
              </div>
              <ul className="fixer-checks">
                {checks.map((c) => (
                  <li key={c.label} className={c.ok ? 'is-ok' : 'is-off'}>
                    {c.ok ? (
                      <Check size={15} aria-hidden="true" />
                    ) : (
                      <AlertCircle size={15} aria-hidden="true" />
                    )}
                    <span>
                      {c.label}: <strong className="data">{c.value}</strong>
                      {c.rule && <small> (needs {c.rule})</small>}
                      <span className="visually-hidden">{c.ok ? ', meets it' : ', does not'}</span>
                    </span>
                  </li>
                ))}
              </ul>
              {working && <p className="microcopy">Updating…</p>}
              {result?.problem === 'too-big' && (
                <p className="form-error">
                  Even at the lowest quality this is above the largest file size. Use a smaller
                  frame or check the limit.
                </p>
              )}
              {result?.problem === 'too-small' && (
                <p className="form-error">
                  The image is below the smallest file size even at full quality. Use a larger frame
                  or a sharper original.
                </p>
              )}
            </div>
            {requirement && (
              <label className="checkbox-line">
                <input
                  type="checkbox"
                  checked={useFor}
                  onChange={(e) => setUseFor(e.target.checked)}
                />
                <span>Use the new version for “{requirement.title}”</span>
              </label>
            )}
          </div>
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="button-row dialog-actions">
          <button className="outline" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button
            className="primary"
            disabled={!result || working || saving || !passes}
            onClick={() => void save()}
          >
            {saving ? 'Saving…' : `Save as ${fileName || 'new version'}`}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
