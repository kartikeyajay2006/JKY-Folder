import { afterEach, beforeEach, expect, it } from 'vitest';
import request from 'supertest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from '../server/app';
import { closeTicket, supportQueue, supportView } from '../server/support';
let runtime: ReturnType<typeof createApp>, dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'jky-support-'));
  runtime = createApp({ dataDir: dir, jobs: false, background: false });
});
afterEach(() => {
  runtime.close();
  rmSync(dir, { recursive: true, force: true });
});
async function account(email: string) {
  const agent = request.agent(runtime.app);
  const r = await agent.post('/api/auth/register').send({
    name: 'Support Applicant',
    email,
    password: 'a-strong-test-password',
    adult: true,
    consent: true,
  });
  return { agent, csrf: r.body.csrf as string };
}
async function folder(a: Awaited<ReturnType<typeof account>>) {
  const intake = await a.agent
    .post('/api/intake')
    .set('x-csrf-token', a.csrf)
    .attach('file', Buffer.from('%PDF-1.4 support synthetic'), 'marksheet.pdf');
  return intake.body.packetId as string;
}
const ask = (a: Awaited<ReturnType<typeof account>>, body: object) =>
  a.agent.post('/api/support/tickets').set('x-csrf-token', a.csrf).send(body);

it('shares a redacted, time-limited view only with the applicant’s grant and records every read', async () => {
  const a = await account('support@example.test');
  const pid = await folder(a);
  const plain = await ask(a, {
    category: 'technical',
    summary: 'The preview will not open',
    packetId: pid,
  });
  expect(plain.status).toBe(201);
  expect(plain.body.grant).toBeUndefined();
  expect(supportView(runtime.store, plain.body.reference, 'Operator One')).toMatchObject({
    access: 'none',
  });
  const shared = await ask(a, {
    category: 'result_wrong',
    summary: 'Marksheet shows the wrong state',
    details: 'I linked page 1 but it says fix needed.',
    packetId: pid,
    grantHours: 24,
  });
  expect(shared.body.priority).toBe('high');
  expect(shared.body.grant.active).toBe(true);
  // Most urgent first, and the queue never contains application content.
  const queue = supportQueue(runtime.store);
  expect(queue[0].reference).toBe(shared.body.reference);
  expect(JSON.stringify(queue)).not.toContain('marksheet.pdf');
  const view = supportView(runtime.store, shared.body.reference, 'Operator One');
  expect(view.access).toBe('granted');
  const text = JSON.stringify(view);
  expect(text).toContain('marksheet.pdf');
  expect(text).not.toContain('support synthetic');
  expect(text).not.toMatch(/"pages"|"facts"|"note"/);
  expect(() => supportView(runtime.store, shared.body.reference, '')).toThrow();
  const activity = (await a.agent.get('/api/activity')).body.map(
    (e: { action: string }) => e.action,
  );
  expect(activity).toEqual(
    expect.arrayContaining(['support.requested', 'support.access.granted', 'support.access.used']),
  );
  const revoked = await a.agent
    .post(`/api/support/tickets/${shared.body.id}/revoke`)
    .set('x-csrf-token', a.csrf)
    .send({});
  expect(revoked.body.grant.active).toBe(false);
  expect(supportView(runtime.store, shared.body.reference, 'Operator One').access).toBe('none');
  // An expired grant gives no access either.
  const later = await ask(a, {
    category: 'rules_question',
    summary: 'Which board certificate is needed',
    packetId: pid,
    grantHours: 72,
  });
  expect(
    supportView(runtime.store, later.body.reference, 'Operator One', Date.now() + 73 * 3600000)
      .access,
  ).toBe('none');
  closeTicket(runtime.store, later.body.reference, 'Operator One');
  expect(supportView(runtime.store, later.body.reference, 'Operator One').access).toBe('none');
});

it('keeps requests and grants to their owner and erases them with the account', async () => {
  const a = await account('owner@example.test'),
    b = await account('stranger@example.test');
  const pid = await folder(a);
  expect(
    (
      await ask(b, {
        category: 'technical',
        summary: 'Not my folder',
        packetId: pid,
        grantHours: 24,
      })
    ).status,
  ).toBe(404);
  const t = await ask(a, {
    category: 'privacy',
    summary: 'Delete my files',
    packetId: pid,
    grantHours: 24,
  });
  expect(
    (
      await b.agent
        .post(`/api/support/tickets/${t.body.id}/revoke`)
        .set('x-csrf-token', b.csrf)
        .send({})
    ).status,
  ).toBe(404);
  expect((await b.agent.get('/api/support/tickets')).body).toEqual([]);
  expect((await ask(a, { category: 'technical', summary: 'x' })).status).toBe(400);
  await a.agent.delete('/api/account').set('x-csrf-token', a.csrf).send({ confirmation: 'DELETE' });
  expect(runtime.store.db.prepare('SELECT COUNT(*) AS n FROM support_tickets').get()).toEqual({
    n: 0,
  });
  expect(runtime.store.db.prepare('SELECT COUNT(*) AS n FROM support_grants').get()).toEqual({
    n: 0,
  });
});
