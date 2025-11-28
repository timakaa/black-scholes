# Cache Documentation

## Overview

The Black-Scholes platform implements a multi-layer caching strategy for optimal performance:

1. **Frontend Cache (React Query)**: Client-side caching with 1-minute stale time, 5-minute cache time
2. **Backend Cache (Redis)**: Server-side caching with 1-hour TTL

This dual-layer approach minimizes network requests and computational load while ensuring data freshness.

## Frontend Caching (React Query)

### Features

- **Automatic Request Deduplication**: Multiple components requesting same data share a single request
- **Background Refetching**: Stale data is refetched in the background
- **Cache Persistence**: Data cached for 5 minutes even after component unmount
- **Optimistic Updates**: UI updates immediately while requests are in flight

### Configuration

**Option Calculations:**

- **Stale Time**: 1 minute (data considered fresh for 60 seconds)
- **Cache Time (gcTime)**: 5 minutes (data kept in memory for 5 minutes)
- **Debounce**: 500ms
- **Refetch on Window Focus**: Disabled
- **Retry**: 1 attempt on failure

**Heatmaps:**

- **Stale Time**: 2 minutes (heatmaps change less frequently)
- **Cache Time (gcTime)**: 10 minutes (kept longer due to generation cost)
- **Debounce**: 800ms (longer due to heavier computation)
- **Refetch on Window Focus**: Disabled
- **Retry**: 1 attempt on failure

### How It Works

1. User changes input parameters
2. Input is debounced (500ms for calculations, 800ms for heatmaps)
3. React Query checks cache for matching parameters
4. If cached and fresh, returns immediately
5. If stale or missing, fetches from backend
6. Result is cached for future requests

## Backend Caching (Redis)

### Features

- **Automatic Caching**: All `/calculate` and `/implied-volatility` endpoints automatically cache results
- **TTL Management**: Cached values expire after **1 hour (3600 seconds)**
- **Graceful Degradation**: If Redis is unavailable, the API continues to work without caching
- **Hash-based Keys**: Cache keys are generated using MD5 hashing of input parameters

## Configuration

### Environment Variables

Set these in your backend environment:

```bash
REDIS_HOST=localhost    # Redis server hostname (default: localhost)
REDIS_PORT=6379        # Redis server port (default: 6379)
REDIS_DB=0             # Redis database number (default: 0)
```

### Docker Compose

When using docker-compose, Redis is automatically configured and connected.

### Manual Setup

For local development, start Redis with Docker:

```bash
# Start Redis container
docker run -d \
  --name black-scholes-redis \
  -p 6379:6379 \
  redis:7-alpine

# Verify it's running
docker exec -it black-scholes-redis redis-cli ping
# Should return: PONG
```

## How It Works

1. **Request Received**: API receives calculation request
2. **Cache Lookup**: System checks if result exists in Redis using hashed parameters
3. **Cache Hit**: If found and not expired, return cached result immediately
4. **Cache Miss**: If not found, perform C++ calculation
5. **Store Result**: Cache the new result with 1-hour TTL
6. **Auto Expiration**: Redis automatically removes entries after 1 hour

## Cache Key Format

```
{prefix}:{md5_hash_of_params}
```

Examples:

- `calculate:a1b2c3d4e5f6...` - Option calculation cache
- `implied_vol:f6e5d4c3b2a1...` - Implied volatility cache

## Performance Benefits

- **Reduced CPU Usage**: Avoid redundant C++ calculations for identical inputs
- **Faster Response Times**: Cached responses return in <1ms vs ~10-50ms for calculations
- **Scalability**: Handle more concurrent requests with the same resources
- **Cost Efficiency**: Lower computational overhead in production

## Cache Behavior

### What Gets Cached

**Frontend (React Query):**

- Option price calculations
- Implied volatility calculations
- Heatmap visualizations (2-minute stale time, 10-minute cache)

**Backend (Redis):**

- Option price calculations (`/calculate` endpoint)
- Implied volatility calculations (`/implied-volatility` endpoint)

### What Doesn't Get Cached

- Health checks
- Root endpoint
- Heatmaps on backend (too large for Redis, cached on frontend only)

### TTL (Time To Live)

All cached entries expire after **1 hour (3600 seconds)**. This ensures:

- Fresh calculations for changing market conditions
- Reasonable memory usage
- Balance between performance and accuracy

## Redis CLI Access

For debugging and monitoring:

```bash
# Enter Redis CLI
docker exec -it black-scholes-redis redis-cli

# View all keys
KEYS *

# Get a specific value
GET calculate:a1b2c3d4...

# Check TTL (time remaining in seconds)
TTL calculate:a1b2c3d4...

# Count total keys
DBSIZE

# Flush all data (use with caution)
FLUSHDB
```

## Troubleshooting

### Cache Not Working

1. **Check Redis is running:**

   ```bash
   docker ps | grep redis
   ```

2. **Test Redis connection:**

   ```bash
   docker exec -it black-scholes-redis redis-cli ping
   ```

3. **Check backend logs** for Redis connection messages:

   - Success: `✓ Redis connected at localhost:6379`
   - Failure: `⚠ Redis connection failed: ... Caching disabled.`

4. **Verify environment variables** are set correctly in your backend

### Redis Connection Failed

If Redis is unavailable, the backend will:

- Print a warning message
- Disable caching automatically
- Continue serving requests without cache
- No errors or crashes

### Clear Cache Manually

If you need to clear all cached data:

```bash
docker exec -it black-scholes-redis redis-cli FLUSHDB
```

Or restart the Redis container:

```bash
docker restart black-scholes-redis
```

## Production Considerations

### Memory Management

Redis stores data in memory. Monitor usage with:

```bash
docker exec -it black-scholes-redis redis-cli INFO memory
```

### Persistence

For production, enable Redis persistence in docker-compose:

```yaml
redis:
  image: redis:7-alpine
  command: redis-server --appendonly yes
  volumes:
    - redis_data:/data
```

This is already configured in the provided `docker-compose.yml`.

### Security

For production deployments:

- Use Redis password authentication
- Restrict network access
- Use TLS for connections
- Regular backups of Redis data

## Monitoring

### Check Cache Usage

View Redis statistics:

```bash
docker exec -it black-scholes-redis redis-cli INFO stats
```

Key metrics:

- `keyspace_hits`: Number of successful cache lookups
- `keyspace_misses`: Number of cache misses
- `total_commands_processed`: Total operations

### Calculate Hit Rate

```bash
# Get stats
docker exec -it black-scholes-redis redis-cli INFO stats | grep keyspace

# Hit rate = hits / (hits + misses) * 100
```

A good hit rate for this application is typically 60-80% in production.
