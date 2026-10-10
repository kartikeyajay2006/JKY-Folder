import type { DocumentRecord } from './model';

/**
 * Recognises common Indian application documents from their own words, file name and shape.
 * A guess for sorting and suggestions only: it never decides what a document is.
 */
export interface DocumentType {
  id: string;
  label: string;
  /** Wording that identifies the document on its own. */
  strong: RegExp[];
  /** Wording that only supports a guess. */
  weak: RegExp[];
  /** Words in a file name or a checklist item's title. */
  names: RegExp;
}
export const documentTypes: DocumentType[] = [
  {
    id: 'class10',
    label: 'Class 10 marksheet or certificate',
    strong: [
      /(?<!senior )secondary school (examination|certificate)/i,
      /\bmatriculation\b/i,
      /\bsslc\b/i,
      /high school examination/i,
    ],
    weak: [/\bclass\s*[-:]?\s*(x|10)(th)?\b/i],
    names: /\b(10th|class[\s_-]?(x|10)|ssc|sslc|matric(ulation)?)\b/i,
  },
  {
    id: 'class12',
    label: 'Class 12 marksheet or certificate',
    strong: [/senior school certificate/i, /higher secondary/i, /intermediate examination/i],
    weak: [/\bclass\s*[-:]?\s*(xii|12)(th)?\b/i],
    names: /\b(12th|class[\s_-]?(xii|12)|hsc|intermediate|senior[\s_-]?secondary)\b/i,
  },
  {
    id: 'aadhaar',
    label: 'Aadhaar card',
    strong: [/\baadhaar\b/i, /unique identification authority/i],
    weak: [/\b\d{4}\s\d{4}\s\d{4}\b/],
    names: /\b(aadhaar|aadhar|uidai)\b/i,
  },
  {
    id: 'pan',
    label: 'PAN card',
    strong: [/permanent account number/i],
    weak: [/income tax department/i, /\b[A-Z]{5}\d{4}[A-Z]\b/],
    names: /\bpan([\s_-]?card)?\b/i,
  },
  {
    id: 'passport',
    label: 'Passport',
    strong: [/\bpassport\s*(no|number)/i, /\bP<IND/],
    weak: [/republic of india/i],
    names: /\bpassport\b(?![\s_-]?size)/i,
  },
  {
    id: 'category',
    label: 'Caste or category certificate',
    strong: [
      /scheduled caste/i,
      /scheduled tribe/i,
      /other backward class/i,
      /non[-\s]?creamy layer/i,
      /caste certificate/i,
    ],
    weak: [],
    names: /\b(caste|category|obc|ncl)\b/i,
  },
  {
    id: 'ews',
    label: 'EWS certificate',
    strong: [/economically weaker section/i],
    weak: [/\bews\b/i],
    names: /\bews\b/i,
  },
  {
    id: 'income',
    label: 'Income certificate',
    strong: [/income certificate/i],
    weak: [/annual (family )?income/i],
    names: /\bincome\b/i,
  },
  {
    id: 'domicile',
    label: 'Domicile or residence certificate',
    strong: [/domicile certificate/i, /residence certificate/i],
    weak: [/\bdomicile\b/i, /permanent(ly)? resident/i],
    names: /\b(domicile|residence|resident)\b/i,
  },
  {
    id: 'disability',
    label: 'Disability certificate',
    strong: [/disability certificate/i, /persons? with disabilit/i, /percentage of disability/i],
    weak: [/\budid\b/i],
    names: /\b(disability|pwd|pwbd|udid)\b/i,
  },
  {
    id: 'birth',
    label: 'Birth certificate',
    strong: [/certificate of birth/i, /birth certificate/i, /registration of births/i],
    weak: [],
    names: /\bbirth\b/i,
  },
  {
    id: 'transfer',
    label: 'Transfer or migration certificate',
    strong: [/transfer certificate/i, /migration certificate/i, /school leaving certificate/i],
    weak: [],
    names: /\b(tc|transfer|migration|leaving)\b/i,
  },
  {
    id: 'name_change',
    label: 'Name change proof',
    strong: [/change of name/i],
    weak: [/gazette/i, /\baffidavit\b/i],
    names: /\b(gazette|affidavit|name[\s_-]?change)\b/i,
  },
  {
    id: 'resume',
    label: 'Résumé or CV',
    strong: [/curriculum vitae/i],
    weak: [/\bskills\b/i, /\b(work )?experience\b[\s\S]*\beducation\b/i],
    names: /\b(resume|cv|curriculum)\b/i,
  },
  {
    id: 'bank',
    label: 'Bank passbook or cheque',
    strong: [/\bpassbook\b/i],
    weak: [/\bifsc\b/i, /account (no|number)/i],
    names: /\b(bank|passbook|cheque|check)\b/i,
  },
  {
    id: 'photo',
    label: 'Photograph',
    strong: [],
    weak: [],
    names: /\b(photo|photograph|passport[\s_-]?size|picture|selfie)\b/i,
  },
  {
    id: 'signature',
    label: 'Signature',
    strong: [],
    weak: [],
    names: /\b(sign|signature)\b/i,
  },
];

export interface DocumentGuess {
  id: string;
  label: string;
  confidence: number;
  reasons: string[];
}

/** The most likely type of an inspected document, or null when nothing points clearly. */
export function classifyDocument(
  doc: Pick<DocumentRecord, 'name' | 'mime' | 'pages' | 'width' | 'height' | 'status'>,
): DocumentGuess | null {
  if (doc.status !== 'ready') return null;
  const name = doc.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ');
  const text = doc.pages
    .filter((p) => p.method !== 'ocr' || (p.confidence || 0) >= 60)
    .map((p) => p.text)
    .join('\n')
    .slice(0, 20000);
  const guesses = documentTypes.map((type) => {
    const reasons: string[] = [];
    let score = 0;
    if (type.names.test(name)) {
      score += 2;
      reasons.push('file name');
    }
    const strong = type.strong.filter((pattern) => pattern.test(text)).length,
      weak = type.weak.filter((pattern) => pattern.test(text)).length;
    if (strong || weak) {
      score += Math.min(2, strong) * 2 + Math.min(2, weak);
      const hits = strong + weak;
      reasons.push(`${hits} matching phrase${hits === 1 ? '' : 's'} in the document`);
    }
    // Shape: photographs are portrait images; signatures are wide, short images.
    if (doc.mime === 'image/jpeg' && doc.width && doc.height) {
      const ratio = doc.width / doc.height;
      if (type.id === 'photo' && ratio >= 0.6 && ratio <= 0.95 && !text.trim()) {
        score += 1.5;
        reasons.push('portrait image');
      }
      if (type.id === 'signature' && ratio >= 2) {
        score += 1.5;
        reasons.push('wide, short image');
      }
    }
    return { id: type.id, label: type.label, score, reasons };
  });
  const best = guesses.sort((a, b) => b.score - a.score)[0];
  if (best.score < 2) return null;
  return {
    id: best.id,
    label: best.label,
    confidence: Math.min(0.95, 0.35 + best.score * 0.12),
    reasons: best.reasons,
  };
}

/** The document type a checklist item asks for, judged from its title and description. */
export function typeForRequirement(title: string, description = '') {
  const words = `${title} ${description}`;
  return (
    documentTypes.find((t) => t.names.test(title)) || documentTypes.find((t) => t.names.test(words))
  );
}
