# 🧠 NeuroScreen — AI-Powered Autism Screening Platform

<div align="center">

![NeuroScreen Home](pictures/Home-page.png)

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-FastAPI-009688?style=for-the-badge&logo=python)](https://fastapi.tiangolo.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![LightGBM](https://img.shields.io/badge/LightGBM-ML-green?style=for-the-badge)](https://lightgbm.readthedocs.io/)

**🚀 An intelligent autism screening application combining machine learning predictions with AI-powered clinical support, interactive therapy games, and comprehensive analytics**

[✨ Features](#-features) • [🛠 Tech Stack](#-tech-stack) • [🚀 Getting Started](#-getting-started) • [📐 Architecture](#-architecture) • [🎮 Demo](#-demo)

</div>

---

## 🎯 Problem Statement

Early autism screening is crucial for timely intervention, yet access to specialists remains limited. Parents and caregivers often wait months for professional assessments, delaying critical support during key developmental windows.

## 💡 Our Solution

**NeuroScreen** democratizes autism screening by providing:

| Feature                          | Description                                                   |
| -------------------------------- | ------------------------------------------------------------- |
| 🔬 **Instant AQ-10 Screening**   | Validated 10-question assessment with ML-enhanced predictions |
| 🤖 **AI Clinical Support**       | Personalized therapy recommendations powered by Llama 3.3     |
| 🎮 **Interactive Therapy Games** | Emotion recognition, breathing exercises & social scenarios   |
| 📊 **Advanced Analytics**        | Charts, trends, heatmaps & progress visualization             |
| 📄 **AI Report Generation**      | Comprehensive clinical reports with PDF export                |
| 🏆 **Achievement System**        | AI-generated gamified progress milestones                     |

> ⚠️ **Disclaimer**: This tool provides screening support only, not medical diagnoses. Always consult healthcare professionals for clinical evaluation.

---

## ✨ Features

### 🔬 ML-Powered Screening

- **AQ-10 Questionnaire** — Clinically validated 10-question autism screening assessment
- **LightGBM Classifier** — Gradient boosting model trained on behavioral features (95% accuracy)
- **Calibrated Confidence Scores** — Probability-based risk assessment (Low/Medium/High)
- **Contributing Factor Analysis** — Identifies key behavioral indicators influencing the prediction
- **Video Analysis Support** — Optional video upload for enhanced physical and speech analysis
- **Multi-Modal Fusion** — Combines AQ-10, physical, and speech scores for comprehensive assessment

### 🤖 AI Clinical Support Assistant

- **Personalized Recommendations** — Context-aware therapy suggestions based on screening history
- **Smart Task Generation** — AI auto-categorizes tasks (Social Skills, Communication, Sensory, Motor, Cognitive, Daily Living, Emotional)
- **Real-time Streaming Chat** — Powered by Groq's `llama-3.3-70b-versatile` model
- **History-Aware Responses** — AI accesses your screening results for tailored advice

### 🎮 Interactive Therapy Games

![Dashboard](pictures/Dashboard.png)

Three evidence-based therapeutic activities designed for autism support:

| Game                       | Description                                                   | Skills Developed                                  |
| -------------------------- | ------------------------------------------------------------- | ------------------------------------------------- |
| 😊 **Emotion Recognition** | Identify emotions from emojis and scenarios                   | Emotional intelligence, facial expression reading |
| 🌬️ **Breathing Exercises** | Guided breathing patterns with visual animations              | Self-regulation, anxiety management, calm focus   |
| 👥 **Social Scenarios**    | AI-generated social situations with multiple-choice responses | Social skills, appropriate responses, empathy     |

**Features:**

- 🏆 **Dynamic Achievements** — AI generates personalized achievements based on your progress
- 📊 **Performance Tracking** — Tracks scores, streaks, and session statistics
- ✨ **Animated Feedback** — Visual and audio feedback for engagement

### 📊 Comprehensive Dashboard

- **Screening History** — Track all past assessments with detailed breakdowns
- **Progress Tracker** — Manage therapy tasks with categories, completion status, and search
- **Task Notifications** — Smart alerts for overdue and pending tasks
- **Settings Management** — Browser notifications, preferences, dark mode & account controls

### 📈 Advanced Analytics

- **Trend Analysis** — Track screening scores over time with line charts
- **Category Breakdown** — Pie charts for risk level distribution
- **Task Heatmaps** — Weekly completion visualization
- **Time Range Filters** — View data for 7 days, 30 days, or all time
- **Score Comparisons** — Social vs Attention score bar charts
- **Progress Metrics** — Task completion rates and improvement indicators

### 📄 AI-Powered Reports

- **Comprehensive Clinical Reports** — AI-generated summaries of screening history
- **PDF Export** — Download professional reports for healthcare providers
- **Social Sharing** — Share results securely with family or clinicians
- **Print-Friendly Format** — Optimized layouts for physical documentation

### 🔐 Secure Authentication

- **Better Auth** — Modern authentication with secure session management
- **Google OAuth** — One-click sign-in integration
- **User-Specific Data** — Complete data isolation per authenticated user

### 🎨 Modern UI/UX

- **Dark/Light Mode** — System-aware theme switching
- **Glassmorphism Design** — Beautiful frosted glass effects
- **Responsive Layout** — Works on desktop, tablet, and mobile
- **Animations** — Smooth transitions powered by Framer Motion
- **Accessible Components** — Built with shadcn/ui and Radix primitives

---

## 🛠 Tech Stack

### 🖥️ Frontend

| Technology        | Version | Purpose                         |
| ----------------- | ------- | ------------------------------- |
| **Next.js**       | 16.1    | React framework with App Router |
| **React**         | 19      | UI library with latest features |
| **TypeScript**    | 5.7     | Type-safe development           |
| **Tailwind CSS**  | 4.0     | Utility-first styling           |
| **shadcn/ui**     | Latest  | Accessible component library    |
| **Framer Motion** | Latest  | Animations and transitions      |
| **Recharts**      | 2.15    | Data visualization charts       |
| **AI SDK**        | 6.0     | Streaming chat interface        |

### ⚙️ Backend

| Technology          | Purpose                                 |
| ------------------- | --------------------------------------- |
| **Python FastAPI**  | ML model serving (port 8000)            |
| **LightGBM**        | Gradient boosting classifier            |
| **Neon PostgreSQL** | Serverless database                     |
| **Groq API**        | LLM inference (llama-3.3-70b-versatile) |

### 🏗️ Infrastructure

| Technology             | Purpose                   |
| ---------------------- | ------------------------- |
| **Better Auth**        | Authentication & sessions |
| **Vercel**             | Frontend deployment ready |
| **Connection Pooling** | Optimized DB performance  |

---

## 🚀 Getting Started

### Prerequisites

```
✅ Node.js 18+
✅ Python 3.9+
✅ npm or yarn
```

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Jaswanth1406/Neuroscreen.git
cd Neuroscreen/autism-screening-app
```

### 2️⃣ Install Frontend Dependencies

```bash
npm install
```

### 3️⃣ Set Up Environment Variables

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

### 4️⃣ Set Up Python ML Backend

```bash
cd ml-backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 5️⃣ Train the Model (Optional)

```bash
python train.py
```

### 6️⃣ Start the Servers

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

### 7️⃣ Open the App

🌐 Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📐 Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           User Interface                                 │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐ ┌──────────┐ ┌────────────┐  │
│  │Screening │ │Dashboard │ │Clinical AI  │ │ Therapy  │ │  Reports   │  │
│  │  Form    │ │  Pages   │ │   Chat      │ │  Games   │ │ Analytics  │  │
│  └────┬─────┘ └────┬─────┘ └──────┬──────┘ └────┬─────┘ └─────┬──────┘  │
└───────┼────────────┼──────────────┼─────────────┼─────────────┼─────────┘
        │            │              │             │             │
        ▼            ▼              ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Next.js API Routes                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │
│  │/screening│ │ /tasks   │ │  /chat   │ │/generate-│ │/generate-     │  │
│  │          │ │          │ │          │ │scenarios │ │achievements   │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └───────┬───────┘  │
└───────┼────────────┼────────────┼────────────┼───────────────┼──────────┘
        │            │            │            │               │
        ▼            ▼            ▼            ▼               ▼
┌────────────────┐ ┌─────────────────────────┐ ┌──────────────────────────┐
│  FastAPI ML    │ │   Neon PostgreSQL       │ │       Groq API           │
│  Backend       │ │   ┌─────────────────┐   │ │  ┌────────────────────┐  │
│  ┌──────────┐  │ │   │ therapy_tasks   │   │ │  │ llama-3.3-70b      │  │
│  │ LightGBM │  │ │   │ screening_hist  │   │ │  │ - Chat responses   │  │
│  │  Model   │  │ │   │ user sessions   │   │ │  │ - Achievements     │  │
│  └──────────┘  │ │   │ achievements    │   │ │  │ - Scenarios        │  │
│                │ │   └─────────────────┘   │ │  │ - Reports          │  │
└────────────────┘ └─────────────────────────┘ │  └────────────────────┘  │
                                               └──────────────────────────┘
```

---

## 📁 Project Structure

```
Neuroscreen/
├── 📂 autism-screening-app/          # Next.js Frontend
│   ├── 📂 app/
│   │   ├── 📂 api/                   # API Routes
│   │   │   ├── auth/                 # Better Auth handlers
│   │   │   ├── chat/                 # AI chat endpoint
│   │   │   ├── clinical-chat/        # Clinical support AI
│   │   │   ├── generate-achievements/# AI achievement generation
│   │   │   ├── generate-report/      # AI report generation
│   │   │   ├── generate-scenarios/   # AI social scenarios
│   │   │   ├── notifications/        # Task alerts API
│   │   │   ├── screening/            # ML prediction proxy
│   │   │   ├── screening-history/    # History CRUD
│   │   │   └── tasks/                # Task management
│   │   ├── 📂 auth/                  # Auth page
│   │   └── 📂 dashboard/             # Dashboard pages
│   │       ├── analytics/            # Charts & trends
│   │       ├── clinical-support/     # AI chat interface
│   │       ├── history/              # Screening history
│   │       ├── progress/             # Task tracker
│   │       ├── reports/              # AI-generated reports
│   │       ├── screening/            # In-dashboard screening
│   │       ├── settings/             # User settings
│   │       └── therapy-games/        # Interactive games
│   ├── 📂 components/
│   │   ├── ui/                       # shadcn components (26 files)
│   │   ├── ai-elements/              # AI chat components (48 files)
│   │   ├── screening-form.tsx        # AQ-10 questionnaire
│   │   ├── results-dashboard.tsx     # Results display
│   │   ├── pdf-export.tsx            # PDF generation
│   │   ├── share-results.tsx         # Social sharing
│   │   ├── theme-toggle.tsx          # Dark mode switch
│   │   └── notifications-dropdown.tsx
│   └── 📂 lib/
│       ├── auth.ts                   # Better Auth config
│       ├── auth-client.ts            # Client-side auth
│       └── db.ts                     # Database pool
│
├── 📂 ml-backend/                    # Python ML Service
│   ├── api.py                        # FastAPI server
│   ├── train.py                      # Model training
│   └── 📂 models/
│       └── model.pkl                 # Trained LightGBM
│
├── 📂 dataset/                       # Training data
│   ├── train.csv
│   └── test.csv
│
└── 📂 pictures/                      # Screenshots
    ├── Home-page.png
    └── Dashboard.png
```

---

## 🎮 Demo

### 🏠 Home Screen — Screening Flow

1. ✍️ Answer 10 validated AQ-10 questions with visual progress
2. 📹 Optionally upload a video for enhanced analysis
3. 📊 Receive instant ML-powered risk assessment
4. 🔍 View contributing factors and confidence score
5. 💾 Results auto-save to your account

### 📱 Dashboard — Progress Tracking

1. 📈 View all screening history with interactive charts
2. ➕ Add therapy tasks across 7 categories
3. ✅ Track completion and receive smart reminders
4. 🤖 Get AI-generated task suggestions
5. 🔔 Browser notifications for overdue tasks

### 🧑‍⚕️ Clinical Support — AI Assistant

1. 💬 Chat with context-aware AI that knows your history
2. 📋 Receive personalized therapy recommendations
3. ➕ Add suggested tasks directly to tracker
4. 📂 AI references your screening results for tailored advice

### 🎮 Therapy Games — Interactive Activities

1. 😊 **Emotion Recognition** — Match emotions with scenarios
2. 🌬️ **Breathing Exercises** — Guided calming animations
3. 👥 **Social Scenarios** — AI-generated situational practice
4. 🏆 **Achievements** — Unlock AI-generated milestones

### 📄 Reports — Documentation

1. 📊 Generate comprehensive clinical reports
2. 📥 Download as PDF for healthcare providers
3. 🔗 Share securely with family members
4. 🖨️ Print-friendly formatting

---

## 📊 ML Model Details

### Training Data

| Aspect            | Details                                         |
| ----------------- | ----------------------------------------------- |
| **Dataset**       | AQ-10 screening responses with clinician labels |
| **Features**      | 10 behavioral indicators + demographic factors  |
| **Preprocessing** | StandardScaler normalization                    |

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

| Metric       | Score    |
| ------------ | -------- |
| 📈 Accuracy  | **95%**  |
| 📈 AUC-ROC   | **0.87** |
| 🎯 Precision | **0.82** |
| 🔄 Recall    | **0.85** |
| ⚖️ F1 Score  | **0.83** |

---

## 🔒 Security & Privacy

| Feature               | Description                                |
| --------------------- | ------------------------------------------ |
| 🔐 **Authentication** | Better Auth with secure session management |
| 🗂️ **Data Isolation** | User-specific data storage                 |
| 🔒 **SSL/TLS**        | Encrypted database connections             |
| 🚫 **No PHI Storage** | Screening results are anonymized           |
| ✅ **GDPR Ready**     | Data export and deletion capabilities      |

---

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Therapist portal
- [ ] Video analysis improvements
- [ ] Wearable integration
- [ ] Parent-child shared accounts

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. 🍴 Fork the repository
2. 🌿 Create a feature branch (`git checkout -b feature/amazing-feature`)
3. ✏️ Commit changes (`git commit -m 'Add amazing feature'`)
4. 📤 Push to branch (`git push origin feature/amazing-feature`)
5. 🔃 Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- ⚡ **Groq** — For fast LLM inference
- 🐘 **Neon** — For serverless PostgreSQL
- 🎨 **shadcn/ui** — For beautiful components
- 🧠 **LightGBM** — For the ML classifier
- ▲ **Vercel** — For the AI SDK

---

<div align="center">

### 🌟 Star this repo if you found it helpful!

**Built with ❤️ by [Jaswanth](https://github.com/Jaswanth1406)**

[⬆ Back to Top](#-neuroscreen--ai-powered-autism-screening-platform)

</div>
