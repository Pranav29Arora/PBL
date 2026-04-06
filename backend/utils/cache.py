"""Simple in-memory TTL cache for yfinance-derived frames."""

from __future__ import annotations

import time
from typing import Any, Optional, Tuple

_CACHE: dict[str, Tuple[float, Any]] = {}
_DEFAULT_TTL_SEC = 300  # 5 minutes


def get(key: str) -> Optional[Any]:
    entry = _CACHE.get(key)
    if not entry:
        return None
    expires_at, value = entry
    if time.time() > expires_at:
        del _CACHE[key]
        return None
    return value


def set(key: str, value: Any, ttl_sec: float = _DEFAULT_TTL_SEC) -> None:
    _CACHE[key] = (time.time() + ttl_sec, value)


def clear() -> None:
    _CACHE.clear()
