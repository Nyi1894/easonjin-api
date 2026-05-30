import { applyCors, getUser } from '../lib/auth.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { username } = req.body || {};

  if (!username) {
    return res.status(400).json({ success: false, message: '请输入用户名' });
  }

  const user = await getUser(username);

  if (!user) {
    return res.status(404).json({ success: false, message: '用户名不存在' });
  }
  if (!user.securityQuestion) {
    return res.status(400).json({
      success: false,
      message: '该账号没有设置安全问题，无法找回密码',
    });
  }

  return res.json({ success: true, securityQuestion: user.securityQuestion });
}