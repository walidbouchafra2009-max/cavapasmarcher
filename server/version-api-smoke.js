import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const directory = await mkdtemp(join(tmpdir(), 'cpm-version-'));
const port = 18788;
const child = spawn(process.execPath, ['server/index.js'], { env:{ ...process.env, PORT:String(port), CPM_DATA_FILE:join(directory, 'projects.json'), CPM_USERS_FILE:join(directory, 'users.json') }, stdio:'ignore' });
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function request(path, options = {}) { for (let attempt = 0; attempt < 30; attempt += 1) { try { return await fetch(`http://127.0.0.1:${port}${path}`, options); } catch { await wait(50); } } throw new Error('API did not start'); }
try {
  const headers = { 'content-type':'application/json' };
  await request('/api/auth/register', { method:'POST', headers, body:JSON.stringify({ name:'Version User', email:'versions@example.test', password:'correct horse battery staple' }) });
  const login = await request('/api/auth/login', { method:'POST', headers, body:JSON.stringify({ email:'versions@example.test', password:'correct horse battery staple' }) });
  const auth = { authorization:`Bearer ${(await login.json()).token}`, 'content-type':'application/json' };
  const created = await request('/api/projects', { method:'POST', headers:auth, body:JSON.stringify({ name:'Versioned Studio', sector:'artisan', country:'FR' }) });
  const project = await created.json();
  const versionResponse = await request(`/api/projects/${project.id}/versions`, { method:'POST', headers:auth, body:JSON.stringify({ name:'Avant livraison', html:'<!doctype html><h1>Version 1</h1>' }) });
  const version = await versionResponse.json();
  const fetched = await request(`/api/projects/${project.id}/versions/${version.id}`, { headers:auth });
  assert.match((await fetched.json()).html, /Version 1/);
  const restored = await request(`/api/projects/${project.id}/versions/${version.id}/restore`, { method:'POST', headers:auth });
  assert.equal(restored.status, 200);
  const site = await request(`/api/projects/${project.id}/site`, { headers:auth });
  assert.match((await site.json()).html, /Version 1/);
  console.log('Project version API smoke tests passed');
} finally { child.kill('SIGTERM'); await rm(directory, { recursive:true, force:true }); }
