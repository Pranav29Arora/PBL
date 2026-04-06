"""
Train on ~2 years of daily Yahoo Finance history (OHLCV + derived features + fundamentals),
then use the latest bar's same-day **open** (and prior close / indicators context) to predict
that session's **closing** price.
"""

from __future__ import annotations

import logging
import math
import time
from typing import Any, Dict, Tuple

import numpy as np
import pandas as pd
import yfinance as yf
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, r2_score

try:
    from xgboost import XGBRegressor

    _HAS_XGB = True
except ImportError:
    _HAS_XGB = False

from utils.cache import get as cache_get, set as cache_set
from utils.yahoo_chart import fetch_chart_v8

logger = logging.getLogger(__name__)

# Fallback when USDINR=X cannot be fetched (approximate).
_USD_INR_FALLBACK = 83.0


def _finite(x: float, fallback: float = 0.0) -> float:
    if x is None:
        return fallback
    xf = float(x)
    if math.isnan(xf) or math.isinf(xf):
        return fallback
    return xf

# Predict **Close/Open** (intraday ratio). Features are scale-free vs open so the model
# stays anchored to the session open instead of extrapolating absolute price levels.
RATIO_FEATURES = [
    "PrevClose_over_Open",
    "MA5_over_Open",
    "MA20_over_Open",
    "MA50_over_Open",
    "VolPrev_rel",
    "Volatility20",
    "PE",
    "LogMktCap",
]


def _flatten_columns(df: pd.DataFrame) -> pd.DataFrame:
    if isinstance(df.columns, pd.MultiIndex):
        df = df.copy()
        df.columns = [c[0] if isinstance(c, tuple) else c for c in df.columns]
    return df


def _history_via_download(symbol: str) -> pd.DataFrame:
    """Fallback when Ticker.history() fails (Yahoo sometimes returns empty JSON)."""
    raw = yf.download(
        symbol,
        period="2y",
        interval="1d",
        auto_adjust=False,
        progress=False,
        threads=False,
    )
    if raw is None or raw.empty:
        return pd.DataFrame()
    df = _flatten_columns(raw)
    return df


def _fetch_history(symbol: str) -> pd.DataFrame:
    cache_key = f"hist:{symbol.upper()}"
    cached = cache_get(cache_key)
    if cached is not None:
        return cached

    sym = symbol.strip()
    last_err: Exception | None = None
    df: pd.DataFrame | None = None

    for attempt in range(3):
        try:
            ticker = yf.Ticker(sym)
            df = ticker.history(period="2y", interval="1d", auto_adjust=False)
            if df is not None and not df.empty:
                break
        except Exception as e:
            last_err = e
            logger.warning("yfinance history attempt %s failed for %s: %s", attempt + 1, sym, e)
        time.sleep(0.5 * (attempt + 1))

    if df is None or df.empty:
        try:
            df = _history_via_download(sym)
        except Exception as e:
            last_err = e
            logger.warning("yfinance download fallback failed for %s: %s", sym, e)

    if df is None or df.empty:
        try:
            df = fetch_chart_v8(sym, range_param="2y", interval="1d")
            logger.info("used Yahoo chart v8 fallback for %s (%s rows)", sym, len(df))
        except Exception as e:
            last_err = e
            logger.warning("Yahoo chart v8 fallback failed for %s: %s", sym, e)

    if df is None or df.empty:
        msg = f"No price history returned for '{sym}'."
        if last_err:
            msg += f" Last error: {last_err!s}"
        raise ValueError(msg)

    df = _flatten_columns(df)
    for col in ("Open", "High", "Low", "Close", "Volume"):
        if col not in df.columns:
            raise ValueError(f"Missing column '{col}' in market data for '{symbol}'.")

    cache_set(cache_key, df)
    return df


