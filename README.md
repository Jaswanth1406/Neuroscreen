# 🧠 NeuroScreen — AI-Powered Autism Screening Platform

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.1-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![Python](https://img.shields.io/badge/Python-FastAPI-009688?style=for-the-badge&logo=python)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)

**An intelligent autism screening application combining machine learning predictions with AI-powered clinical support**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Architecture](#-architecture) • [Demo](#-demo)

</div>

---

## 🎯 Problem Statement

Early autism screening is crucial for timely intervention, yet access to specialists remains limited. Parents and caregivers often wait months for professional assessments, delaying critical support during key developmental windows.

## 💡 Our Solution

**NeuroScreen** democratizes autism screening by providing:

- **Instant AQ-10 Screening** — Validated 10-question assessment with ML-enhanced predictions
- **AI Clinical Support** — Personalized therapy recommendations and task management
- **Progress Tracking** — Monitor therapy tasks across multiple developmental categories
- **Evidence-Based Insights** — Calibrated confidence scores with contributing factor analysis

> ⚠️ **Disclaimer**: This tool provides screening support only, not medical diagnoses. Always consult healthcare professionals for clinical evaluation.

---

## ✨ Features

### 🔬 ML-Powered Screening
- **AQ-10 Questionnaire** — Clinically validated autism screening assessment
- **LightGBM Classifier** — Trained on behavioral features with high accuracy
- **Calibrated Confidence Scores** — Probability-based risk assessment
- **Contributing Factor Analysis** — Identifies key behavioral indicators

### 🤖 AI Clinical Support Assistant
- **Personalized Recommendations** — Context-aware therapy suggestions based on user history
- **Smart Task Generation** — Auto-categorized therapy tasks (Social Skills, Communication, Sensory, etc.)
- **Real-time Chat** — Powered by Groq's llama-3.3-70b-versatile model

### 📊 Comprehensive Dashboard
- **Screening History** — Track all past assessments with detailed breakdowns
- **Progress Tracker** — Manage therapy tasks with categories, completion status, and search
- **Task Notifications** — Smart alerts for overdue and pending tasks
- **Settings Management** — Browser notifications, preferences, and account controls

### 🔐 Secure Authentication
- **Better Auth** — Modern authentication with session management
- **Google OAuth** — One-click sign-in integration
- **User-Specific Data** — Isolated storage per authenticated user

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 15.1** | React framework with App Router |
| **React 19** | UI library with latest features |
| **TypeScript** | Type-safe development |
| **Tailwind CSS 4** | Utility-first styling |
| **shadcn/ui** | Accessible component library |
| **AI SDK** | Streaming chat interface |

### Backend
| Technology | Purpose |
|------------|---------|
| **Python FastAPI** | ML model serving (port 8000) |
| **LightGBM** | Gradient boosting classifier |
| **Neon PostgreSQL** | Serverless database |
| **Groq API** | LLM inference (llama-3.3-70b) |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| **Better Auth** | Authentication & sessions |
| **Vercel** | Frontend deployment ready |
| **Connection Pooling** | Optimized DB performance |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.9+
- npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/neuroscreen.git
cd neuroscreen/autism-screening-app
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create `.env.local` in `autism-screening-app/`:

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Authentication (Better Auth)
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# AI (Groq)
GROQ_API_KEY=your-groq-api-key
```

### 4. Set Up Python ML Backend

```bash
cd ml-backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 5. Train the Model (Optional)

```bash
python train.py
```

### 6. Start the Servers

**Terminal 1 — ML Backend:**
```bash
cd ml-backend
python api.py
```

**Terminal 2 — Next.js Frontend:**
```bash
cd autism-screening-app
npm run dev
```

### 7. Open the App

Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📐 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Screening  │  │  Dashboard  │  │   Clinical Support AI   │  │
│  │    Form     │  │   Pages     │  │       (Chat)            │  │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘  │
└─────────┼────────────────┼─────────────────────┼────────────────┘
          │                │                     │
          ▼                ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Next.js API Routes                          │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌─────────────┐   │
│  │/screening │  │  /tasks   │  │  /chat    │  │/notifications│  │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └──────┬──────┘   │
└────────┼──────────────┼──────────────┼───────────────┼──────────┘
         │              │              │               │
         ▼              ▼              ▼               ▼
┌────────────────┐ ┌─────────────────────────┐ ┌──────────────────┐
│  FastAPI ML    │ │   Neon PostgreSQL       │ │    Groq API      │
│  Backend       │ │   ┌─────────────────┐   │ │  (LLM Inference) │
│  ┌──────────┐  │ │   │ therapy_tasks   │   │ └──────────────────┘
│  │ LightGBM │  │ │   │ screening_hist  │   │
│  │  Model   │  │ │   │ user sessions   │   │
│  └──────────┘  │ │   └─────────────────┘   │
└────────────────┘ └─────────────────────────┘
```

---

## 📁 Project Structure

```
AI WARS 24 HACKATHON/
├── autism-screening-app/          # Next.js Frontend
│   ├── app/
│   │   ├── api/                   # API Routes
│   │   │   ├── auth/              # Better Auth handlers
│   │   │   ├── chat/              # AI chat endpoint
│   │   │   ├── clinical-chat/     # Clinical support AI
│   │   │   ├── notifications/     # Task alerts API
│   │   │   ├── screening/         # ML prediction proxy
│   │   │   ├── screening-history/ # History CRUD
│   │   │   └── tasks/             # Task management
│   │   ├── auth/                  # Auth page
│   │   └── dashboard/             # Dashboard pages
│   │       ├── clinical-support/  # AI chat interface
│   │       ├── history/           # Screening history
│   │       ├── progress/          # Task tracker
│   │       └── settings/          # User settings
│   ├── components/
│   │   ├── ui/                    # shadcn components
│   │   ├── screening-form.tsx     # AQ-10 questionnaire
│   │   ├── results-dashboard.tsx  # Results display
│   │   └── notifications-dropdown.tsx
│   └── lib/
│       ├── auth.ts                # Better Auth config
│       ├── auth-client.ts         # Client-side auth
│       └── db.ts                  # Database pool
│
├── ml-backend/                    # Python ML Service
│   ├── api.py                     # FastAPI server
│   ├── train.py                   # Model training
│   └── models/
│       └── model.pkl              # Trained LightGBM
│
├── dataset/                       # Training data
│   ├── train.csv
│   └── test.csv
│
└── notebooks/
    └── exploratory.ipynb          # Data exploration
```

---

## 🎮 Demo

### Home Screen — Screening Flow
1. Answer 10 validated AQ-10 questions
2. Receive instant ML-powered risk assessment
3. View contributing factors and confidence score
4. Save results to your account

### Dashboard — Progress Tracking
1. View all screening history with trends
2. Add therapy tasks across 7 categories
3. Track completion and receive reminders
4. Get AI-generated task suggestions

### Clinical Support — AI Assistant
1. Chat with context-aware AI
2. Receive personalized therapy recommendations
3. Add suggested tasks directly to tracker
4. Access your screening history for tailored advice

---

## 📊 ML Model Details

### Training Data
- **Dataset**: AQ-10 screening responses with clinician labels
- **Features**: 10 behavioral indicators + demographic factors
- **Preprocessing**: StandardScaler normalization

### Model Architecture
```python
LGBMClassifier(
    n_estimators=100,
    max_depth=6,
    learning_rate=0.1,
    class_weight='balanced'
)
```

### Performance Metrics
| Metric | Score |
|--------|-------|
| AUC-ROC | 0.87 |
| Precision | 0.82 |
| Recall | 0.85 |
| F1 Score | 0.83 |

---

## 🔒 Security & Privacy

- **Authentication**: Better Auth with secure session management
- **Data Isolation**: User-specific data storage
- **SSL/TLS**: Encrypted database connections
- **No PHI Storage**: Screening results are anonymized
- **GDPR Ready**: Data export and deletion capabilities

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **AI Wars 24 Hackathon** — For the opportunity to build this solution
- **Groq** — For fast LLM inference
- **Neon** — For serverless PostgreSQL
- **shadcn/ui** — For beautiful components
- **Vercel** — For the AI SDK

---

<div align="center">

**Built with ❤️ for AI Wars 24 Hackathon**

[⬆ Back to Top](#-neuroscreen--ai-powered-autism-screening-platform)

</div>
