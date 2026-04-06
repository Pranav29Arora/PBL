"""
Direct Yahoo Finance chart API (v8) fallback when yfinance's parser receives empty responses.
"""

from __future__ import annotations

import logging
from typing import Any
from urllib.parse import quote

import pandas as pd
import requests

logger = logging.getLogger(__name__)

_USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
)


def fetch_chart_v8(symbol: str, range_param: str = "2y", interval: str = "1d", timeout: float = 45.0) -> pd.DataFrame:
    """
    GET https://query1.finance.yahoo.com/v8/finance/chart/{symbol}
    Returns daily OHLCV indexed by naive datetime.
    """
    sym = quote(symbol.strip(), safe="")
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{sym}"
    params: dict[str, Any] = {"interval": interval, "range": range_param}
    headers = {"User-Agent": _USER_AGENT, "Accept": "application/json,text/plain,*/*"}

    r = requests.get(url, params=params, headers=headers, timeout=timeout)
    r.raise_for_status()
    j = r.json()

    chart = j.get("chart") or {}
    err = chart.get("error")
    if err:
        raise ValueError(err.get("description") or str(err))

    results = chart.get("result")
    if not results:
        raise ValueError("Yahoo chart API returned no result (delisted or invalid symbol?)")

    result = results[0]
    ts = result.get("timestamp") or []
    quotes = result.get("indicators", {}).get("quote") or [{}]
    q = quotes[0] if quotes else {}

    if not ts:
        raise ValueError("Yahoo chart API returned no timestamps")

    opens = q.get("open") or [None] * len(ts)
    highs = q.get("high") or [None] * len(ts)
    lows = q.get("low") or [None] * len(ts)
    closes = q.get("close") or [None] * len(ts)
    vols = q.get("volume") or [None] * len(ts)

    idx = pd.to_datetime(ts, unit="s", utc=True).tz_convert(None)

    df = pd.DataFrame(
        {
            "Open": opens,
            "High": highs,
            "Low": lows,
            "Close": closes,
            "Volume": vols,
        },
        index=idx,
    )
    df = df.dropna(subset=["Close"], how="all")
    return df