def _fundamentals(symbol: str) -> Tuple[float, float]:
    """Return (PE, market_cap). Uses 0 when missing."""
    cache_key = f"info:{symbol.upper()}"
    cached = cache_get(cache_key)
    if cached is not None:
        return cached

    t = yf.Ticker(symbol)
    info: Dict[str, Any] = {}
    try:
        info = t.info or {}
    except Exception as e:
        logger.warning("ticker.info failed for %s: %s", symbol, e)

    pe = info.get("trailingPE") or info.get("forwardPE")
    if pe is None or (isinstance(pe, float) and (math.isnan(pe) or math.isinf(pe))):
        pe = 0.0
    else:
        pe = float(pe)

    mcap = info.get("marketCap")
    if mcap is None or (isinstance(mcap, float) and (math.isnan(mcap) or math.isinf(mcap))):
        mcap = 0.0
    else:
        mcap = float(mcap)

    out = (pe, mcap)
    cache_set(cache_key, out, ttl_sec=3600)
    return out


def _build_frame(df: pd.DataFrame, pe: float, mcap: float) -> pd.DataFrame:
    d = df.copy()
    close = d["Close"].astype(float)
    open_ = d["Open"].astype(float)
    d["PrevClose"] = close.shift(1)
    d["MA5"] = close.rolling(5).mean().shift(1)
    d["MA20"] = close.rolling(20).mean().shift(1)
    d["MA50"] = close.rolling(50).mean().shift(1)
    vol_prev = d["Volume"].astype(float).shift(1)
    d["VolPrev"] = vol_prev
    vol_med = vol_prev.rolling(60, min_periods=10).median()
    d["VolPrev_rel"] = (vol_prev / vol_med.replace(0, np.nan)).replace([np.inf, -np.inf], np.nan)
    ret = close.pct_change()
    d["Volatility20"] = ret.rolling(20).std().shift(1)
    d["PE"] = pe
    log_mcap = math.log1p(mcap) if mcap > 0 else 0.0
    d["LogMktCap"] = log_mcap

    safe_o = open_.replace(0, np.nan)
    d["PrevClose_over_Open"] = d["PrevClose"] / safe_o
    d["MA5_over_Open"] = d["MA5"] / safe_o
    d["MA20_over_Open"] = d["MA20"] / safe_o
    d["MA50_over_Open"] = d["MA50"] / safe_o

    # Same-day close/open — what we train to predict
    d["TargetRatio"] = close / safe_o
    return d


def _live_open_prev_close(df: pd.DataFrame) -> Tuple[float, float, str]:
    """
    Latest bar: session open. Prior bar: previous close.
    Returns (open, prev_close, as_of_date_iso).
    """
    if len(df) < 2:
        raise ValueError(
            "Need at least two daily bars to derive live open and previous close."
        )
    last = df.iloc[-1]
    prior = df.iloc[-2]
    o = float(last["Open"])
    pc = float(prior["Close"])
    if math.isnan(o) or math.isnan(pc) or not (o > 0 and pc > 0):
        raise ValueError("Could not read valid open / previous close from market data.")
    idx = last.name
    if hasattr(idx, "strftime"):
        as_of = idx.strftime("%Y-%m-%d")
    else:
        as_of = str(idx)[:10]
    return o, pc, as_of


def _is_indian_listed(symbol: str) -> bool:
    """Yahoo NSE / BSE tickers are already in INR."""
    u = symbol.upper().strip()
    return u.endswith(".NS") or u.endswith(".BO")


def _usd_inr_rate() -> float:
    """Spot USD→INR from Yahoo (cached)."""
    key = "fx:USDINR"
    cached = cache_get(key)
    if cached is not None:
        return float(cached)
    try:
        t = yf.Ticker("USDINR=X")
        df = t.history(period="10d", interval="1d", auto_adjust=False)
        df = _flatten_columns(df) if df is not None and not df.empty else pd.DataFrame()
        if df.empty or "Close" not in df.columns:
            try:
                df = _history_via_download("USDINR=X")
            except Exception:
                df = pd.DataFrame()
        if df.empty or "Close" not in df.columns:
            df = fetch_chart_v8("USDINR=X", range_param="1mo", interval="1d")
        if df.empty or "Close" not in df.columns:
            raise ValueError("empty USDINR history")
        r = float(df["Close"].iloc[-1])
        if math.isnan(r) or r <= 0:
            raise ValueError("invalid USDINR")
    except Exception as e:
        logger.warning("USDINR fetch failed, using fallback %.2f: %s", _USD_INR_FALLBACK, e)
        r = _USD_INR_FALLBACK
    cache_set(key, r, ttl_sec=1800)
    return r


