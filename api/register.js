import {
  applyCors,
  userExists,
  saveUser,
  hashPassword,
  hashAnswer,
  newSalt,
} from '../lib/auth.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { username, password, securityQuestion, securityAnswer } = req.body || {};

  if (!username || !password || !securityQuestion || !securityAnswer) {
    return res.status(400).json({ success: false, message: '所有字段都是必填项' });
  }
  if (typeof username !== 'string' || username.length < 2 || username.length > 20) {
    return res.status(400).json({ success: false, message: '用户名长度需在 2-20 个字符之间' });
  }
  if (typeof password !== 'string' || password.length < 4) {
    return res.status(400).json({ success: false, message: '密码长度不能少于 4 位' });
  }
  if (typeof securityAnswer !== 'string' || securityAnswer.trim().length < 1) {
    return res.status(400).json({ success: false, message: '请填写安全问题的答案' });
  }

  if (await userExists(username)) {
    return res.status(409).json({ success: false, message: '该用户名已被注册' });
  }

  const passwordSalt = newSalt();
  const answerSalt = newSalt();

  await saveUser({
    username,
    passwordSalt,
    passwordHash: hashPassword(password, passwordSalt),
    securityQuestion,
    answerSalt,
    securityAnswer: hashAnswer(securityAnswer, answerSalt),
    createdAt: new Date().toISOString(),
  });

  return res.json({ success: true, message: '注册成功！请返回登录页面进行登录' });
}