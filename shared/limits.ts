// Single source for product limits. The server enforces them; the client reads them from /api/catalog.
const MB = 1024 * 1024;
export const limits = {
  fileBytes: 10 * MB,
  packetFiles: 10,
  packetBytes: 30 * MB,
  packets: 20,
  requirements: 50,
  instructionChars: 20000,
  passwordMin: 12,
  passwordMax: 128,
  sessionHours: 24,
  formats: [
    { mime: 'application/pdf', label: 'PDF', extensions: ['.pdf'] },
    { mime: 'image/jpeg', label: 'JPEG', extensions: ['.jpg', '.jpeg'] },
  ],
} as const;
export type Limits = typeof limits;