def _to_inr_outputs(
    symbol: str,
    prediction: float,
    open_p: float,
    prev_close: float,
    chart_native: list[Dict[str, Any]],
) -> Tuple[float, float, float, list[Dict[str, Any]], float, bool]:
    """
    All displayed prices in INR. Indian listings are left as-is; others × USDINR.
    Returns (prediction, open, prev_close, chart_series, fx_rate, converted_from_usd).
    """
    if _is_indian_listed(symbol):
        chart = [
            {
                "date": p["date"],
                "close": round(float(p["close"]), 4),
                "open": round(float(p["open"]), 4) if p.get("open") is not None else None,
            }
            for p in chart_native
        ]
        return (
            round(prediction, 4),
            round(open_p, 4),
            round(prev_close, 4),
            chart,
            1.0,
            False,
        )

    rate = _usd_inr_rate()
    chart = []
    for p in chart_native:
        o = p.get("open")
        chart.append(
            {
                "date": p["date"],
                "close": round(float(p["close"]) * rate, 4),
                "open": round(float(o) * rate, 4) if o is not None else None,
            }
        )
    return (
        round(prediction * rate, 4),
        round(open_p * rate, 4),
        round(prev_close * rate, 4),
        chart,
        round(rate, 6),
        True,
    )


def _chart_series(df: pd.DataFrame) -> list[Dict[str, Any]]:
    """Daily close prices over the downloaded window (~2y) for charting."""
    out: list[Dict[str, Any]] = []
    for idx, row in df.iterrows():
        if hasattr(idx, "strftime"):
            d = idx.strftime("%Y-%m-%d")
        else:
            d = str(idx)[:10]
        c = float(row["Close"])
        if math.isnan(c):
            continue
        o = float(row["Open"])
        out.append(
            {
                "date": d,
                "close": round(c, 4),
                "open": round(o, 4) if not math.isnan(o) else None,
            }
        )
    return out


def _make_model():
    if _HAS_XGB:
        return XGBRegressor(
            n_estimators=400,
            max_depth=4,
            learning_rate=0.04,
            subsample=0.88,
            colsample_bytree=0.88,
            min_child_weight=4,
            reg_alpha=0.12,
            reg_lambda=1.2,
            gamma=0.08,
            random_state=42,
            n_jobs=-1,
        )
    return GradientBoostingRegressor(
        n_estimators=400,
        max_depth=3,
        learning_rate=0.04,
        subsample=0.85,
        min_samples_leaf=12,
        random_state=42,
    )


def _ratio_band_from_history(trainable: pd.DataFrame, last_vol: float) -> Tuple[float, float]:
    """Allowable Close/Open band: historical quantiles + volatility cap (keeps close near open)."""
    tr = trainable["TargetRatio"].dropna()
    if len(tr) < 20:
        return (0.94, 1.06)
    q_lo = float(tr.quantile(0.01))
    q_hi = float(tr.quantile(0.99))
    vol = _finite(last_vol, 0.018)
    # Typical daily move ~ 1–3× daily vol of returns; ratio band around 1
    cap = min(0.08, max(0.012, 2.8 * vol))
    return (max(q_lo, 1.0 - cap), min(q_hi, 1.0 + cap))


