import { Hono } from 'hono';
import { context, reddit, redis } from '@devvit/web/server';
import { verifyReplay } from '../../shared/engine';

export const api = new Hono();
const todayUtc = () => new Date().toISOString().slice(0, 10);
const leaderboardKey = (day: string) => {
  const subreddit = (context.subredditName ?? 'reddit').toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 40);
  return `switchyard:score:v1:${subreddit}:${day}`;
};
function postUrl(): string | null {
  const id = context.postId?.replace(/^t3_/, '');
  const subreddit = context.subredditName;
  return id && subreddit ? `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/comments/${encodeURIComponent(id)}/` : null;
}
async function getTop(day: string) {
  const rows = await redis.zRange(leaderboardKey(day), 0, 9, { by: 'rank' });
  return rows.map((x, i) => ({ rank: i + 1, username: x.member, moves: x.score }));
}
api.get('/leaderboard', async (c) => {
  try {
    const day = todayUtc();
    const [leaders, username, players] = await Promise.all([
      getTop(day), reddit.getCurrentUsername().catch(() => null), redis.zCard(leaderboardKey(day))
    ]);
    return c.json({ day, leaders, players, viewer: username ?? null, postUrl: postUrl() });
  } catch (error) {
    console.error('Switchyard leaderboard error', error);
    return c.json({ error: 'Leaderboard currently unavailable' }, 503);
  }
});
api.post('/score', async (c) => {
  let body: unknown;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON' }, 400); }
  if (!body || typeof body !== 'object') return c.json({ error: 'Invalid body' }, 400);
  const request = body as { day?: unknown; rotations?: unknown };
  const day = todayUtc();
  if (request.day !== day) return c.json({ error: 'The UTC date changed. Start today\'s puzzle.' }, 409);
  const result = verifyReplay(day, request.rotations);
  if (!result.ok) return c.json({ error: result.reason ?? 'Unverified solve' }, 422);
  const username = await reddit.getCurrentUsername().catch(() => null);
  if (!username) return c.json({ error: 'Sign in to Reddit to post a ranked score' }, 401);
  try {
    const key = leaderboardKey(day);
    const existing = await redis.zScore(key, username);
    if (existing === undefined || existing === null || result.moves < existing) {
      await redis.zAdd(key, { member: username, score: result.moves });
      await redis.expire(key, 86400 * 8);
    }
    const [leaders, players] = await Promise.all([getTop(day), redis.zCard(key)]);
    return c.json({ verified: true, day, moves: result.moves, leaders, players, postUrl: postUrl() });
  } catch (error) {
    console.error('Switchyard score save error', error);
    return c.json({ error: 'Score service is currently unavailable' }, 503);
  }
});
