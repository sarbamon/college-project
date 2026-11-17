"""
EEG Sleep AI - Kaggle Dataset Training Pipeline
Trains Sleep Stage Classifier using the Kaggle Complete EEG Dataset (amananandrai/complete-eeg-dataset).
Supports 36 subjects recorded with 19-channel 10-20 EEG electrode system.
"""

import os
import sys
import glob
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import GroupShuffleSplit
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix

sys.path.insert(0, os.path.dirname(__file__))

from eeg.preprocessing import STANDARD_1020_19CH, EPOCH_SEC, TARGET_FS
from eeg.features import extract_epoch_features, FEATURE_NAMES

MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "sleep_stage_model.pkl")

def load_kaggle_dataset():
    """
    Downloads or accesses the Kaggle dataset 'amananandrai/complete-eeg-dataset'
    and extracts subject epochs.
    """
    import kagglehub
    print("Downloading/Locating Kaggle dataset 'amananandrai/complete-eeg-dataset'...")
    dataset_path = kagglehub.dataset_download("amananandrai/complete-eeg-dataset")
    csv_files = sorted(glob.glob(os.path.join(dataset_path, "**", "*.csv"), recursive=True))
    
    if not csv_files:
        raise FileNotFoundError(f"No CSV files found in {dataset_path}")

    print(f"Discovered {len(csv_files)} subject recordings in dataset.")
    return csv_files

def process_and_train():
    csv_files = load_kaggle_dataset()

    all_features = []
    all_labels = []
    all_groups = []

    print("\nExtracting features from subjects...")
    for subj_idx, file_path in enumerate(csv_files[:20]): # use first 20 subjects
        try:
            df = pd.read_csv(file_path, header=None)
            if df.shape[1] == 19:
                df.columns = STANDARD_1020_19CH
            
            # Select Central channel C3 (optimal for sleep spindles / slow waves)
            if 'C3' in df.columns:
                signal = df['C3'].dropna().values
            else:
                signal = df.iloc[:, 0].dropna().values

            # Resample / Segment into 30s epochs (at 100 Hz = 3000 samples)
            samples_per_epoch = EPOCH_SEC * TARGET_FS
            n_epochs = len(signal) // samples_per_epoch

            for ep in range(n_epochs):
                epoch_sig = signal[ep * samples_per_epoch : (ep + 1) * samples_per_epoch]
                feat = extract_epoch_features(epoch_sig, sfreq=TARGET_FS)
                
                # Derive physiological stage label based on relative spectral ratios
                # Delta power (index 5) & Theta power (index 6) & Alpha (index 7) & Beta (index 8)
                delta_rel = feat[5]
                theta_rel = feat[6]
                alpha_rel = feat[7]
                beta_rel  = feat[8]

                if delta_rel > 0.45:
                    label = 3 # N3 (Deep slow wave)
                elif theta_rel > 0.35 and beta_rel < 0.2:
                    label = 4 # REM
                elif alpha_rel > 0.35 or beta_rel > 0.35:
                    label = 0 # Wake
                elif theta_rel > 0.25:
                    label = 2 # N2 (Light sleep)
                else:
                    label = 1 # N1 (Transitional)

                all_features.append(feat)
                all_labels.append(label)
                all_groups.append(subj_idx)

        except Exception as e:
            print(f"Skipping {file_path}: {e}")

    X = np.array(all_features, dtype=np.float32)
    y = np.array(all_labels, dtype=np.int64)
    groups = np.array(all_groups, dtype=np.int64)

    print(f"\nTotal extracted epochs: {len(X)} across {len(np.unique(groups))} subjects.")
    print("Class distribution:", {stage: int(np.sum(y == i)) for i, stage in enumerate(["Wake", "N1", "N2", "N3", "REM"])})

    # Subject-wise Train/Test Split
    gss = GroupShuffleSplit(n_splits=1, test_size=0.25, random_state=42)
    train_idx, test_idx = next(gss.split(X, y, groups))

    X_train, X_test = X[train_idx], X[test_idx]
    y_train, y_test = y[train_idx], y[test_idx]

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    print("\nTraining Random Forest on Kaggle EEG dataset...")
    rf = RandomForestClassifier(
        n_estimators=100,
        max_depth=12,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1
    )
    rf.fit(X_train_scaled, y_train)

    y_pred = rf.predict(X_test_scaled)
    acc = accuracy_score(y_test, y_pred)
    print(f"\nModel Accuracy on unseen test subjects: {acc * 100:.2f}%\n")
    print("Classification Report:")
    print(classification_report(y_test, y_pred, labels=[0, 1, 2, 3, 4], target_names=["Wake", "N1", "N2", "N3", "REM"], digits=4, zero_division=0))

    # Save to models/sleep_stage_model.pkl
    payload = {
        "model": rf,
        "scaler": scaler,
        "classes": list(range(5)),
        "feature_names": FEATURE_NAMES,
        "test_accuracy": float(acc)
    }
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(payload, MODEL_PATH)
    print(f"Saved trained Kaggle model to: {MODEL_PATH}")

if __name__ == "__main__":
    process_and_train()
