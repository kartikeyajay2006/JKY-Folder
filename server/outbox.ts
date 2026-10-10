import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// Reads the development outbox written when MAIL_TRANSPORT=outbox.
// Usage: npm run outbox            -> list messages, newest first
//        npm run outbox -- latest  -> print the newest message
//        npm run outbox -- 3       -> print message number 3 from the list
const dir = join(process.env.DATA_DIR || '.data', 'outbox');
if (!existsSync(dir)) {
  console.log('No outbox yet. Start the server with MAIL_TRANSPORT=outbox and send an email.');
  process.exit(0);
}
const files = readdirSync(dir)
  .filter((f) => f.endsWith('.eml'))
  .sort()
  .reverse();
const header = (text: string, name: string) =>
  text.match(new RegExp(`^${name}: (.*)$`, 'm'))?.[1] || '';
const arg = process.argv[2];
if (!arg) {
  if (!files.length) console.log('The outbox is empty.');
  files.forEach((file, i) => {
    const text = readFileSync(join(dir, file), 'utf8');
    console.log(
      `${i + 1}. ${header(text, 'Date')}  to ${header(text, 'To')}  ${header(text, 'Subject')}`,
    );
  });
} else {
  const file = files[arg === 'latest' ? 0 : Number(arg) - 1];
  if (!file) throw Error('No such message. Run npm run outbox to list them.');
  console.log(readFileSync(join(dir, file), 'utf8'));
}
