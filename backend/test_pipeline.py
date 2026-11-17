"""
Test Script to verify the end-to-end EEG sleep analysis pipeline locally.
"""
import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(__file__))

from eeg.preprocessing import preprocess_csv
from eeg.features import extract_features_from_epochs
from eeg.prediction import predict_sleep_stages
from llm.recommendation import generate_sleep_recommendation

def run_test():
    sample_file = os.path.join(os.path.dirname(__file__), "..", "samples", "sample_sleep_eeg_epoch.csv")
    if not os.path.exists(sample_file):
        print(f"Error: Sample file not found at {sample_file}")
        return

    print("==================================================")
    print("      EEG SLEEP AI - PIPELINE TEST RUNNER         ")
    print("==================================================")
    print(f"[1/4] Preprocessing EEG CSV: {sample_file} ...")
    epochs, metadata = preprocess_csv(sample_file)
    print(f"      Channel: {metadata['channel_used']}")
    print(f"      Total Epochs (30s each): {metadata['total_epochs']}")
    print(f"      Duration: {metadata['duration_minutes']} minutes")

    print("\n[2/4] Extracting Spectral Band & Statistical Features ...")
    features, feature_names = extract_features_from_epochs(epochs, sfreq=metadata['target_sfreq'])
    print(f"      Feature Matrix Shape: {features.shape} ({len(feature_names)} features/epoch)")

    print("\n[3/4] Running Random Forest Sleep Stage Classifier ...")
    results = predict_sleep_stages(features, epochs, metadata)
    print(f"      Model Confidence: {results['modelConfidence']}%")
    print(f"      Sleep Efficiency: {results['efficiency']}%")
    print(f"      Awakenings: {results['awakenings']}")
    print(f"      Stage Distribution: {results['stageDistribution']}")

    print("\n[4/4] Generating Next-Sleep Recommendation ...")
    results["id"] = "test-session-001"
    recommendation = generate_sleep_recommendation(results)
    print(f"      Suggested Bedtime:   {recommendation['suggestedBedtime']}")
    print(f"      Suggested Wake Time: {recommendation['suggestedWakeTime']}")
    print(f"      Summary: {recommendation['summary'][:120]}...")
    print(f"      Habits Generated: {len(recommendation['habits'])} interventions")
    
    print("\n==================================================")
    print("           ALL PIPELINE TESTS PASSED!             ")
    print("==================================================")

if __name__ == "__main__":
    run_test()

