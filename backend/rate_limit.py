"""Simple in-memory rate limiting -- this app runs as a single replica, so an
in-process sliding window is sufficient (no Redis-backed distributed limiter
needed). Protects the real, usage-billed Gemini API calls behind /chat and
/ingest from being run up by a bot or a curious stranger once public.
"""

import time
from collections import defaultdict

from fastapi import Request, WebSocket


class SlidingWindowLimiter:
    def __init__(self, max_requests: int, window_seconds: int):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._hits: dict[str, list[float]] = defaultdict(list)

    def allow(self, key: str) -> bool:
        now = time.monotonic()
        cutoff = now - self.window_seconds
        recent = [t for t in self._hits[key] if t > cutoff]
        if len(recent) >= self.max_requests:
            self._hits[key] = recent
            return False
        recent.append(now)
        self._hits[key] = recent
        return True


def client_ip_from_request(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def client_ip_from_websocket(ws: WebSocket) -> str:
    forwarded = ws.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return ws.client.host if ws.client else "unknown"


# 10 ingests/minute, 20 chat messages/5min -- generous for real use, tight
# enough to stop a script from running up the real Gemini bill.
ingest_limiter = SlidingWindowLimiter(max_requests=10, window_seconds=60)
chat_limiter = SlidingWindowLimiter(max_requests=20, window_seconds=300)
