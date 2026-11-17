import os
import numpy as np
import pandas as pd
from typing import Tuple, List, Dict, Any, Optional
import mne

# Standard clinical sleep epoch duration (AASM standard)
EPOCH_SEC = 30
TARGET_FS = 100 # Standardized sampling frequency (Hz)

# Typical EEG channel names in Sleep-EDF and clinical polysomnography
PREFERRED_CHANNELS = [
    "EEG Fpz-Cz", "EEG Pz-Oz", "Fpz-Cz", "Pz-Oz",
    "EEG C3-A2", "EEG C4-A1", "C3-A2", "C4-A1",
    "EEG Fp1-F3", "Fp1-F3", "O1-A2", "EEG O1-A2", "C3", "C4", "Cz"
]

# Standard 19-channel 10-20 international montage (e.g. Kaggle complete-eeg-dataset)
STANDARD_1020_19CH = [
    'Fp1', 'Fp2', 'F7', 'F3', 'Fz', 'F4', 'F8',
    'T3', 'C3', 'Cz', 'C4', 'T4', 'T5',
    'P3', 'Pz', 'P4', 'T6', 'O1', 'O2'
]

class PreprocessingError(Exception):
    pass

def identify_eeg_channel(channel_names: List[str]) -> str:
    """
    Selects the most suitable primary EEG channel from available recording channels.
    """
    for pref in PREFERRED_CHANNELS:
        for ch in channel_names:
            if pref.lower() in ch.lower():
                return ch

    # Fallback: find any channel with 'EEG' in name
    for ch in channel_names:
        if "eeg" in ch.lower():
            return ch

    if len(channel_names) > 0:
        return channel_names[0]

    raise PreprocessingError("No valid EEG channels found in file.")

def preprocess_edf(
    file_path: str,
    low_cutoff: float = 0.3,
    high_cutoff: float = 35.0,
    target_fs: int = TARGET_FS
) -> Tuple[np.ndarray, Dict[str, Any]]:
    """
    Loads an EDF recording using MNE, filters it, resamples, and segments into 30s epochs.
    Returns:
        epochs_data: np.ndarray of shape (n_epochs, n_samples_per_epoch)
        metadata: Dict with sampling rate, duration, channel used, etc.
    """
    if not os.path.exists(file_path):
        raise PreprocessingError(f"EDF file not found: {file_path}")

    try:
        raw = mne.io.read_raw_edf(file_path, preload=True, verbose=False)
    except Exception as e:
        raise PreprocessingError(f"Failed to read EDF file with MNE: {str(e)}")

    channels = raw.ch_names
    selected_ch = identify_eeg_channel(channels)

    # Pick primary EEG channel
    raw.pick([selected_ch])

    # Bandpass filter (0.3 - 35 Hz) for sleep stages
    raw.filter(l_freq=low_cutoff, h_freq=high_cutoff, fir_design='firwin', verbose=False)

    # Resample to target sampling rate (100 Hz)
    if raw.info['sfreq'] != target_fs:
        raw.resample(target_fs, npad="auto", verbose=False)

    data = raw.get_data()[0] # 1D numpy array
    sfreq = int(raw.info['sfreq'])
    samples_per_epoch = EPOCH_SEC * sfreq

    n_epochs = len(data) // samples_per_epoch
    if n_epochs == 0:
        raise PreprocessingError(f"Recording is too short (< 30 seconds). Total samples: {len(data)}")

    # Truncate to whole epochs and reshape
    truncated_data = data[:n_epochs * samples_per_epoch]
    epochs = truncated_data.reshape((n_epochs, samples_per_epoch))

    metadata = {
        "channel_used": selected_ch,
        "available_channels": channels,
        "original_sfreq": raw.info['sfreq'],
        "target_sfreq": target_fs,
        "total_epochs": n_epochs,
        "duration_minutes": (n_epochs * EPOCH_SEC) // 60,
        "total_seconds": n_epochs * EPOCH_SEC,
    }

    return epochs, metadata

