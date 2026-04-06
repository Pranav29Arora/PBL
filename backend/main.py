"""
StockVision AI — FastAPI ML service.
"""

from __future__ import annotations

import logging
import os
import sys

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Allow running as `python main.py` from backend/
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from ml.predictor import predict_close

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("stockvision")

app = FastAPI(title="StockVision AI API", version="1.0.0")

_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _origins.split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictRequest(BaseModel):
    symbol: str = Field(..., min_length=1, max_length=32)


class ChartPoint(BaseModel):
    date: str
    close: float
    open: float | None = None


class PredictResponse(BaseModel):
    prediction: float
    confidence: float
    open: float
    prev_close: float
    as_of: str
    history_days: int
    chart_series: list[ChartPoint]
    currency: str
    fx_rate_to_inr: float
    usd_converted: bool
    r2_holdout: float | None = None


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "StockVision AI"}


@app.post("/api/predict", response_model=PredictResponse)
def api_predict(body: PredictRequest):
    try:
        out = predict_close(body.symbol)
        return PredictResponse(
            prediction=out["prediction"],
            confidence=out["confidence"],
            open=out["open"],
            prev_close=out["prev_close"],
            as_of=out["as_of"],
            history_days=out["history_days"],
            chart_series=out["chart_series"],
            currency=out["currency"],
            fx_rate_to_inr=out["fx_rate_to_inr"],
            usd_converted=out["usd_converted"],
            r2_holdout=out.get("r2_holdout"),
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        logger.exception("Prediction failed")
        detail = "Upstream market data or model error. Try again shortly."
        if os.getenv("DEBUG_API", "").lower() in ("1", "true", "yes"):
            detail = f"{detail} ({type(e).__name__}: {e})"
        raise HTTPException(status_code=502, detail=detail) from e


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")), reload=True)
