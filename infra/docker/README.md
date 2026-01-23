# Docker Infrastructure

## Quick Start

Start all services:
```powershell
cd infra/docker
docker compose up -d
```

Stop all services:
```powershell
docker compose down
```

Stop and remove all data:
```powershell
docker compose down -v
```

## Services

### PostgreSQL
- **Port:** 5432
- **User:** postgres
- **Password:** postgres
- **Database:** youthloop
- **Connection:** `postgresql://postgres:postgres@localhost:5432/youthloop`

### Redis
- **Port:** 6379
- **Connection:** `redis://localhost:6379`

### RabbitMQ
- **AMQP Port:** 5672
- **Management UI:** http://localhost:15672
- **User:** youthloop
- **Password:** youthloop

### MinIO (S3-compatible storage)
- **API Port:** 9000
- **Console:** http://localhost:9001
- **User:** minioadmin
- **Password:** minioadmin

## Health Check

Check all services:
```powershell
docker compose ps
```

View logs:
```powershell
docker compose logs -f
```

View specific service logs:
```powershell
docker compose logs -f postgres
docker compose logs -f redis
```

## Database Initialization

The PostgreSQL container will automatically run scripts from `../db/init/` on first startup.

To manually initialize after container is running:
```powershell
# Copy init script to container
docker cp ../db/init/db_init_roles_schemas.sql youthloop-postgres:/tmp/

# Execute inside container
docker exec -it youthloop-postgres psql -U postgres -d youthloop -f /tmp/db_init_roles_schemas.sql
```

## Useful Commands

### PostgreSQL
```powershell
# Connect to database
docker exec -it youthloop-postgres psql -U postgres -d youthloop

# Backup database
docker exec youthloop-postgres pg_dump -U postgres youthloop > backup.sql

# Restore database
docker exec -i youthloop-postgres psql -U postgres youthloop < backup.sql
```

### Redis
```powershell
# Connect to Redis CLI
docker exec -it youthloop-redis redis-cli

# Monitor commands
docker exec -it youthloop-redis redis-cli MONITOR
```

### RabbitMQ
```powershell
# List queues
docker exec youthloop-rabbitmq rabbitmqctl list_queues

# List exchanges
docker exec youthloop-rabbitmq rabbitmqctl list_exchanges
```

## Environment Variables

Update your `.env.local`:
```env
DATABASE_URL=postgresql://social_app:postgres@localhost:5432/youthloop
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://youthloop:youthloop@localhost:5672
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

## Troubleshooting

### Port already in use
If ports are already occupied, modify the ports in `compose.yml`:
```yaml
ports:
  - "5433:5432"  # Use 5433 instead of 5432
```

### Reset everything
```powershell
docker compose down -v
docker compose up -d
```

### View container details
```powershell
docker inspect youthloop-postgres
```
