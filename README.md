# EEG Sleep AI — Polysomnography Neural Classification & Personalised LLM Recommendation Platform

An end-to-end healthcare AI research web application developed for MCA-level research. The system ingests raw polysomnography EEG recordings (EDF / CSV), preprocesses biosignals with MNE-Python, classifies sleep stages (Wake, N1, N2, N3, REM) with a Scikit-Learn model trained with subject-wise cross-validation, and provides personalized next-sleep hygiene prescriptions and interactive Q&A powered by Google Gemini LLM.

---

## 1. System Architecture

```text
college-project/
├── frontend/                  # Next.js 14 App Router, TypeScript, Tailwind CSS, Recharts
│   ├── app/                   # Dashboard (/), Upload (/upload), Analysis (/analysis/[id]),
│   │                          # Assistant (/assistant), History (/history), Settings (/settings)
│   ├── components/            # Reusable UI, layout, and visual chart components
│   ├── lib/                   # API service layer (FastAPI bridge) & typed models
│   └── package.json
│
├── backend/                   # Python FastAPI, MNE-Python, Scikit-Learn, Google GenAI
│   ├── eeg/                   # Signal filtering, epoching, Welch spectral band powers
│   ├── models/                # Trained Random Forest artifact (sleep_stage_model.pkl)
│   ├── llm/                   # Gemini LLM synthesis and interactive chat
│   ├── database/              # SQLite database storage (sleep_eeg.db)
│   ├── main.py                # FastAPI REST endpoints
│   ├── train_model.py         # Subject-wise Sleep-EDF training pipeline
│   └── requirements.txt
│
├── samples/                   # Sample EEG recordings for immediate testing
│   └── sample_sleep_eeg_epoch.csv
│
├── start-all.bat              # One-click dual-server launcher (Frontend + Backend)
└── README.md
```

---

## 2. Quick Start Guide

### Step 1: Initialize Backend & Train Model
```powershell
cd backend
# Run one-click setup script:
.\setup_and_train.bat
```
*Or manually:*
```powershell
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python train_model.py
```

### Step 2: Launch Both Servers
Double-click `start-all.bat` or run:
```powershell
.\start-all.bat
```

Alternatively, run in separate terminals:
- **Terminal 1 (Backend):**
  ```powershell
  cd backend
  .\venv\Scripts\activate
  uvicorn main:app --reload --host 0.0.0.0 --port 8000
  ```
- **Terminal 2 (Frontend):**
  ```powershell
  cd frontend
  npm run dev
  ```

---

## 3. End-to-End Workflow

1. **Dashboard (`/`):** Open [http://localhost:3000](http://localhost:3000) to view baseline polysomnography metrics, stage donut distribution, and hypnogram timeline.
2. **EEG Ingestion (`/upload`):** Upload an `.edf` recording or drag & drop [`samples/sample_sleep_eeg_epoch.csv`](file:///e:/2026-27/college-project/samples/sample_sleep_eeg_epoch.csv).
3. **Analysis Report (`/analysis/[id]`):** Inspect the predicted hypnogram timeline, stage distribution percentages (N3 deep slow-wave, REM, N1, N2, Wake), model confidence, and multi-channel biosignal waveforms.
4. **AI Assistant (`/assistant`):** Review personalized sleep schedule recommendations (suggested bedtime, wake-up time, prioritized habits) and ask interactive questions to Gemini LLM about the sleep report.
5. **Session Archive (`/history`):** Search, filter by sleep efficiency (`>85%`), and export clinical reports.