def _confidence_score(y_true: np.ndarray, y_pred: np.ndarray) -> Tuple[float, float]:
    """
    Combined score: R² on ratio + MAE skill vs. 'always close=open' (ratio=1).
    Returns (confidence_0_1, raw_r2).
    """
    try:
        r2 = float(r2_score(y_true, y_pred))
    except Exception:
        r2 = 0.0
    r2 = _finite(r2, 0.0)
    mae = float(mean_absolute_error(y_true, y_pred))
    # MAE on ratio: ~0.003 = 0.3% off; 0.02 = 2% off
    mae_score = max(0.0, 1.0 - min(1.0, mae * 55.0))
    baseline = float(mean_absolute_error(y_true, np.ones_like(y_true)))
    skill = 1.0 - mae / max(baseline, 1e-9)
    skill = float(max(0.0, min(1.0, skill)))
    r2_pos = max(0.0, r2)
    # R² is noisy on ratio targets; lean on skill + MAE
    combined = 0.28 * r2_pos + 0.45 * mae_score + 0.27 * skill
    combined = float(max(0.0, min(1.0, combined)))
    # Soft calibration so reported confidence reflects useful skill vs. naive “close = open”
    calibrated = 0.14 + 0.86 * combined
    return float(max(0.0, min(1.0, calibrated))), r2


def predict_close(symbol: str) -> Dict[str, Any]:
    sym = symbol.strip().upper()
    if not sym:
        raise ValueError("Symbol is required.")

    hist = _fetch_history(sym)
    open_price, prev_close, as_of = _live_open_prev_close(hist)
    pe, mcap = _fundamentals(sym)
    full = _build_frame(hist, pe, mcap)
    trainable = full.dropna(subset=RATIO_FEATURES + ["TargetRatio"])
    trainable["VolPrev_rel"] = trainable["VolPrev_rel"].fillna(1.0)
    tr = trainable["TargetRatio"].astype(float)
    trainable = trainable[tr.gt(0.4) & tr.lt(2.5) & np.isfinite(tr.to_numpy())]
    if len(trainable) < 80:
        raise ValueError(
            "Not enough historical rows to train a reliable model for this symbol."
        )

    X = trainable[RATIO_FEATURES].values
    y = trainable["TargetRatio"].values

    # Time-ordered holdout: last 15% for metrics (confidence)
    split = int(len(X) * 0.85)
    if split < 50 or len(X) - split < 10:
        split = max(len(X) - 30, int(len(X) * 0.8))

    X_train, X_test = X[:split], X[split:]
    y_train, y_test = y[:split], y[split:]

    model = _make_model()
    model.fit(X_train, y_train)
    y_hat = model.predict(X_test)
    confidence, r2 = _confidence_score(y_test, y_hat)

    last_ctx = trainable.iloc[-1]
    last_vol = float(last_ctx["Volatility20"]) if not math.isnan(last_ctx["Volatility20"]) else 0.018

    oo = float(open_price)
    pc = float(prev_close)
    x_row = np.array(
        [
            [
                pc / oo,
                float(last_ctx["MA5"]) / oo,
                float(last_ctx["MA20"]) / oo,
                float(last_ctx["MA50"]) / oo,
                float(last_ctx["VolPrev_rel"]) if not math.isnan(last_ctx["VolPrev_rel"]) else 1.0,
                last_vol,
                float(last_ctx["PE"]),
                float(last_ctx["LogMktCap"]),
            ]
        ],
        dtype=np.float64,
    )

    ratio_raw = _finite(float(model.predict(x_row)[0]), 1.0)
    r_lo, r_hi = _ratio_band_from_history(trainable, last_vol)
    ratio = float(max(r_lo, min(r_hi, ratio_raw)))

    # Mild shrink toward 1.0 when holdout metrics are weak (stay near same-day open)
    shrink = max(0.0, 0.18 * (1.0 - confidence))
    ratio = ratio * (1.0 - shrink) + 1.0 * shrink

    pred = _finite(oo * ratio, pc)
    if pred < 0:
        pred = max(pred, 0.0)

    chart_native = _chart_series(hist)
    pred_inr, open_inr, pc_inr, chart_inr, fx_rate, from_usd = _to_inr_outputs(
        sym, pred, open_price, prev_close, chart_native
    )

    return {
        "prediction": pred_inr,
        "confidence": round(confidence, 4),
        "r2_holdout": round(r2, 4),
        "open": open_inr,
        "prev_close": pc_inr,
        "as_of": as_of,
        "chart_series": chart_inr,
        "history_days": len(chart_inr),
        "currency": "INR",
        "fx_rate_to_inr": fx_rate,
        "usd_converted": from_usd,
    }
