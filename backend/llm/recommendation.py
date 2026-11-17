import os
import json
from typing import Dict, Any, Optional
from datetime import datetime

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

def get_genai_client():
    """Initializes Google GenAI client if API key is configured."""
    if not GEMINI_API_KEY or GEMINI_API_KEY.startswith("your_"):
        return None
    try:
        from google import genai
        return genai.Client(api_key=GEMINI_API_KEY)
    except Exception as e:
        print(f"Warning: Failed to initialize google-genai client: {e}")
        return None

def generate_fallback_recommendations(analysis: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generates rule-based clinical sleep hygiene recommendations when Gemini API is offline.
    """
    deep_pct = analysis.get("stageDistribution", {}).get("n3", 20)
    rem_pct = analysis.get("stageDistribution", {}).get("rem", 20)
    wake_pct = analysis.get("stageDistribution", {}).get("wake", 10)
    efficiency = analysis.get("efficiency", 85.0)
    duration_min = analysis.get("durationMinutes", 450)
    awakenings = analysis.get("awakenings", 2)

    findings = []
    habits = []

    # Assess Deep Sleep (N3)
    if deep_pct < 16:
        findings.append(f"Sub-optimal Deep Sleep ({deep_pct}%). Normal adult range is 16-25%.")
        habits.append({
            "category": "Pre-Sleep Routine",
            "title": "Evening Hot Bath / Passive Body Heating",
            "description": "Take a warm shower 90 minutes before sleep. Subsequent vasodilation lowers core body temperature, triggering slow-wave delta sleep.",
            "priority": "high"
        })
    else:
        findings.append(f"Robust Deep Sleep Architecture ({deep_pct}%), supporting cellular restoration and neurotoxin clearance.")

    # Assess REM Sleep
    if rem_pct < 18:
        findings.append(f"Mild REM reduction ({rem_pct}% vs clinical target 20-25%).")
        habits.append({
            "category": "Nutrition",
            "title": "Reduce Evening Alcohol Intake",
            "description": "Even moderate alcohol exerts strong GABAergic suppression on late-night rapid eye movement cycles.",
            "priority": "high"
        })
    else:
        findings.append(f"Healthy REM sleep continuity ({rem_pct}%), promoting emotional regulation and procedural memory.")

    # Assess Awakenings / WASO
    if awakenings >= 4 or efficiency < 85:
        findings.append(f"Frequent sleep fragmentation ({awakenings} awakenings, {efficiency}% efficiency).")
        habits.append({
            "category": "Environment",
            "title": "Maintain Bedroom Temperature at 18-20°C",
            "description": "Ambient heat peaks around 4:00 AM often cause involuntary micro-arousals during lighter sleep phases.",
            "priority": "medium"
        })
    else:
        findings.append(f"High sleep continuity with only {awakenings} awakening event(s).")

    # Anchor Circadian Rhythm
    habits.append({
        "category": "Circadian",
        "title": "Morning Natural Sunlight Exposure",
        "description": "Expose eyes to 10-15 minutes of outdoor sunlight within 30 minutes of waking to anchor cortisol and reset the suprachiasmatic nucleus.",
        "priority": "high"
    })

    habits.append({
        "category": "Nutrition",
        "title": "Establish Caffeine Cut-Off at 1:00 PM",
        "description": "Caffeine has a 5-7 hour half-life and blocks adenosine receptors required for homeostatic sleep pressure build-up.",
        "priority": "medium"
    })

    summary = (
        f"Your polysomnography recording shows {duration_min // 60}h {duration_min % 60}m total recording time with "
        f"{efficiency}% sleep efficiency. Deep sleep was scored at {deep_pct}% and REM at {rem_pct}%. "
        f"Implementing a consistent wind-down buffer and regulating bedroom temperature will stabilise sleep architecture."
    )

    return {
        "id": f"rec-{analysis.get('id', 'latest')}",
        "analysisId": analysis.get("id", ""),
        "generatedAt": datetime.utcnow().isoformat() + "Z",
        "summary": summary,
        "suggestedBedtime": "22:45 PM",
        "suggestedWakeTime": "06:45 AM",
        "targetDurationMinutes": 480,
        "keyFindings": findings,
        "habits": habits
    }

def generate_sleep_recommendation(analysis: Dict[str, Any]) -> Dict[str, Any]:
    """
    Uses Gemini API via google-genai to synthesize polysomnography findings and generate sleep recommendations.
    """
    client = get_genai_client()
    if not client:
        return generate_fallback_recommendations(analysis)

    try:
        prompt = f"""
You are an expert clinical sleep medicine AI assistant. Analyze the following EEG Polysomnography results and produce personalized sleep recommendations.

POLYSOMNOGRAPHY METRICS:
- Total Sleep Time: {analysis.get('durationMinutes', 0)} minutes
- Sleep Efficiency: {analysis.get('efficiency', 0)}%
- Awakenings: {analysis.get('awakenings', 0)} events
- Wake minutes: {analysis.get('wakeMinutes', 0)} min
- Deep Sleep (Stage N3): {analysis.get('stageDistribution', {}).get('n3', 0)}%
- REM Sleep: {analysis.get('stageDistribution', {}).get('rem', 0)}%
- Light Sleep (Stage N1): {analysis.get('stageDistribution', {}).get('n1', 0)}%
- Light Sleep (Stage N2): {analysis.get('stageDistribution', {}).get('n2', 0)}%
- Model Confidence: {analysis.get('modelConfidence', 0)}%

Respond ONLY with a valid JSON object matching this schema:
{{
  "summary": "Concise 2-3 sentence clinical synthesis of the sleep architecture",
  "suggestedBedtime": "e.g. 22:30 PM",
  "suggestedWakeTime": "e.g. 06:30 AM",
  "targetDurationMinutes": 480,
  "keyFindings": [
    "string finding 1",
    "string finding 2",
    "string finding 3"
  ],
  "habits": [
    {{
      "category": "Circadian" or "Environment" or "Nutrition" or "Pre-Sleep Routine",
      "title": "Actionable title",
      "description": "Scientific justification and practical step",
      "priority": "high" or "medium" or "low"
    }}
  ]
}}
"""
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt,
        )

        response_text = response.text.strip()
        # Clean markdown code blocks if present
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]

        parsed = json.loads(response_text.strip())
        parsed["id"] = f"rec-{analysis.get('id', 'latest')}"
        parsed["analysisId"] = analysis.get("id", "")
        parsed["generatedAt"] = datetime.utcnow().isoformat() + "Z"
        return parsed
    except Exception as e:
        print(f"Gemini API generation failed ({e}), falling back to clinical rules.")
        return generate_fallback_recommendations(analysis)

def answer_assistant_query(analysis: Optional[Dict[str, Any]], query: str) -> str:
    """
    Answers user questions regarding their sleep report using Gemini LLM.
    """
    client = get_genai_client()
    context_str = ""
    if analysis:
        context_str = f"""
CURRENT PATIENT POLYSOMNOGRAPHY REPORT:
- Session ID: {analysis.get('id')}
- Total Duration: {analysis.get('durationMinutes')} minutes
- Sleep Efficiency: {analysis.get('efficiency')}%
- Awakenings: {analysis.get('awakenings')}
- Deep Sleep (N3): {analysis.get('stageDistribution', {}).get('n3')}%
- REM Sleep: {analysis.get('stageDistribution', {}).get('rem')}%
- Light Sleep (N1+N2): {analysis.get('stageDistribution', {}).get('n1', 0) + analysis.get('stageDistribution', {}).get('n2', 0)}%
- Model Confidence: {analysis.get('modelConfidence')}%
"""

    if not client:
        # Rule-based informative answer
        q_lower = query.lower()
        if "deep" in q_lower or "n3" in q_lower:
            return (
                "Deep Sleep (Stage N3 or Slow Wave Sleep) is characterized by high-amplitude delta waves (0.5 - 2 Hz). "
                "It is essential for human growth hormone release, muscle repair, immune function, and glymphatic clearance of metabolic waste from the brain."
            )
        elif "rem" in q_lower:
            return (
                "REM (Rapid Eye Movement) sleep features active brain activity with theta and saw-tooth waves. "
                "It plays a fundamental role in memory consolidation, emotional resilience, and cognitive processing."
            )
        elif "wake" in q_lower or "awaken" in q_lower:
            return (
                "Awakenings during the night (Wake After Sleep Onset / WASO) are commonly triggered by shifts in ambient room temperature, "
                "stress-induced cortisol spikes, or late-evening caffeine/alcohol clearance. Maintaining a cool dark room (18-20°C) helps minimize mid-night awakenings."
            )
        else:
            return (
                f"Based on your EEG Polysomnography analysis, maintaining a regular sleep-wake schedule anchors your circadian rhythm. "
                f"Your session recorded an efficiency of {analysis.get('efficiency', 85)}% and {analysis.get('awakenings', 2)} awakening events. "
                "Aim for 7 to 8 hours of total rest with minimal blue light exposure prior to bed."
            )

    try:
        system_instruction = (
            "You are an expert clinical neuroscience and sleep researcher explaining an EEG polysomnography sleep report. "
            "Explain sleep stages, hypnogram trends, and sleep hygiene clearly and empathetically. "
            "Remind the user this is for academic research and does not replace medical diagnosis."
        )
        full_prompt = f"{system_instruction}\n\n{context_str}\n\nPatient Query: {query}"
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=full_prompt,
        )
        return response.text
    except Exception as e:
        return f"Could not contact Gemini AI service: {str(e)}. Please check your GEMINI_API_KEY."

