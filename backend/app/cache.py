import redis
import json
import hashlib
from typing import Optional, Any
import os

class RedisCache:
    def __init__(self):
        redis_host = os.getenv("REDIS_HOST", "localhost")
        redis_port = int(os.getenv("REDIS_PORT", "6379"))
        redis_db = int(os.getenv("REDIS_DB", "0"))
        
        try:
            self.client = redis.Redis(
                host=redis_host,
                port=redis_port,
                db=redis_db,
                decode_responses=True,
                socket_connect_timeout=5
            )
            # Test connection
            self.client.ping()
            self.enabled = True
            print(f"✓ Redis connected at {redis_host}:{redis_port}")
        except (redis.ConnectionError, redis.TimeoutError) as e:
            print(f"⚠ Redis connection failed: {e}. Caching disabled.")
            self.enabled = False
            self.client = None
    
    def _generate_key(self, prefix: str, params: dict) -> str:
        """Generate a unique cache key from parameters"""
        # Sort params for consistent hashing
        sorted_params = json.dumps(params, sort_keys=True)
        hash_value = hashlib.md5(sorted_params.encode()).hexdigest()
        return f"{prefix}:{hash_value}"
    
    def get(self, prefix: str, params: dict) -> Optional[Any]:
        """Get cached value"""
        if not self.enabled:
            return None
        
        try:
            key = self._generate_key(prefix, params)
            value = self.client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            print(f"Cache get error: {e}")
            return None
    
    def set(self, prefix: str, params: dict, value: Any, ttl: int = 3600):
        """Set cached value with TTL (default 1 hour)"""
        if not self.enabled:
            return
        
        try:
            key = self._generate_key(prefix, params)
            self.client.setex(
                key,
                ttl,
                json.dumps(value)
            )
        except Exception as e:
            print(f"Cache set error: {e}")
    


# Global cache instance
cache = RedisCache()
