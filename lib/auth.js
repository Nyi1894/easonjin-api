import crypto from 'node:crypto';
import { kv } from '@vercel/kv';
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-secret-change-me-in-production'
);
const TOKEN_TTL = '7d';

export function hashPassword(password, salt) {
  return crypto
    .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
    .toString('hex');
}

export function hashAnswer(answer, salt) {
  return crypto
    .pbkdf2Sync(answer.toLowerCase().trim(), salt, 100000, 64, 'sha512')
    .toString('hex');
}

export function newSalt() {
  return crypto.randomBytes(16).toString('hex');
}

export async function getUser(username) {
  return await kv.get(`user:${username}`);
}

export async function saveUser(user) {
  await kv.set(`user:${user.username}`, user);
}

export async function userExists(username) {
  return (await kv.exists(`user:${username}`)) === 1;
}

export async function signToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(JWT_SECRET);
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

const ALLOWED_ORIGINS = [
  'https://nyi1894.github.io',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5500',
];

export function applyCors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}