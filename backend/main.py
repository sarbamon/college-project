import os
import shutil
import uuid
from datetime import datetime
from typing import Optional
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from database.db import (
    init_db, save_analysis, get_analysis_by_id, get_all_analyses,
    save_recommendation, get_recommendation_by_analysis_id
)
from eeg.preprocessing import preprocess_edf, preprocess_csv, PreprocessingError
from eeg.features import extract_features_from_epochs
from eeg.prediction import predict_sleep_stages, ModelUnavailableError
from llm.recommendation import generate_sleep_recommendation, answer_assistant_query

app = FastAPI(
    title="EEG Sleep AI Backend",
    description="Polysomnography EEG Sleep Stage Classification & Gemini LLM Sleep Recommendations API",
    version="1.0.0"
)

# CORS setup for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TEMP_DIR = os.path.join(os.path.dirname(__file__), "temp_uploads")
os.makedirs(TEMP_DIR, exist_ok=True)

# Initialize database on startup
@app.on_event("startup")
def startup_event():
    init_db()

@app.get("/health")
def health_check():
    """Validates backend service health and model status."""
    model_path = os.getenv("MODEL_PATH", os.path.join(os.path.dirname(__file__), "models", "sleep_stage_model.pkl"))
    model_exists = os.path.exists(model_path)
    return {
        "status": "ok",
        "service": "EEG Sleep AI FastAPI",
        "version": "1.0.0",
        "model_trained": model_exists
    }

@app.post("/analyze")
async def analyze_eeg(file: UploadFile = File(...)):
    """
    Ingests an EEG recording (.edf or .csv), filters, extracts features,
    and runs neural classification for sleep stages.
    """
    file_name = file.filename or "unknown_recording.edf"
    ext = os.path.splitext(file_name)[1].lower()

    if ext not in [".edf", ".csv"]:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file extension '{ext}'. Only European Data Format (.edf) and tabular (.csv) files are supported."
        )

    # Save uploaded file temporarily for MNE/Pandas processing
    temp_file_path = os.path.join(TEMP_DIR, f"{uuid.uuid4()}_{file_name}")
    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        file_size = os.path.getsize(temp_file_path)

        # 1. Preprocess EEG signal
        if ext == ".edf":
            epochs, metadata = preprocess_edf(temp_file_path)
        else:
            epochs, metadata = preprocess_csv(temp_file_path)

        # 2. Extract Spectral and Statistical Features
        features, feature_names = extract_features_from_epochs(epochs, sfreq=metadata.get("target_sfreq", 100))

        # 3. Model Inference (Random Forest Sleep-EDF Classifier)
        try:
            prediction_result = predict_sleep_stages(features, epochs, metadata)
        except ModelUnavailableError as me:
            raise HTTPException(
                status_code=503,
                detail=str(me)
            )

        analysis_id = f"session-{uuid.uuid4().hex[:8]}"
        analysis_data = {
            "id": analysis_id,
            "fileName": file_name,
            "fileSize": file_size,
            "createdAt": datetime.utcnow().isoformat() + "Z",
            **prediction_result,
            "status": "completed"
        }

        # 4. Generate AI Recommendations & Explanation
        recommendation_data = generate_sleep_recommendation(analysis_data)
        analysis_data["aiExplanation"] = recommendation_data.get("summary", "")

        # 5. Persist to SQLite Database
        save_analysis(analysis_data)
        save_recommendation(recommendation_data)

        return analysis_data

    except PreprocessingError as pe:
        raise HTTPException(status_code=422, detail=f"EEG Preprocessing Error: {str(pe)}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Analysis Pipeline Error: {str(e)}")
    finally:
        # Clean up temporary uploaded file
        if os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception:
                pass

@app.get("/analysis/{analysis_id}")
def get_analysis_endpoint(analysis_id: str):
    """Retrieves an existing analysis session."""
    data = get_analysis_by_id(analysis_id)
    if not data:
        raise HTTPException(status_code=404, detail=f"Analysis session '{analysis_id}' not found.")
    return data

@app.get("/history")
def get_history_endpoint():
    """Retrieves historical sleep recordings archive."""
    return get_all_analyses()

@app.get("/recommendations/{analysis_id}")
def get_recommendations_endpoint(analysis_id: str):
    """Retrieves personalised sleep recommendations for a session."""
    rec = get_recommendation_by_analysis_id(analysis_id)
    if rec:
        return rec
    
    # If not yet generated, fetch analysis and generate
    analysis = get_analysis_by_id(analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail=f"Analysis '{analysis_id}' not found.")
    
    rec = generate_sleep_recommendation(analysis)
    save_recommendation(rec)
    return rec

class ChatRequest(BaseModel):
    analysisId: Optional[str] = None
    message: str

@app.post("/assistant/chat")
def chat_assistant_endpoint(req: ChatRequest):
    """Interactive Gemini LLM assistant for explaining polysomnography results."""
    analysis = None
    if req.analysisId:
        analysis = get_analysis_by_id(req.analysisId)

    reply_text = answer_assistant_query(analysis, req.message)
    return {"reply": reply_text}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port, reload=True)

