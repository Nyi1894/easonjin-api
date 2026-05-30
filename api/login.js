import {
  applyCors,
  getUser,
  hashPassword,
  signToken,
} from '../lib/auth.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ success: false, message: '请输入用户名和密码' });
  }

  const user = await getUser(username);

  if (!user) {
    return res.status(401).json({ success: false, message: '用户名或密码错误' });
  }

  const expected = hashPassword(password, user.passwordSalt);
  if (expected !== user.passwordHash) {
    return res.status(401).json({ success: false, message: '用户名或密码错误' });
  }

  const token = await signToken({ sub: user.username });

  return res.json({
    success: true,
    message: '登录成功',
    username: user.username,
    token,
  });
}