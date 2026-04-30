# StockVision AI

**StockVision AI** is a sophisticated full-stack web application that leverages machine learning to predict same-day stock closing prices. The system combines real-time Yahoo Finance data, technical indicators, fundamental analysis, and advanced regression models (XGBoost with scikit-learn Gradient Boosting fallback) to deliver accurate stock price predictions.

**Tagline:** Predict smarter. Invest better.

---

## 🚀 Key Features

### Frontend
- **React 18** with Vite for lightning-fast development
- **Tailwind CSS v4** with custom teal/emerald theme and glass-morphism design
- **React Router** for client-side routing with protected routes
- **Recharts** for interactive price charts and visualizations
- **Framer Motion** for smooth animations and transitions
- **Lucide React** icons for modern UI elements
- **Dark mode** with persistent theme preferences
- **Toast notifications** for user feedback

### Backend
- **FastAPI** REST API with automatic OpenAPI documentation
- **XGBoost** and **scikit-learn** for machine learning predictions
- **Yahoo Finance API** integration with fallback mechanisms
- **In-memory TTL cache** for optimal performance
- **CORS support** for cross-origin requests

### Data & Authentication
- **Mock authentication** with localStorage persistence
- **Protected routes** for Dashboard, Predict, and History pages
- **Predictions history** stored locally with detailed metrics
- **Multi-currency support** - Native INR for Indian stocks, USD→INR conversion for US stocks
- **Real-time confidence scores** based on model R² metrics

### Performance & UX
- **Responsive design** optimized for desktop and mobile
- **Loading states** and skeleton screens for better UX
- **Error handling** with user-friendly messages
- **Session management** with automatic logout
- **Dashboard analytics** with prediction statistics  

---

## 📁 Project Architecture

