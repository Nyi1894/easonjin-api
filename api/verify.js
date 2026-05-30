import { applyCors, verifyToken } from '../lib/auth.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ success: false, message: '未提供凭证' });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return res.status(401).json({ success: false, message: '凭证无效或已过期' });
  }

  return res.json({ success: true, username: payload.sub });
}