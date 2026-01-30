# Demo Instructions

## Quick Demo Setup

### Option 1: Frontend Only (Fastest)

1. **Install dependencies:**
   ```bash
   cd autism-screening-app
   npm install
   ```

2. **Start the app:**
   ```bash
   npm run dev
   ```

3. **Open browser:**
   Navigate to http://localhost:3000

The app will work with a built-in fallback prediction model if the ML backend isn't running.

---

### Option 2: Full Stack with ML Backend (Recommended)

1. **Terminal 1 - ML Backend:**
   ```bash
   cd autism-screening-app/ml-backend
   
   # Create virtual environment
   python -m venv venv
   
   # Activate (Windows)
   venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Train the model
   python train.py
   
   # Start API
   python api.py
   ```

2. **Terminal 2 - Frontend:**
   ```bash
   cd autism-screening-app
   npm install
   npm run dev
   ```

3. **Open browser:**
   Navigate to http://localhost:3000

---

## Demo Walkthrough

### 1. Screening Tab
- Complete the 10-question AQ-10 questionnaire
- Each question shows Agree/Disagree options
- Auto-advances to next question after selection
- Fill in demographic information at the end
- Click "Get Screening Results"

### 2. Results Tab
- View the risk assessment (Low/Medium/High)
- See breakdown of scores:
  - AQ-10 Total
  - Social Communication Score
  - Attention & Detail Score
- Review contributing factors
- Read personalized recommendations

### 3. AI Assistant Tab
- Ask questions about:
  - "Explain my results"
  - "What is ASD?"
  - "What should I do next?"
  - "What resources are available?"
- Get contextual responses based on screening results

---

## Demo Scenarios

### Scenario A: Low Risk Result
Use these answers for a low-risk demo:
- Questions 1-10: All "Disagree" (0 scores)
- Age: 25
- Gender: Male/Female
- Jaundice: No
- Family ASD: No

Expected: Low risk level, ~20% confidence

### Scenario B: High Risk Result
Use these answers for a high-risk demo:
- Questions 1-10: All "Agree" (1 scores)
- Age: 25
- Gender: Male/Female
- Jaundice: No
- Family ASD: Yes

Expected: High risk level, ~80%+ confidence

### Scenario C: Medium Risk Result
Use these answers:
- Questions 1-5: "Agree"
- Questions 6-10: "Disagree"
- Age: 30
- Gender: Male/Female
- Jaundice: No
- Family ASD: No

Expected: Medium risk level, ~50% confidence

---

## Key Points for Judges

### Technical Innovation
1. **AI SDK Elements Integration**: Modern chat UI components
2. **LightGBM ML Model**: Trained on real screening data
3. **Real-time Predictions**: Instant feedback
4. **Contextual AI Chat**: Results-aware conversation

### User Experience
1. **Step-by-step Questionnaire**: Easy to follow
2. **Visual Results Dashboard**: Clear presentation
3. **AI Explanation**: Natural language understanding
4. **Mobile Responsive**: Works on all devices

### Clinical Validity
1. **AQ-10 Based**: Validated screening instrument
2. **Calibrated Probabilities**: Not just classification
3. **Clear Disclaimers**: Ethical considerations
4. **Actionable Recommendations**: Next steps guidance

### Accessibility
1. **Clear Language**: No medical jargon
2. **Visual Indicators**: Color-coded risk levels
3. **Multiple Input Methods**: Click or keyboard
4. **Screen Reader Friendly**: Semantic HTML

---

## Troubleshooting

### "Model not loaded" error
Run `python train.py` in the ml-backend directory first.

### "Connection refused" to ML backend
Make sure the FastAPI server is running on port 8000.

### npm install fails
Try deleting node_modules and package-lock.json, then run `npm install` again.

### Styling looks broken
Make sure Tailwind CSS is properly configured. The app uses Tailwind v4.

---

## API Endpoints

### Frontend (Next.js) - Port 3000
- `GET /` - Main application
- `POST /api/screening` - Make prediction (with fallback)
- `POST /api/chat` - AI chat (requires OpenAI key)

### ML Backend (FastAPI) - Port 8000
- `GET /` - Health check
- `GET /questions` - Get AQ-10 questions
- `POST /predict` - Make ML prediction
- `POST /generate-summary` - Generate evidence summary

---

## Environment Variables

Create `.env.local` in the autism-screening-app directory:

```env
# For AI chat functionality (optional)
OPENAI_API_KEY=sk-...

# Or use AI Gateway (recommended)
AI_GATEWAY_API_KEY=...

# ML Backend URL (optional, has fallback)
NEXT_PUBLIC_ML_API_URL=http://localhost:8000
```
