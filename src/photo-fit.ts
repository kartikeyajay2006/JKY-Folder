import type { Requirement } from '../shared/model';

/* Pure sizing rules for fitting a photo or signature to a checklist item's limits. */
export interface FitTarget {
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  minBytes?: number;
  maxBytes?: number;
}
export interface Crop {
  x: number;
  y: number;
  w: number;
  h: number;
}
export type Shape = 'limit' | 'passport' | 'square' | 'free';

const limitKeys = [
  'minWidth',
  'maxWidth',
  'minHeight',
  'maxHeight',
  'minBytes',
  'maxBytes',
] as const;
/** Checklist items whose limits a JPEG can be fitted to. */
export const fittable = (r: Requirement) =>
  r.mime !== 'application/pdf' && limitKeys.some((k) => r[k] !== undefined);
export const targetOf = (r?: Requirement): FitTarget =>
  r ? Object.fromEntries(limitKeys.filter((k) => r[k] !== undefined).map((k) => [k, r[k]])) : {};
export const kb = (bytes: number) => `${Math.round(bytes / 1024)} KB`;
export const within = (value: number, min?: number, max?: number) =>
  (min === undefined || value >= min) && (max === undefined || value <= max);
export function range(
  min: number | undefined,
  max: number | undefined,
  unit: (n: number) => string,
) {
  if (min !== undefined && max !== undefined)
    return min === max ? unit(min) : `${unit(min)} to ${unit(max)}`;
  if (max !== undefined) return `at most ${unit(max)}`;
  if (min !== undefined) return `at least ${unit(min)}`;
  return '';
}
export function describeLimits(t: FitTarget) {
  const px = (n: number) => `${n} px`;
  return [
    range(t.minWidth, t.maxWidth, px) && `width ${range(t.minWidth, t.maxWidth, px)}`,
    range(t.minHeight, t.maxHeight, px) && `height ${range(t.minHeight, t.maxHeight, px)}`,
    range(t.minBytes, t.maxBytes, kb) && `file ${range(t.minBytes, t.maxBytes, kb)}`,
  ]
    .filter(Boolean)
    .join(', ');
}
export function ratioFor(shape: Shape, t: FitTarget) {
  if (shape === 'passport') return 35 / 45;
  if (shape === 'square') return 1;
  if (shape === 'limit') {
    if (t.maxWidth && t.maxHeight) return t.maxWidth / t.maxHeight;
    if (t.minWidth && t.minHeight) return t.minWidth / t.minHeight;
  }
  return null;
}
/** The largest crop of the given shape, centred. */
export function largest(width: number, height: number, ratio: number | null): Crop {
  if (!ratio) return { x: 0, y: 0, w: width, h: height };
  const w = width / height > ratio ? height * ratio : width;
  const h = w / ratio;
  return { x: (width - w) / 2, y: (height - h) / 2, w, h };
}
/**
 * Output pixels: shrink to the maximums, enlarge only as far as the minimums require. The frame's
 * shape is kept; a limit is only met exactly when it is less than a pixel away, so nothing is
 * ever stretched. A frame of the wrong shape fails the checks instead.
 */
export function outputSize(crop: Crop, t: FitTarget) {
  let scale = Math.min(1, 4096 / Math.max(crop.w, crop.h));
  if (t.maxWidth) scale = Math.min(scale, t.maxWidth / crop.w);
  if (t.maxHeight) scale = Math.min(scale, t.maxHeight / crop.h);
  if (t.minWidth) scale = Math.max(scale, t.minWidth / crop.w);
  if (t.minHeight) scale = Math.max(scale, t.minHeight / crop.h);
  const snap = (v: number, min?: number, max?: number) =>
    max !== undefined && v > max && v - max < 1.5
      ? max
      : min !== undefined && v < min && min - v < 1.5
        ? min
        : Math.round(v);
  return {
    w: Math.max(1, snap(crop.w * scale, t.minWidth, t.maxWidth)),
    h: Math.max(1, snap(crop.h * scale, t.minHeight, t.maxHeight)),
  };
}
