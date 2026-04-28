# StockVision AI

**StockVision AI** is a full-stack web app that estimates a stock’s **same-day closing price** using live and historical Yahoo Finance data, technical indicators, fundamentals, and a regression model (XGBoost when available, otherwise scikit-learn Gradient Boosting).

**Tagline:** Predict smarter. Invest better.

---

## Features

- **Frontend:** React (Vite), Tailwind CSS v4, React Router, Axios  
- **Backend:** FastAPI REST API, `yfinance`, scikit-learn, XGBoost  
- **Mock auth:** Sign up / login / session stored in **localStorage** only (no database)  
- **Protected routes:** Dashboard, Predict, History  
- **Predictions history:** Saved in localStorage (symbol, live open/prev close, prediction in **₹**, confidence, timestamp)  
- **Pricing:** All API amounts in **INR** — NSE/BSE symbols (`.NS` / `.BO`) native ₹; US symbols converted via live **USDINR=X** (cached).  
- **UI:** Teal/emerald theme, charts (Recharts), toasts, dark mode, glass-style panels  
- **Performance:** In-memory TTL cache for downloaded prices and fundamentals  

---

## Project layout

```text
PBL/
├── backend/
│   ├── main.py           # FastAPI app, CORS, POST /api/predict
│   ├── requirements.txt
│   ├── ml/
│   │   └── predictor.py  # Features, train, predict, holdout R² → confidence
│   └── utils/
│       └── cache.py      # Simple TTL cache
├── frontend/
│   ├── src/
│   │   ├── components/   # Layout, sidebar, spinner, chart placeholder, toasts
│   │   ├── pages/        # Landing, Login, Signup, Dashboard, Predict, History
│   │   ├── services/     # api.js, storage.js
│   │   ├── context/      # Auth, Theme, Toast
│   │   ├── routes/       # ProtectedRoute
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── vite.config.js    # Tailwind plugin + /api proxy → :8000
└── README.md
```

---

## Run locally (step by step)

### Prerequisites

- **Node.js** 18+ and npm  
- **Python** 3.10+ (3.13 tested)  

### 1. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

The API serves at **http://127.0.0.1:8000** with:

- `GET /api/health`  
- `POST /api/predict` — body: `{ "symbol": "AAPL" }` (open and previous close are read from Yahoo daily bars)  

Optional: `CORS_ORIGINS` (comma-separated) if the frontend runs on another origin.  
If Yahoo/`yfinance` is flaky, the API falls back to Yahoo’s **chart v8** JSON endpoint. Set `DEBUG_API=1` to include exception details in 502 responses while debugging.

### 2. Frontend

In a **second** terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (usually **http://localhost:5173**).

The dev server **proxies** `/api/*` to the backend, so keep the API on port **8000** or change `vite.config.js`.

Optional: copy `frontend/.env.example` to `frontend/.env` and set `VITE_API_URL` to a full API base URL if you are not using the proxy.

### 3. Use the app

1. Open the site → **Get Started** (signup) or **Login**.  
2. Credentials are stored only in this browser’s **localStorage**.  
3. Go to **Predict**, enter a symbol → submit (open and previous close load from Yahoo).  
4. View results and **History**; the dashboard shows counts and average confidence from your saved runs.  

---

## API contract

**POST** `/api/predict`

| Field    | Type   | Description        |
|----------|--------|--------------------|
| `symbol` | string | Ticker (e.g. `RELIANCE.NS`, `AAPL`) — up to 32 chars |

**Response** (monetary fields are **Indian Rupees**)

| Field             | Type    | Description                                      |
|-------------------|---------|--------------------------------------------------|
| `prediction`      | number  | Predicted same-day close (₹)                     |
| `open`            | number  | Same-day open (₹)                                |
| `prev_close`      | number  | Prior close (₹)                                  |
| `currency`        | string  | Always `INR`                                     |
| `fx_rate_to_inr`  | number  | `1.0` if Indian listing; else USD→INR rate used  |
| `usd_converted`   | boolean | `true` if symbol was USD-listed and converted    |
| `as_of`           | string  | Date of the latest daily bar (`YYYY-MM-DD`)      |
| `history_days`    | number  | Count of daily bars in `chart_series` (~2y)      |
| `chart_series`    | array   | `{ date, close, open? }[]` (₹) for the chart     |
| `confidence`      | number  | `max(0, min(1, R²))` on a time-ordered holdout   |
| `r2_holdout`      | number  | Raw R² on the same holdout split                 |

---

## Disclaimer

Outputs are **experimental** and depend on data quality, corporate actions, and market regime. This is **not** financial advice.

---

*Predict smarter. Invest better.*
