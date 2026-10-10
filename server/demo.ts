import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import sharp from 'sharp';
import { randomUUID, createHash } from 'node:crypto';
import { writeFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import type { Store } from './store';
import type { Packet, DocumentRecord } from '../shared/model';
import { uceedPack } from '../shared/packs';
import { evaluate } from '../shared/evaluate';
async function makePdf(title: string, lines: string[]) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const page = pdf.addPage([595, 842]);
  page.drawText('SYNTHETIC DEMO - NOT AN OFFICIAL DOCUMENT', {
    x: 42,
    y: 785,
    size: 11,
    font,
    color: rgb(0.6, 0.2, 0.1),
  });
  page.drawText(title, { x: 42, y: 710, size: 24, font });
  lines.forEach((line, i) => page.drawText(line, { x: 42, y: 650 - i * 32, size: 13, font }));
  return Buffer.from(await pdf.save());
}
export async function seedDemo(store: Store, userId: string) {
  const now = new Date().toISOString();
  const id = randomUUID();
  const packet: Packet = {
    id,
    title: 'My design school application',
    packId: uceedPack.id,
    revision: 1,
    profile: {
      education: 'completed',
      category: 'ews',
      nameChanged: 'yes',
      disability: 'none',
      accommodation: 'no',
      nationality: 'indian',
    },
    links: {},
    createdAt: now,
    updatedAt: now,
  };
  const photo = await sharp(
    Buffer.from(
      '<svg width="480" height="640" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="640" fill="#e6ece7"/><circle cx="240" cy="230" r="90" fill="#9db0a8"/><path d="M80 600V490a160 160 0 0 1 320 0v110" fill="#57786b"/><text x="140" y="55" font-size="22">DEMO IMAGE</text></svg>',
    ),
  )
    .jpeg()
    .toBuffer();
  const signature = await sharp(
    Buffer.from(
      '<svg width="650" height="220" xmlns="http://www.w3.org/2000/svg"><rect width="650" height="220" fill="white"/><path d="M60 155q70-140 85-80t65 35q80-80 75-5t90-20q60 60 145-10" stroke="#263e45" stroke-width="4" fill="none"/><text x="50" y="40" font-size="16">SYNTHETIC SIGNATURE</text></svg>',
    ),
  )
    .jpeg()
    .toBuffer();
  const entries = [
    {
      name: 'portrait.jpg',
      bytes: photo,
      mime: 'image/jpeg',
      requirement: 'photo',
      note: 'Demo portrait personally inspected for this example.',
      text: '',
      width: 480,
      height: 640,
    },
    {
      name: 'signature.jpg',
      bytes: signature,
      mime: 'image/jpeg',
      requirement: 'signature',
      note: '',
      text: '',
      width: 650,
      height: 220,
    },
    {
      name: 'age-evidence.pdf',
      bytes: await makePdf('Example age evidence', [
        'Name: Aanya Mehra',
        'Date of birth: 10 June 2006',
        'This fictional file exists only to demonstrate evidence review.',
      ]),
      mime: 'application/pdf',
      requirement: 'age',
      note: 'Demo date of birth compared against the fictional profile.',
      text: 'SYNTHETIC DEMO — NOT AN OFFICIAL DOCUMENT\nName: Aanya Mehra\nDate of birth: 10 June 2006',
    },
    {
      name: 'class-xii-certificate.pdf',
      bytes: await makePdf('Example education certificate', [
        'Name: Aanya Sharma',
        'Qualifying year: 2026',
        'This fictional file is not a credential or certificate.',
      ]),
      mime: 'application/pdf',
      requirement: 'qualifying',
      note: 'Demo education details reviewed; the name differs from the profile.',
      text: 'SYNTHETIC DEMO — NOT AN OFFICIAL DOCUMENT\nName: Aanya Sharma\nQualifying year: 2026',
    },
  ];
  const written: string[] = [];
  try {
    store.db.transaction(() => {
      store.db.prepare('INSERT INTO packets VALUES(?,?,?)').run(id, userId, JSON.stringify(packet));
      for (const entry of entries) {
        const docId = randomUUID(),
          key = randomUUID();
        writeFileSync(join(store.objects, key), entry.bytes, { mode: 0o600 });
        written.push(key);
        const doc: DocumentRecord = {
          id: docId,
          packetId: id,
          name: entry.name,
          size: entry.bytes.length,
          hash: createHash('sha256').update(entry.bytes).digest('hex'),
          mime: entry.mime,
          status: 'ready',
          pageCount: 1,
          pages: [{ number: 1, text: entry.text }],
          width: entry.width,
          height: entry.height,
          createdAt: now,
        };
        store.db
          .prepare('INSERT INTO documents VALUES(?,?,?,?)')
          .run(docId, id, key, JSON.stringify(doc));
        packet.links[entry.requirement] = {
          documentId: docId,
          pageFrom: 1,
          pageTo: 1,
          review: entry.note ? 'confirmed' : 'unreviewed',
          note: entry.note,
        };
      }
      store.savePacket(packet);
      const run = evaluate(packet, store.documents(id), uceedPack, randomUUID());
      store.db
        .prepare('INSERT INTO runs VALUES(?,?,?,?)')
        .run(run.id, id, now, JSON.stringify(run));
      store.audit(userId, 'demo.created', id);
    })();
  } catch (error) {
    written.forEach((key) => unlinkSync(join(store.objects, key)));
    throw error;
  }
  return id;
}
