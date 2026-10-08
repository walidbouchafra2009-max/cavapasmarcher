import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const root = dirname(fileURLToPath(import.meta.url));
const prospectsFile = process.env.CPM_PROSPECTS_FILE || join(root, 'data', 'prospects.json');

async function load() {
  try {
    const value = JSON.parse(await readFile(prospectsFile, 'utf8'));
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

async function save(value) {
  await mkdir(dirname(prospectsFile), { recursive: true });
  await writeFile(prospectsFile, JSON.stringify(value, null, 2));
}

function scoreProspect(prospect) {
  let score = 0;
  if (prospect.website) score += 20; else score -= 10;
  if (prospect.email) score += 15;
  if (prospect.phone) score += 10;
  if (prospect.analysis?.responsive) score += 10;
  if (prospect.analysis?.https) score += 10;
  if (prospect.analysis?.hasContact) score += 15;
  if (prospect.analysis?.hasH1) score += 5;
  if (!prospect.website || prospect.analysis?.score < 50) score += 30;
  return Math.max(0, Math.min(100, score));
}

async function analyzeWebsite(url) {
  if (!url || typeof url !== 'string') throw new Error('URL is required');
  const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
  const urlObj = new URL(cleanUrl);
  const hostname = urlObj.hostname;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(cleanUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CavaPasMarcher/1.0)' },
      signal: controller.signal,
      redirect: 'follow'
    });
    clearTimeout(timeout);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();
    const hasHttps = cleanUrl.startsWith('https');
    const hasViewport = html.includes('viewport');
    const hasTitle = /<title[^>]*>(.+?)<\/title>/i.test(html);
    const hasDescription = html.includes('meta name="description"');
    const hasH1 = /<h1[^>]*>/i.test(html);
    const hasContact = /contact|email|phone|call|nous joindre|contact@/i.test(html);
    const responseSize = html.length;
    const score = Math.round((hasViewport ? 20 : 0) + (hasTitle ? 15 : 0) + (hasDescription ? 15 : 0) + (hasH1 ? 10 : 0) + (hasContact ? 20 : 0) + (hasHttps ? 10 : 0) + (responseSize > 10000 ? 10 : 0));
    return {
      url: cleanUrl,
      hostname,
      https: hasHttps,
      responsive: hasViewport,
      title: hasTitle,
      description: hasDescription,
      hasH1,
      hasContact,
      pageSize: responseSize,
      score,
      analyzedAt: new Date().toISOString()
    };
  } catch (error) {
    return {
      url: cleanUrl,
      hostname,
      error: error.message,
      https: false,
      responsive: false,
      title: false,
      description: false,
      hasH1: false,
      hasContact: false,
      pageSize: 0,
      score: 0,
      analyzedAt: new Date().toISOString()
    };
  }
}

export async function getProspects(userId) {
  const prospects = await load();
  return prospects.filter((p) => p.ownerId === userId);
}

export async function createProspect(userId, input) {
  const name = String(input.name || '').trim();
  const sector = String(input.sector || '').trim();
  const country = String(input.country || 'FR').toUpperCase();
  if (!name || !sector) throw new Error('name and sector are required');
  const prospect = {
    id: randomUUID(),
    ownerId: userId,
    name,
    sector,
    country,
    city: String(input.city || '').trim(),
    website: String(input.website || '').trim() || null,
    email: String(input.email || '').trim() || null,
    phone: String(input.phone || '').trim() || null,
    notes: String(input.notes || '').trim(),
    status: 'new',
    analysis: null,
    score: 0,
    tags: Array.isArray(input.tags) ? input.tags : [],
    source: String(input.source || 'manual').trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  if (prospect.website) {
    prospect.analysis = await analyzeWebsite(prospect.website);
    prospect.score = scoreProspect(prospect);
    prospect.status = 'analyzed';
  }
  const prospects = await load();
  prospects.push(prospect);
  await save(prospects);
  return prospect;
}

export async function updateProspect(userId, prospectId, input) {
  const prospects = await load();
  const index = prospects.findIndex((p) => p.id === prospectId && p.ownerId === userId);
  if (index < 0) throw new Error('prospect not found');
  const prospect = prospects[index];
  prospect.name = String(input.name || prospect.name).trim();
  prospect.sector = String(input.sector || prospect.sector).trim();
  prospect.country = String(input.country || prospect.country).toUpperCase();
  prospect.city = String(input.city || prospect.city).trim();
  prospect.email = String(input.email || prospect.email).trim() || null;
  prospect.phone = String(input.phone || prospect.phone).trim() || null;
  prospect.notes = String(input.notes || prospect.notes).trim();
  prospect.status = String(input.status || prospect.status).trim();
  prospect.tags = Array.isArray(input.tags) ? input.tags : prospect.tags;
  if (input.website && input.website !== prospect.website) {
    prospect.website = String(input.website).trim() || null;
    if (prospect.website) {
      prospect.analysis = await analyzeWebsite(prospect.website);
      prospect.score = scoreProspect(prospect);
      prospect.status = 'analyzed';
    }
  }
  prospect.updatedAt = new Date().toISOString();
  prospects[index] = prospect;
  await save(prospects);
  return prospect;
}

export async function deleteProspect(userId, prospectId) {
  let prospects = await load();
  prospects = prospects.filter((p) => !(p.id === prospectId && p.ownerId === userId));
  await save(prospects);
}

export { scoreProspect, analyzeWebsite };
