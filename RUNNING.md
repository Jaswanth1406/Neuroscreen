# How to Run Neuroscreen

You need two separate terminal windows running simultaneously.

## 1. Backend (FastAPI)
Runs on port `8000`.

```bash
cd autism-screening-app/ml-backend
# Activate virtual environment
source venv/bin/activate
# Run the server
python api.py
```

## 2. Frontend (Next.js)
Runs on port `3000`.

```bash
cd autism-screening-app
npm run dev
```

## 3. Access
Open [http://localhost:3000](http://localhost:3000) in your browser.
