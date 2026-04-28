# StockVision AI - Project Architecture

## Overview
StockVision AI is a full-stack web application that uses machine learning to predict same-day stock closing prices. The application combines a FastAPI backend with React frontend and currently uses localStorage for data persistence.

## Current Architecture

### Backend (FastAPI)
```
backend/
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
├── ml/                     # Machine learning components
│   ├── __init__.py
│   └── predictor.py        # Core ML prediction logic
└── utils/                  # Utility modules
    ├── __init__.py
    ├── cache.py           # TTL caching for market data
    └── yahoo_chart.py     # Fallback Yahoo Finance API
```

### Frontend (React + Vite)
```
frontend/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── AppLayout.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Spinner.jsx
│   │   ├── Skeleton.jsx
│   │   └── ChartPlaceholder.jsx
│   ├── context/           # React context providers
│   │   ├── AuthContext.jsx
│   │   ├── ThemeContext.jsx
│   │   └── ToastContext.jsx
│   ├── pages/             # Page components
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Predict.jsx
│   │   └── History.jsx
│   ├── routes/            # Protected routes
│   │   └── ProtectedRoute.jsx
│   ├── services/          # API and storage services
│   │   ├── api.js         # Backend API calls
│   │   ├── storage.js     # Local storage management
│   │   └── formatInr.js   # Currency formatting
│   ├── App.jsx            # Main app component
│   └── main.jsx           # React entry point
├── package.json           # Node.js dependencies
└── vite.config.js         # Vite configuration
```

## Data Flow

### Current Data Storage (localStorage)
- **Users**: Stored in `stockvision_users` key
- **Predictions**: Stored in `stockvision_predictions` key
- **Session**: Stored in `stockvision_session` key
- **Theme**: Stored in `stockvision_theme` key

### API Endpoints
- `GET /api/health` - Health check
- `POST /api/predict` - Stock prediction endpoint

## Proposed Firebase Integration Architecture

### Firebase Services Required
1. **Firestore Database** - Replace localStorage
2. **Firebase Authentication** - Replace mock auth
3. **Firebase Storage** (Optional) - For CSV exports

### Firebase Collections Structure

#### Users Collection
```javascript
users/{userId}
{
  uid: string,           // Firebase Auth UID
  name: string,          // User display name
  email: string,         // User email (verified)
  createdAt: timestamp,  // Account creation date
  lastLogin: timestamp,  // Last login timestamp
  preferences: {
    theme: string,       // 'dark' (permanent)
    notifications: boolean
  }
}
```

#### Predictions Collection
```javascript
predictions/{predictionId}
{
  userId: string,        // Reference to users collection
  symbol: string,        // Stock symbol (e.g., "AAPL", "RELIANCE.NS")
  timestamp: timestamp,  // Prediction timestamp
  open: number,          // Opening price (INR)
  prevClose: number,     // Previous close price (INR)
  prediction: number,    // Predicted close price (INR)
  confidence: number,     // Confidence score (0-1)
  r2_holdout: number,    // R² score from holdout
  asOf: string,          // Date of latest market data
  historyDays: number,   // Number of historical days used
  currency: string,      // "INR"
  fx_rate_to_inr: number, // Exchange rate used
  usd_converted: boolean, // Whether USD conversion was applied
  chart_series: array,   // Historical price data for charts
  createdAt: timestamp   // When prediction was made
}
```

### Security Rules (firestore.rules)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Predictions - users can only access their own predictions
    match /predictions/{predictionId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Implementation Plan

### Phase 1: Firebase Setup
1. Create Firebase project
2. Enable Firestore Database
3. Enable Firebase Authentication
4. Configure web app credentials

### Phase 2: Authentication Migration
1. Install Firebase SDK: `npm install firebase`
2. Create Firebase config file
3. Update AuthContext to use Firebase Auth
4. Implement sign up, sign in, sign out functions
5. Migrate existing users to Firebase Auth

### Phase 3: Firestore Integration
1. Create Firebase service module
2. Update storage.js to use Firestore
3. Implement CRUD operations for predictions
4. Add real-time listeners for live updates
5. Handle offline synchronization

### Phase 4: Frontend Updates
1. Update components to use Firebase data
2. Add loading states for async operations
3. Implement error handling for network issues
4. Add optimistic updates for better UX

## Required Dependencies

### Frontend (package.json additions)
```json
{
  "firebase": "^10.0.0",
  "@firebase/firestore": "^4.0.0",
  "@firebase/auth": "^1.0.0"
}
```

### Firebase Configuration (src/config/firebase.js)
```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

## Key Benefits of Firebase Integration

1. **Real-time Sync**: Data syncs across devices automatically
2. **Scalability**: Handles millions of users efficiently
3. **Security**: Built-in authentication and security rules
4. **Offline Support**: Works offline with automatic sync
5. **Analytics**: Built-in usage analytics
6. **Hosting**: Can deploy to Firebase Hosting

## Migration Considerations

### Data Migration Script
```javascript
// Script to migrate localStorage to Firebase
const migrateLocalStorage = async () => {
  const users = JSON.parse(localStorage.getItem('stockvision_users') || '[]');
  const predictions = JSON.parse(localStorage.getItem('stockvision_predictions') || '[]');
  
  // Migrate users to Firebase Auth
  for (const user of users) {
    // Create Firebase Auth user
    // Create user document in Firestore
  }
  
  // Migrate predictions with proper userId mapping
  for (const prediction of predictions) {
    // Create prediction document in Firestore
  }
};
```

### Backward Compatibility
- Keep localStorage as fallback during migration
- Implement data validation for existing data
- Handle edge cases for corrupted data

## Testing Strategy

1. **Unit Tests**: Test Firebase service functions
2. **Integration Tests**: Test auth flow and data operations
3. **E2E Tests**: Test complete user workflows
4. **Performance Tests**: Test with large datasets
5. **Security Tests**: Verify security rules work correctly

## Deployment Considerations

1. **Environment Variables**: Store Firebase config securely
2. **Build Optimization**: Optimize bundle size with Firebase SDK
3. **Caching Strategy**: Implement proper caching for Firestore
4. **Error Monitoring**: Set up error tracking (Firebase Crashlytics)
5. **Analytics**: Implement Firebase Analytics for user insights

## Current Technical Stack

### Backend
- **Framework**: FastAPI (Python)
- **ML Library**: XGBoost, scikit-learn
- **Data Source**: Yahoo Finance API
- **Caching**: In-memory TTL cache

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State Management**: React Context API

### Current Data Flow
```
User Input → React Component → API Service → FastAPI Backend → ML Model → Response → UI Update
```

### Proposed Firebase Data Flow
```
User Input → React Component → Firebase Service → Firestore → Real-time Update → UI Refresh
```

This architecture document provides a comprehensive foundation for integrating Firebase into your StockVision AI application while maintaining the existing functionality and improving scalability, security, and user experience.
