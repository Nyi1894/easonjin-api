import {
  applyCors,
  getUser,
  saveUser,
  hashAnswer,
  hashPassword,
  newSalt,
} from '../lib/auth.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { username, securityAnswer, newPassword } = req.body || {};

  if (!username || !securityAnswer || !newPassword) {
    return res.status(400).json({ success: false, message: '所有字段都是必填项' });
  }
  if (typeof newPassword !== 'string' || newPassword.length < 4) {
    return res.status(400).json({ success: false, message: '新密码长度不能少于 4 位' });
  }

  const user = await getUser(username);

  if (!user) {
    return res.status(404).json({ success: false, message: '用户名不存在' });
  }

  const expected = hashAnswer(securityAnswer, user.answerSalt);
  if (expected !== user.securityAnswer) {
    return res.status(401).json({ success: false, message: '安全问题的答案不正确' });
  }

  user.passwordSalt = newSalt();
  user.passwordHash = hashPassword(newPassword, user.passwordSalt);
  await saveUser(user);

  return res.json({
    success: true,
    message: '密码重置成功！请返回登录页面使用新密码登录',
  });
}