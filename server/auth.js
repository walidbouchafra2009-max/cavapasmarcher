import { randomUUID, scrypt as scryptCallback, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const scrypt = promisify(scryptCallback);
const file = process.env.CPM_USERS_FILE || join(dirname(fileURLToPath(import.meta.url)), 'data', 'users.json');
const sessionTtlMs = 7 * 24 * 60 * 60 * 1000;
const sessions = new Map();

async function load() { try { const value = JSON.parse(await readFile(file, 'utf8')); return Array.isArray(value) ? value : []; } catch { return []; } }
async function save(value) {
  await mkdir(dirname(file), { recursive: true });
  const temporary = `${file}.${process.pid}.${randomUUID()}.tmp`;
  await writeFile(temporary, JSON.stringify(value, null, 2), { mode: 0o600 });
  await rename(temporary, file);
}
async function hash(password) { const salt = randomBytes(16).toString('hex'); const key = (await scrypt(password, salt, 64)).toString('hex'); return `${salt}:${key}`; }
async function verify(password, stored) { const [salt, expected] = String(stored || '').split(':'); if (!salt || !expected) return false; const actual = (await scrypt(password, salt, 64)).toString('hex'); return actual.length === expected.length && timingSafeEqual(Buffer.from(actual), Buffer.from(expected)); }
function publicUser(user) { return { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt }; }
function purgeExpired() { const now = Date.now(); for (const [token, session] of sessions) if (session.expiresAt <= now) sessions.delete(token); }

export async function register(input = {}) {
  const email = String(input.email || '').trim().toLowerCase(); const password = String(input.password || ''); const name = String(input.name || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw Object.assign(new Error('valid email is required'), { status: 400 });
  if (password.length < 10) throw Object.assign(new Error('password must contain at least 10 characters'), { status: 400 });
  const users = await load(); if (users.some((user) => user.email === email)) throw Object.assign(new Error('email already registered'), { status: 409 });
  const user = { id: randomUUID(), email, name: name || email.split('@')[0], passwordHash: await hash(password), role: 'agency', createdAt: new Date().toISOString() };
  users.push(user); await save(users); return publicUser(user);
}
export async function login(input = {}) {
  const email = String(input.email || '').trim().toLowerCase(); const users = await load(); const user = users.find((item) => item.email === email);
  if (!user || !(await verify(String(input.password || ''), user.passwordHash))) throw Object.assign(new Error('invalid credentials'), { status: 401 });
  purgeExpired(); const token = `${randomUUID()}${randomUUID()}`; const expiresAt = Date.now() + sessionTtlMs; sessions.set(token, { userId: user.id, expiresAt });
  return { token, expiresAt: new Date(expiresAt).toISOString(), user: publicUser(user) };
}
export async function authenticate(req) { purgeExpired(); const header = String(req.headers.authorization || ''); const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''; const session = sessions.get(token); if (!session) return null; const user = (await load()).find((item) => item.id === session.userId); return user ? { ...publicUser(user), token } : null; }
export function logout(token) { if (token) sessions.delete(String(token).trim()); }
