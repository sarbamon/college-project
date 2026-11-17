import sqlite3
import json
import os
from typing import List, Optional, Dict, Any
from datetime import datetime

DB_PATH = os.getenv("DATABASE_PATH", os.path.join(os.path.dirname(__file__), "..", "sleep_eeg.db"))

def get_connection():
    os.makedirs(os.path.dirname(os.path.abspath(DB_PATH)), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Table for EEG sleep analysis results
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS analyses (
        id TEXT PRIMARY KEY,
        file_name TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        duration_minutes INTEGER NOT NULL,
        efficiency REAL NOT NULL,
        awakenings INTEGER NOT NULL,
        model_confidence REAL NOT NULL,
        deep_sleep_minutes INTEGER NOT NULL,
        rem_sleep_minutes INTEGER NOT NULL,
        light_sleep_minutes INTEGER NOT NULL,
        wake_minutes INTEGER NOT NULL,
        stage_distribution TEXT NOT NULL,
        hypnogram TEXT NOT NULL,
        eeg_signals TEXT,
        ai_explanation TEXT,
        status TEXT NOT NULL
    );
    """)

    # Table for AI Recommendations
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS recommendations (
        id TEXT PRIMARY KEY,
        analysis_id TEXT NOT NULL,
        generated_at TEXT NOT NULL,
        summary TEXT NOT NULL,
        suggested_bedtime TEXT NOT NULL,
        suggested_wake_time TEXT NOT NULL,
        target_duration_minutes INTEGER NOT NULL,
        key_findings TEXT NOT NULL,
        habits TEXT NOT NULL,
        FOREIGN KEY (analysis_id) REFERENCES analyses(id)
    );
    """)

    # Table for Chat Messages
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        analysis_id TEXT,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp TEXT NOT NULL
    );
    """)

    conn.commit()
    conn.close()

def save_analysis(data: Dict[str, Any]):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT OR REPLACE INTO analyses (
        id, file_name, file_size, created_at, duration_minutes, efficiency,
        awakenings, model_confidence, deep_sleep_minutes, rem_sleep_minutes,
        light_sleep_minutes, wake_minutes, stage_distribution, hypnogram,
        eeg_signals, ai_explanation, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data["id"],
        data["fileName"],
        data["fileSize"],
        data.get("createdAt") or (datetime.utcnow().isoformat() + "Z"),
        data["durationMinutes"],
        data["efficiency"],
        data["awakenings"],
        data["modelConfidence"],
        data["deepSleepMinutes"],
        data["remSleepMinutes"],
        data["lightSleepMinutes"],
        data["wakeMinutes"],
        json.dumps(data["stageDistribution"]),
        json.dumps(data["hypnogram"]),
        json.dumps(data.get("eegSignals", [])),
        data.get("aiExplanation", ""),
        data.get("status", "completed")
    ))
    conn.commit()
    conn.close()

def get_analysis_by_id(analysis_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM analyses WHERE id = ?", (analysis_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    return {
        "id": row["id"],
        "fileName": row["file_name"],
        "fileSize": row["file_size"],
        "createdAt": row["created_at"],
        "durationMinutes": row["duration_minutes"],
        "totalSleepMinutes": row["deep_sleep_minutes"] + row["rem_sleep_minutes"] + row["light_sleep_minutes"],
        "efficiency": row["efficiency"],
        "awakenings": row["awakenings"],
        "modelConfidence": row["model_confidence"],
        "deepSleepMinutes": row["deep_sleep_minutes"],
        "remSleepMinutes": row["rem_sleep_minutes"],
        "lightSleepMinutes": row["light_sleep_minutes"],
        "wakeMinutes": row["wake_minutes"],
        "stageDistribution": json.loads(row["stage_distribution"]),
        "hypnogram": json.loads(row["hypnogram"]),
        "eegSignals": json.loads(row["eeg_signals"]) if row["eeg_signals"] else [],
        "aiExplanation": row["ai_explanation"],
        "status": row["status"]
    }

def get_all_analyses() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT id, created_at, file_name, duration_minutes, efficiency,
           stage_distribution, status
    FROM analyses
    ORDER BY created_at DESC
    """)
    rows = cursor.fetchall()
    conn.close()

    results = []
    for r in rows:
        dist = json.loads(r["stage_distribution"])
        results.append({
            "id": r["id"],
            "date": (r["created_at"] or "")[:10],
            "fileName": r["file_name"],
            "durationMinutes": r["duration_minutes"],
            "efficiency": r["efficiency"],
            "deepPercent": dist.get("n3", 0),
            "remPercent": dist.get("rem", 0),
            "lightPercent": dist.get("n1", 0) + dist.get("n2", 0),
            "wakePercent": dist.get("wake", 0),
            "status": r["status"]
        })
    return results

def save_recommendation(data: Dict[str, Any]):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT OR REPLACE INTO recommendations (
        id, analysis_id, generated_at, summary, suggested_bedtime,
        suggested_wake_time, target_duration_minutes, key_findings, habits
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data["id"],
        data["analysisId"],
        data.get("generatedAt", datetime.utcnow().isoformat() + "Z"),
        data["summary"],
        data["suggestedBedtime"],
        data["suggestedWakeTime"],
        data["targetDurationMinutes"],
        json.dumps(data.get("keyFindings", [])),
        json.dumps(data.get("habits", []))
    ))
    conn.commit()
    conn.close()

def get_recommendation_by_analysis_id(analysis_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM recommendations WHERE analysis_id = ? ORDER BY generated_at DESC LIMIT 1", (analysis_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    return {
        "id": row["id"],
        "analysisId": row["analysis_id"],
        "generatedAt": row["generated_at"],
        "summary": row["summary"],
        "suggestedBedtime": row["suggested_bedtime"],
        "suggestedWakeTime": row["suggested_wake_time"],
        "targetDurationMinutes": row["target_duration_minutes"],
        "keyFindings": json.loads(row["key_findings"]),
        "habits": json.loads(row["habits"])
    }

