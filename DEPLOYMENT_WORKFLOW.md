# YouthLoop Deployment Workflow (Local Build → SSH Deploy)

Build locally → transfer via SSH → run on server with Docker Compose.
No registry (GHCR removed). Images are built locally and transferred directly.
BaoTa panel manages Nginx reverse proxy and SSL.
Never build images on the production server.

---

## Server Info

| Item | Value |
|------|-------|
| SSH Alias | `aliyun-root` |
| Public IP | 47.115.174.147 |
| OS | Alibaba Cloud Linux 3 (OpenAnolis) |
| CPU / RAM | 2 core / 1.8 GB |
| Disk | 40 GB |
| BaoTa Panel | https://47.115.174.147:8888/d9b729d1 |
| Domain | youthloop.top |
| Deploy Dir | `/opt/youthloop` |
| SSH Key | `~/.ssh/ssaa.pem` |

---

## Services

| Service | Image | Internal Port |
|---------|-------|---------------|
| web | `youthloop/web:latest` | 8000 |
| social-api | `youthloop/social-api:latest` | 8080 |
| game-api | `youthloop/game-api:latest` | 8082 |
| social-worker | `youthloop/social-worker:latest` | — |

Infrastructure (self-managed via Docker Compose): PostgreSQL 16, Redis 7, RabbitMQ 3.

---

## Phase 0: One-Time Server Setup (run once only)

### 0-1. Install Docker via BaoTa Panel

1. Open BaoTa panel: https://47.115.174.147:8888/d9b729d1
2. **Software Store** → search `Docker` → install **Docker Manager**
3. Verify via SSH:

```bash
ssh aliyun-root
docker --version
docker compose version
```

### 0-2. Create project directory on server

```bash
ssh aliyun-root "mkdir -p /opt/youthloop"
```

### 0-3. Configure Nginx reverse proxy in BaoTa

1. BaoTa panel → **Website** → **Add Site** → domain: `youthloop.top`
2. After site created → **Settings** → **Reverse Proxy** → Add:
   - Target URL: `http://127.0.0.1:8000`
   - Enable: ✓
3. **SSL** → Let's Encrypt → apply certificate → force HTTPS

---

## Phase 1: Environment Variables

Create `.env.production` locally (never commit this file — already in `.gitignore`).

See `.env.example` for the full list of required variables.

Key variables:

```bash
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<strong-password>
POSTGRES_DB=youthloop

# RabbitMQ
RABBITMQ_USER=youthloop
RABBITMQ_PASS=<strong-password>

# social-api
DATABASE_URL=...
FLYWAY_URL=...
REDIS_URL=...
RABBITMQ_URL=...
JWT_SECRET=...
GOOGLE_CLIENT_ID=...
RESEND_API_KEY=...

# game-api
GAME_DATABASE_URL=...

# Storage (Aliyun OSS)
STORAGE_ENDPOINT=...
STORAGE_ACCESS_KEY=...
STORAGE_SECRET_KEY=...
STORAGE_BUCKET_NAME=...
STORAGE_PUBLIC_BASE_URL=...
```

---

## Phase 2: Build Locally

Run from repo root.

**Backend:**

```bash
docker build -f apps/social-api/Dockerfile    -t youthloop/social-api:latest    .
docker build -f apps/game-api/Dockerfile      -t youthloop/game-api:latest      .
docker build -f apps/social-worker/Dockerfile -t youthloop/social-worker:latest .
```

**Web (build args baked in at build time):**

```bash
docker build -f apps/web/Dockerfile \
  --build-arg SOCIAL_API_ORIGIN=http://social-api:8080 \
  --build-arg GAME_API_ORIGIN=http://game-api:8082 \
  --build-arg STORAGE_PUBLIC_BASE_URL=https://youthloop.oss-cn-shenzhen.aliyuncs.com \
  --build-arg NODE_OPTIONS=--max-old-space-size=768 \
  -t youthloop/web:latest .
```

---

## Phase 3: Smoke Test (Local, Optional)

```bash
# Web — check it serves a page
docker run --rm -d -p 18001:8000 --name yl-web-check youthloop/web:latest
curl -I http://127.0.0.1:18001/en
docker stop yl-web-check
```

Backend containers require full env vars to start — skipping local smoke test for them is acceptable.

---

## Phase 4: Deploy via `deploy.sh`

Use the deploy script at repo root. It handles: build → save → transfer → load → restart.

**Deploy all services (full deploy):**

```bash
./deploy.sh
```

**Deploy a single service (common for incremental updates):**

```bash
./deploy.sh social-api
./deploy.sh web
./deploy.sh game-api
./deploy.sh social-worker
```

**Deploy multiple specific services:**

```bash
./deploy.sh social-api web
```

What the script does internally for each service:
1. `docker build` — build the image locally
2. `docker save` — export image to `/tmp/<service>.tar`
3. `scp` — transfer tar to server `/tmp/`
4. `docker load` — load image on server, delete tar
5. Sync `compose.yml` and `.env.production` to `/opt/youthloop/`
6. `docker compose up -d --no-deps` — restart only the deployed services

---

## Phase 5: Verify

```bash
# Check container status on server
ssh aliyun-root "docker ps --format 'table {{.Names}}\t{{.Status}}'"

# Tail logs for a service
ssh aliyun-root "docker logs youthloop-social-api --tail 50 -f"
ssh aliyun-root "docker logs youthloop-web --tail 30"

# From browser / curl
curl -I https://youthloop.top
curl https://youthloop.top/api/v1/system/config
```

Checklist:
- [ ] All containers show `Up` in `docker ps`
- [ ] Logs show DB / Redis / RabbitMQ connected, no missing env vars
- [ ] `https://youthloop.top` loads
- [ ] Login works
- [ ] HTTP → HTTPS redirect works

---

## Deployment Order Reference

| Scenario | Recommended Order |
|----------|-------------------|
| Frontend only | `./deploy.sh web` |
| Backend only (no schema change) | `./deploy.sh social-api game-api social-worker` |
| Schema change | Deploy `social-api` first → **check Flyway logs** → then the rest |
| Full redeploy | `./deploy.sh` (all services) |

If any Flyway migration fails, stop immediately. Do not deploy remaining services.

---

## Rollback

Re-build the previous working version locally and re-run deploy:

```bash
# Checkout or stash to previous state, rebuild, then:
./deploy.sh social-api   # or whichever service to roll back
```

Do not blindly roll back database schema. Schema changes require a forward-fix migration.

---

## Useful Commands on Server

```bash
# All container status
ssh aliyun-root "docker compose -f /opt/youthloop/compose.yml ps"

# Tail logs
ssh aliyun-root "docker logs youthloop-social-api -f --tail=50"

# Restart one service manually
ssh aliyun-root "cd /opt/youthloop && docker compose restart web"

# Connect to Postgres
ssh aliyun-root "docker exec -it youthloop-postgres psql -U postgres -d youthloop"

# Check server resource usage
ssh aliyun-root "free -h && uptime && df -h /"
```

---

## Rules

- Never build images on the production server
- Never commit `.env.production` (already in `.gitignore`)
- Never deploy untested images to production
- Stop on any Flyway database migration error — check logs before proceeding
- The SSH key is `~/.ssh/ssaa.pem` — keep it secure, never commit it