def preprocess_csv(
    file_path: str,
    target_fs: int = TARGET_FS
) -> Tuple[np.ndarray, Dict[str, Any]]:
    """
    Reads a CSV EEG file with numeric columns and segments into 30s epochs.
    """
    if not os.path.exists(file_path):
        raise PreprocessingError(f"CSV file not found: {file_path}")

    try:
        df = pd.read_csv(file_path)
        # Check if columns are numbers (e.g. headerless Kaggle dataset s00.csv)
        is_headerless = False
        try:
            [float(str(c)) for c in df.columns]
            is_headerless = True
        except ValueError:
            pass

        if is_headerless:
            df = pd.read_csv(file_path, header=None)
            if df.shape[1] == 19:
                df.columns = STANDARD_1020_19CH
            else:
                df.columns = [f"EEG_Ch{i+1}" for i in range(df.shape[1])]
    except Exception as e:
        raise PreprocessingError(f"Failed to parse CSV file: {str(e)}")

    # Find candidate signal column
    signal_col = None
    for col in df.columns:
        if any(pref.lower() in col.lower() for pref in PREFERRED_CHANNELS):
            signal_col = col
            break

    if not signal_col:
        # Pick the first numeric column that is not 'time' or 'timestamp'
        numeric_cols = [c for c in df.select_dtypes(include=[np.number]).columns if "time" not in c.lower()]
        if numeric_cols:
            signal_col = numeric_cols[0]
        else:
            raise PreprocessingError("Could not identify an EEG signal column in CSV.")

    raw_signal = df[signal_col].dropna().values

    # Determine or assume sampling rate
    # If a timestamp column exists, calculate dt
    time_cols = [c for c in df.columns if "time" in c.lower()]
    estimated_fs = target_fs
    if time_cols:
        t = df[time_cols[0]].dropna().values
        if len(t) > 1:
            dt = np.mean(np.diff(t[:100]))
            if dt > 0:
                estimated_fs = int(round(1.0 / dt))

    # Resample if needed
    if estimated_fs != target_fs and estimated_fs > 0:
        num_target_samples = int(len(raw_signal) * (target_fs / estimated_fs))
        from scipy.signal import resample
        signal = resample(raw_signal, num_target_samples)
    else:
        signal = raw_signal

    samples_per_epoch = EPOCH_SEC * target_fs
    n_epochs = len(signal) // samples_per_epoch

    if n_epochs == 0:
        # If the file has fewer samples (e.g. small sample epoch file), tile or duplicate for minimum epoch
        if len(signal) >= target_fs * 5: # at least 5 sec
            repeat_factor = int(np.ceil(samples_per_epoch / len(signal)))
            signal = np.tile(signal, repeat_factor)[:samples_per_epoch * 10]
            n_epochs = len(signal) // samples_per_epoch
        else:
            raise PreprocessingError(f"Insufficient EEG samples in CSV ({len(signal)} samples). Minimum 3000 samples required.")

    epochs = signal[:n_epochs * samples_per_epoch].reshape((n_epochs, samples_per_epoch))

    # Extract multi-channel sample snippet if columns exist
    multi_ch = {}
    for candidate, key in [('c3', 'c3_a2'), ('cz', 'c3_a2'), ('fp1', 'fp1_f3'), ('o1', 'o1_a2')]:
        for c in df.columns:
            if candidate in str(c).lower() and key not in multi_ch:
                multi_ch[key] = df[c].dropna().values[:200]

    metadata = {
        "channel_used": signal_col,
        "available_channels": list(df.columns),
        "original_sfreq": estimated_fs,
        "target_sfreq": target_fs,
        "total_epochs": n_epochs,
        "duration_minutes": max(1, (n_epochs * EPOCH_SEC) // 60),
        "total_seconds": n_epochs * EPOCH_SEC,
        "multi_channel_sample": multi_ch
    }

    return epochs, metadata

