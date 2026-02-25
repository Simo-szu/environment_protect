# YouthLoop Deployment Workflow (Coolify + GHCR)

Build locally → push to GHCR → update tag in Coolify → redeploy.
Never build on the production server.

---

## Services

| Service | Image |
|---------|-------|
| web | `ghcr.io/simo-szu/environment_protect-web` |
| social-api | `ghcr.io/simo-szu/environment_protect-social-api` |
| game-api | `ghcr.io/simo-szu/environment_protect-game-api` |
| social-worker | `ghcr.io/simo-szu/environment_protect-social-worker` |

Infrastructure (Coolify managed): PostgreSQL, Redis, RabbitMQ.

---

## 1. Build (repo root as context)

Backend:

```bash
docker build -f apps/social-api/Dockerfile -t youthloop-social-api:test-vN .
docker build -f apps/game-api/Dockerfile -t youthloop-game-api:test-vN .
docker build -f apps/social-worker/Dockerfile -t youthloop-social-worker:test-vN .
```

Web (requires build args):

```bash
docker build -f apps/web/Dockerfile \
  --build-arg SOCIAL_API_ORIGIN=http://social-api:8080 \
  --build-arg GAME_API_ORIGIN=http://game-api:8082 \
  --build-arg STORAGE_PUBLIC_BASE_URL=https://youthloop.oss-cn-shenzhen.aliyuncs.com \
  --build-arg NODE_OPTIONS=--max-old-space-size=768 \
  -t youthloop-web:test-vN .
```

---

## 2. Smoke Test

Backend (may fail on missing env vars — acceptable):

```bash
docker run --rm youthloop-social-api:test-vN
docker run --rm youthloop-game-api:test-vN
docker run --rm youthloop-social-worker:test-vN
```

Web:

```bash
docker run --rm -d -p 18001:8000 --name yl-web-check youthloop-web:test-vN
curl -I http://127.0.0.1:18001/en
```

---

## 3. Push to GHCR

```bash
docker tag youthloop-social-api:test-vN ghcr.io/simo-szu/environment_protect-social-api:vN
docker tag youthloop-game-api:test-vN ghcr.io/simo-szu/environment_protect-game-api:vN
docker tag youthloop-social-worker:test-vN ghcr.io/simo-szu/environment_protect-social-worker:vN
docker tag youthloop-web:test-vN ghcr.io/simo-szu/environment_protect-web:vN

docker push ghcr.io/simo-szu/environment_protect-social-api:vN
docker push ghcr.io/simo-szu/environment_protect-game-api:vN
docker push ghcr.io/simo-szu/environment_protect-social-worker:vN
docker push ghcr.io/simo-szu/environment_protect-web:vN
```

GHCR packages must be `Public` (or configure registry auth in Coolify).

---

## 4. Deploy in Coolify

For each changed service: change `Docker Image Tag or Hash` → Save → Redeploy.

**Deployment order:**

| Scenario | Order |
|----------|-------|
| Frontend only | `web` |
| Backend (no schema change) | `social-api` → `game-api` → `social-worker` → `web` |
| Schema change | `social-api` → check logs → `game-api` → check logs → `social-worker` → `web` |

If any Flyway migration fails, stop immediately.

---

## 5. Verify

- Logs: DB / Redis / RabbitMQ connected, no missing env vars
- `https://youthloop.top` loads, login works, `/api/v1/system/config` responds
- HTTP → HTTPS redirect works

---

## Rollback

In Coolify, change the tag back to the last known-good version → Save → Redeploy.
Do not blindly rollback database schema.

---

## Rules

- Never overwrite old release tags (use `v1`, `v2`, `v3` ... or `YYYYMMDD-<gitsha>`)
- Never deploy untested images
- Never commit production secrets
- Stop on any database drift
