# EEG Sleep AI — FastAPI Backend

Machine learning and LLM-assisted backend for EEG Polysomnography sleep stage classification (Wake, N1, N2, N3, REM) and personalized next-sleep recommendations.

---

## 1. Project Structure

```text
backend/
├── eeg/
│   ├── preprocessing.py      # MNE EDF reader, bandpass filtering, 30s epoching
│   ├── features.py           # Welch spectral band power & signal statistics
│   └── prediction.py         # Model inference & hypnogram reconstruction
├── models/
│   └── sleep_stage_model.pkl # Trained Random Forest artifact (via Joblib)
├── llm/
│   └── recommendation.py     # Gemini API integration via google-genai
├── database/
│   └── db.py                 # SQLite storage for recordings & history
├── main.py                   # FastAPI REST endpoints & CORS configuration
├── train_model.py            # Subject-wise Sleep-EDF model training pipeline
├── requirements.txt          # Python dependencies
└── .env.example              # Environment variables template
```

---

## 2. Installation & Environment Setup

Ensure you have Python 3.11+ installed:

```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

Copy the environment template and set your Gemini API key (optional for LLM explanations):

```bash
cp .env.example .env
```

---

## 3. Training the Machine Learning Model

To train the Random Forest baseline classifier with subject-wise splitting (to prevent data leakage) and generate `models/sleep_stage_model.pkl`:

```bash
python train_model.py
```

This outputs:
- Train/Test subject distribution
- Cross-subject classification report (Accuracy, Precision, Recall, F1)
- Confusion matrix
- Serialized Joblib artifact saved to `models/sleep_stage_model.pkl`

---

## 4. Starting the FastAPI Server

```bash
python main.py
```
Or with uvicorn:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at **http://localhost:8000** with interactive Swagger documentation at **http://localhost:8000/docs**.

---

## 5. Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Check server and model status |
| `POST`| `/analyze` | Ingest `.edf` or `.csv` and return full sleep stage analysis |
| `GET` | `/analysis/{id}` | Retrieve stored analysis session |
| `GET` | `/history` | Fetch all historical analysis sessions |
| `GET` | `/recommendations/{id}` | Get Gemini LLM next-sleep recommendations |
| `POST`| `/assistant/chat` | Interactive Q&A regarding sleep architecture |

