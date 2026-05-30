# easonjin-api

Vercel Serverless 后端,服务于 [Eason_Jin's Web](https://nyi1894.github.io)。

## API 端点

所有端点都在 `https://<your-vercel-deployment>.vercel.app/api/` 下。

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/register` | 注册账号 |
| POST | `/api/login` | 登录,返回 JWT |
| POST | `/api/get-security-question` | 取回某账号的安全问题 |
| POST | `/api/reset-password` | 验证安全问题答案,重置密码 |
| GET / POST | `/api/verify` | 校验当前 JWT 是否有效(`Authorization: Bearer <token>`) |

## 部署到 Vercel(第一次)

### 1. 把这个目录推到 GitHub

```bash
cd path/to/easonjin-api
git init
git branch -M main
git add -A
git commit -m "feat: 初始化后端 (JWT + Vercel KV)"
# 在 GitHub 网页上新建 easonjin-api 仓库,然后:
git remote add origin https://github.com/Nyi1894/easonjin-api.git
git push -u origin main
```

### 2. 在 Vercel 上 Import 这个仓库

1. https://vercel.com/new
2. 选 `easonjin-api`
3. Framework Preset: **Other**
4. Root Directory 留空
5. 暂时不要点 Deploy,先去配 KV

### 3. 创建 Vercel KV 数据库

1. Project → Storage → Create Database → KV
2. 名称随便,比如 `easonjin-kv`
3. Region 选**离你近**的(比如 hnd1 / sin1)
4. 创建完成后点 "Connect" 把它绑到 `easonjin-api` 项目上(All environments)

绑定后,Vercel 会自动注入这些环境变量到项目里(无需手动复制):
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`
- `KV_URL`

### 4. 配置 JWT 密钥

Project → Settings → Environment Variables → 新增:

| Name | Value | Environment |
|---|---|---|
| `JWT_SECRET` | (随机字符串,至少 32 字符) | Production, Preview, Development |

生成一个随机密钥可以用:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Deploy

返回 Deployments,点最后一次构建的 "Redeploy" 即可。

部署完成后你会拿到一个域名,例如 `https://easonjin-api.vercel.app`。

## 前端配置

把前端 [ai-chat.js](https://github.com/Nyi1894/Nyi1894.github.io) 同目录下的 `Login.html` / `Enroll.html` / `ForgotPassword.html` / `private.html` 中的 API 基地址换成上面拿到的域名(已经在前端代码里集中改好,只需要改一处)。

## CORS 白名单

前端域名白名单写在 [lib/auth.js](lib/auth.js) 的 `ALLOWED_ORIGINS` 里。
默认包含:
- `https://nyi1894.github.io`
- `http://localhost:*` (开发用)

如果以后绑定自定义域名,记得加进来。

## 安全说明

- 密码用 PBKDF2-SHA512 + 每用户独立 16 字节随机 salt + 100k 次迭代
- 安全答案同样独立 salt 哈希,服务端无法看到明文
- JWT 使用 HS256,密钥来自 `JWT_SECRET` 环境变量
- Token 有效期 7 天,前端存 localStorage,每次进 `private.html` 调 `/api/verify` 校验