```text
PBL/
├── backend/                          # FastAPI ML Service
│   ├── main.py                      # FastAPI app, CORS, POST /api/predict
│   ├── requirements.txt             # Python dependencies
│   ├── ml/                          # Machine Learning Components
│   │   ├── __init__.py
│   │   └── predictor.py             # Features, train, predict, holdout R² → confidence
│   └── utils/                       # Utility Modules
│       ├── __init__.py
│       ├── cache.py                 # Simple TTL cache for market data
│       └── yahoo_chart.py           # Fallback Yahoo Finance API
├── frontend/                        # React Frontend
│   ├── src/
│   │   ├── components/              # Reusable UI Components
│   │   │   ├── AppLayout.jsx        # Main layout wrapper
│   │   │   ├── Sidebar.jsx          # Navigation sidebar
│   │   │   ├── Spinner.jsx          # Loading spinner
│   │   │   ├── Skeleton.jsx         # Skeleton loading states
│   │   │   └── ChartPlaceholder.jsx # Chart loading placeholder
│   │   ├── context/                 # React Context Providers
│   │   │   ├── AuthContext.jsx      # Authentication state
│   │   │   ├── ThemeContext.jsx     # Theme management
│   │   │   └── ToastContext.jsx     # Toast notifications
│   │   ├── pages/                   # Page Components
│   │   │   ├── Landing.jsx          # Landing page
│   │   │   ├── Login.jsx            # Login page
│   │   │   ├── Signup.jsx           # Signup page
│   │   │   ├── Dashboard.jsx        # Dashboard with analytics
│   │   │   ├── Predict.jsx          # Stock prediction interface
│   │   │   └── History.jsx          # Prediction history
│   │   ├── routes/                  # Route Protection
│   │   │   └── ProtectedRoute.jsx    # Authenticated route wrapper
│   │   ├── services/                # API & Storage Services
│   │   │   ├── api.js               # Backend API calls
│   │   │   ├── storage.js           # Local storage management
│   │   │   └── formatInr.js         # Currency formatting utilities
│   │   ├── App.jsx                  # Main app component
│   │   └── main.jsx                 # React entry point
│   ├── package.json                 # Node.js dependencies
│   └── vite.config.js               # Vite configuration with proxy
├── ARCHITECTURE.md                  # Detailed architecture documentation
├── README.md                        # This file
└── .gitignore                       # Git ignore patterns

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm  
- **Python** 3.10+ (3.13 tested)  

### 1. Backend Setup

```bash
cd backend
python3 -m venv .venv313
source .venv313/bin/activate   # Windows: .venv313\Scripts\activate
pip install -r requirements.txt
python main.py
```

The FastAPI server starts at **http://127.0.0.1:8000** with:

- `GET /api/health` - Health check endpoint  
- `POST /api/predict` - Stock prediction endpoint  
  - Request body: `{ "symbol": "AAPL" }` or `{ "symbol": "RELIANCE.NS" }`  
  - Response includes predicted close, confidence score, and historical data

**Environment Variables:**
- `CORS_ORIGINS` - Comma-separated origins (default: localhost:5173,3000)
- `DEBUG_API=1` - Include exception details in error responses
- `PORT=8000` - API server port

### 2. Frontend Setup

In a **second** terminal:

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server starts at **http://localhost:5173** with:

- **Hot Module Replacement** for instant updates
- **API proxy** automatically forwards `/api/*` requests to backend
- **Responsive design** optimized for all screen sizes

### 3. Application Usage

1. **Launch the app** - Navigate to http://localhost:5173
2. **Create account** - Sign up with email and password (stored in localStorage)
3. **Login** - Access your personalized dashboard
4. **Make predictions** - Enter stock symbols (e.g., AAPL, RELIANCE.NS, TCS.BO)
5. **View history** - Track your prediction accuracy and confidence scores
6. **Dashboard analytics** - Monitor prediction statistics and trends

### 4. Development Tips

- **Backend reloads** automatically with FastAPI's `reload=True`
- **Frontend HMR** provides instant UI updates
- **Browser DevTools** - Use Network tab to inspect API calls
- **Error handling** - Check browser console for detailed error messages  

---

## 📡 API Documentation

### Prediction Endpoint

**POST** `/api/predict`

#### Request Body
```json
{
  "symbol": "AAPL"  // Stock ticker (max 32 chars)
}
```

#### Response Schema
```json
{
  "prediction": 185.42,        // Predicted same-day close (₹)
  "confidence": 0.87,          // Confidence score (0-1)
  "open": 182.15,              // Same-day open price (₹)
  "prev_close": 180.93,        // Previous close price (₹)
  "currency": "INR",           // Always INR
  "fx_rate_to_inr": 83.12,     // Exchange rate used
  "usd_converted": true,       // Whether USD conversion was applied
  "as_of": "2024-04-30",       // Latest market data date
  "history_days": 504,         // Historical data points used
  "chart_series": [            // Historical price data for charts
    {
      "date": "2024-04-29",
      "close": 180.93,
      "open": 179.50
    }
  ],
  "r2_holdout": 0.87           // Raw R² score on holdout data
}
```

### Health Check

**GET** `/api/health`

```json
{
  "status": "ok",
  "service": "StockVision AI"
}
```

### Error Responses

- **400 Bad Request**: Invalid symbol format or missing data
- **502 Bad Gateway**: Yahoo Finance API issues or model errors

---

## 🔧 Technical Details

### Machine Learning Pipeline

1. **Data Collection**: Real-time Yahoo Finance data with fallback mechanisms
2. **Feature Engineering**: Technical indicators, fundamental metrics, price patterns
3. **Model Selection**: XGBoost (primary) with scikit-learn Gradient Boosting fallback
4. **Validation**: Time-ordered holdout split for realistic performance metrics
5. **Confidence Scoring**: R²-based confidence with bounded 0-1 range

### Currency Handling

- **Indian Stocks** (.NS, .BO): Native INR pricing
- **US Stocks**: Real-time USD→INR conversion via Yahoo Finance
- **Exchange Rate Caching**: TTL cache for FX rates to optimize performance

### Caching Strategy

- **Market Data**: 15-minute TTL for price data
- **FX Rates**: 1-hour TTL for exchange rates
- **Fundamentals**: 24-hour TTL for company metrics

---

## 🚧 Future Enhancements

### Planned Features
- **Firebase Integration**: Real-time sync across devices
- **Advanced Models**: LSTM neural networks for time series
- **Portfolio Management**: Multi-stock prediction tracking
- **Alert System**: Price movement notifications
- **Mobile App**: React Native implementation

### Architecture Improvements
- **Database Migration**: From localStorage to Firestore
- **Authentication**: Firebase Auth with social login
- **API Rate Limiting**: Prevent abuse and ensure stability
- **Monitoring**: Application performance tracking

---

## ⚠️ Disclaimer

**StockVision AI predictions are for educational purposes only.** 

- **Not Financial Advice**: This tool does not provide investment recommendations
- **Market Risks**: Stock markets are inherently unpredictable
- **Data Limitations**: Predictions depend on data quality and availability
- **Model Limitations**: ML models may not capture all market factors
- **Past Performance**: Historical accuracy does not guarantee future results

**Always consult with qualified financial professionals before making investment decisions.**

---

## 📄 License

This project is developed as part of an academic demonstration. Please refer to the project repository for licensing information.

---

*Predict smarter. Invest better.* 🚀
