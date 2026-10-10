import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import sharp from 'sharp';
import { createCanvas } from '@napi-rs/canvas';
const require = createRequire(import.meta.url);
let ocrWorker;
let ocrPages = 0;
async function readImage(bytes, number, width, height) {
  if (++ocrPages > 8)
    return {
      number,
      text: '',
      method: 'unreadable',
      width,
      height,
      warning: 'OCR is limited to eight pages per document. Review this page manually.',
    };
  try {
    if (!ocrWorker) {
      const { createWorker } = await import('tesseract.js');
      ocrWorker = await createWorker('eng', 1, {
        langPath: join(
          dirname(require.resolve('@tesseract.js-data/eng/package.json')),
          '4.0.0_best_int',
        ),
        cacheMethod: 'none',
        logger: () => {},
      });
    }
    const { data } = await ocrWorker.recognize(bytes, {}, { text: true, tsv: true });
    const tokens = (data.tsv || '')
      .split('\n')
      .slice(1)
      .flatMap((line) => {
        const cols = line.split('\t');
        if (cols[0] !== '5' || !cols[11]?.trim()) return [];
        const [x, y, w, h, confidence] = cols.slice(6, 11).map(Number);
        return [{ text: cols.slice(11).join('\t'), box: [x, y, w, h], confidence }];
      })
      .slice(0, 3000);
    return {
      number,
      text: data.text.slice(0, 18000).trim(),
      method: data.text.trim() ? 'ocr' : 'unreadable',
      confidence: data.confidence,
      width,
      height,
      tokens,
      warning:
        data.confidence < 85
          ? 'OCR is uncertain. Compare the text with the original; English recognition is the supported baseline.'
          : undefined,
    };
  } catch {
    return {
      number,
      text: '',
      method: 'unreadable',
      width,
      height,
      warning: 'Text recognition was unavailable. Review the original manually.',
    };
  }
}
async function inspect(path) {
  const bytes = readFileSync(path);
  if (bytes.subarray(0, 5).toString() === '%PDF-') {
    const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const loading = getDocument({
      data: new Uint8Array(bytes),
      isEvalSupported: false,
      useSystemFonts: false,
      disableFontFace: true,
      stopAtErrors: true,
      verbosity: 0,
    });
    const pdf = await loading.promise;
    try {
      if (pdf.numPages > 20)
        throw Error('This development release supports up to 20 pages per file.');
      const pages = [];
      for (let n = 1; n <= pdf.numPages; n++) {
        const page = await pdf.getPage(n);
        const content = await page.getTextContent();
        const viewport = page.getViewport({ scale: 1 });
        const tokens = content.items
          .filter((i) => 'str' in i)
          .slice(0, 3000)
          .map((i) => {
            const [x, y] = viewport.convertToViewportPoint(i.transform[4], i.transform[5]);
            return {
              text: i.str,
              box: [x, y - Math.abs(i.height), i.width, Math.abs(i.height)],
              confidence: 100,
            };
          });
        const text = content.items
          .filter((i) => 'str' in i)
          .map((i) => i.str + (i.hasEOL ? '\n' : ' '))
          .join('');
        if (text.trim())
          pages.push({
            number: n,
            text: text.slice(0, 18000).trim(),
            method: 'native',
            confidence: 100,
            width: viewport.width,
            height: viewport.height,
            tokens,
            warning:
              text.length > 18000
                ? 'Page text exceeded the extraction limit. Review the original for omitted text.'
                : undefined,
          });
        else {
          const scale = Math.min(2, 1600 / Math.max(viewport.width, viewport.height));
          const renderView = page.getViewport({ scale });
          const canvas = createCanvas(Math.ceil(renderView.width), Math.ceil(renderView.height));
          await page.render({
            canvas,
            canvasContext: canvas.getContext('2d'),
            viewport: renderView,
          }).promise;
          pages.push(await readImage(canvas.toBuffer('image/png'), n, canvas.width, canvas.height));
        }
        page.cleanup();
      }
      return {
        mime: 'application/pdf',
        pageCount: pdf.numPages,
        pages,
        extractionVersion: 'native-ocr-eng.1',
      };
    } finally {
      await loading.destroy();
    }
  }
  if (!(bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255))
    throw Error(
      'Only actual PDF or JPEG files are supported. Renaming a file does not convert it.',
    );
  const image = sharp(bytes, { limitInputPixels: 20_000_000, failOn: 'warning' });
  const metadata = await image.metadata();
  if (metadata.format !== 'jpeg' || !metadata.width || !metadata.height)
    throw Error('The JPEG image could not be inspected.');
  const decoded = await image
    .rotate()
    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
    .png()
    .toBuffer({ resolveWithObject: true });
  const rotated = [5, 6, 7, 8].includes(metadata.orientation);
  return {
    mime: 'image/jpeg',
    pageCount: 1,
    pages: [await readImage(decoded.data, 1, decoded.info.width, decoded.info.height)],
    width: rotated ? metadata.height : metadata.width,
    height: rotated ? metadata.width : metadata.height,
    extractionVersion: 'native-ocr-eng.1',
  };
}
inspect(process.argv[2])
  .then((result) => process.send?.({ ok: true, result }))
  .catch((error) =>
    process.send?.({
      ok: false,
      error:
        error?.name === 'PasswordException'
          ? 'Password-protected PDFs are unsupported. Upload an unlocked copy if permitted.'
          : String(error.message).slice(0, 240),
    }),
  )
  .finally(async () => {
    await ocrWorker?.terminate();
    process.disconnect?.();
  });
