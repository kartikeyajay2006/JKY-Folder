import { readFileSync } from 'node:fs';
import { createStore } from './store';
import { saveDraft, transitionPack, digest } from './rule-packs';
import type { RulePack, SourceSnapshot } from '../shared/model';
const [command, ...args] = process.argv.slice(2);
const flag = (name: string) => {
  const i = args.indexOf('--' + name);
  return i < 0 ? '' : args[i + 1] || '';
};
const store = createStore(process.env.DATA_DIR || '.data');
try {
  if (command === 'capture') {
    const url = new URL(flag('url'));
    if (
      url.protocol !== 'https:' ||
      url.hostname !== 'www.uceed.iitb.ac.in' ||
      url.username ||
      url.password ||
      url.port
    )
      throw Error('Source capture currently permits only the official HTTPS UCEED host.');
    if (!flag('id') || !flag('title')) throw Error('Source ID and title are required.');
    const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw Error(`Source returned HTTP ${response.status}.`);
    if (!response.body) throw Error('Source has no body.');
    let content = '',
      size = 0;
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > 1024 * 1024) throw Error('Source exceeds the one MB capture limit.');
        content += decoder.decode(value, { stream: true });
      }
      content += decoder.decode();
    } finally {
      await reader.cancel();
    }
    const plain = content
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const snapshot: SourceSnapshot = {
      id: flag('id'),
      title: flag('title'),
      url: url.href,
      retrievedAt: new Date().toISOString(),
      content: plain,
      sha256: digest(plain),
      representation: 'normalized_html_text',
    };
    store.db
      .prepare(
        'INSERT INTO source_snapshots VALUES(?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload',
      )
      .run(snapshot.id, JSON.stringify(snapshot));
    console.log(
      JSON.stringify({
        id: snapshot.id,
        sha256: snapshot.sha256,
        retrievedAt: snapshot.retrievedAt,
      }),
    );
  } else if (command === 'import-source') {
    const snapshot = JSON.parse(readFileSync(flag('file'), 'utf8')) as SourceSnapshot;
    if (
      !snapshot.id ||
      !snapshot.title ||
      !snapshot.content ||
      digest(snapshot.content) !== snapshot.sha256 ||
      new URL(snapshot.url).hostname !== 'www.uceed.iitb.ac.in' ||
      !snapshot.url.startsWith('https://') ||
      Number.isNaN(Date.parse(snapshot.retrievedAt))
    )
      throw Error('A verified official source snapshot with matching integrity is required.');
    store.db
      .prepare(
        'INSERT INTO source_snapshots VALUES(?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload',
      )
      .run(snapshot.id, JSON.stringify(snapshot));
    console.log(
      JSON.stringify({
        id: snapshot.id,
        sha256: snapshot.sha256,
        representation: snapshot.representation,
      }),
    );
  } else if (command === 'draft') {
    const pack = JSON.parse(readFileSync(flag('file'), 'utf8')) as RulePack;
    console.log(JSON.stringify(saveDraft(store, pack, flag('actor'))));
  } else if (command === 'review' || command === 'publish' || command === 'retire') {
    console.log(
      JSON.stringify(transitionPack(store, flag('id'), flag('version'), command, flag('actor'))),
    );
  } else if (command === 'inspect') {
    console.log(
      JSON.stringify(
        {
          sources: store.db.prepare('SELECT payload FROM source_snapshots').all(),
          packs: store.db.prepare('SELECT payload FROM pack_revisions').all(),
        },
        null,
        2,
      ),
    );
  } else
    throw Error(
      'Use capture --id --url --title; draft --file --actor; review/publish/retire --id --version --actor; or inspect.',
    );
} finally {
  store.db.close();
}
