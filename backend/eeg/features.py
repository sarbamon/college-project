import numpy as np
from scipy.signal import welch
from scipy.stats import skew, kurtosis
from typing import Tuple, List

# Frequency bands defined for Polysomnography (Hz)
BANDS = {
    'delta': (0.5, 4.0),
    'theta': (4.0, 8.0),
    'alpha': (8.0, 12.0),
    'beta': (12.0, 30.0),
}

FEATURE_NAMES = [
    'delta_abs', 'theta_abs', 'alpha_abs', 'beta_abs', 'total_power',
    'delta_rel', 'theta_rel', 'alpha_rel', 'beta_rel',
    'delta_theta_ratio', 'theta_alpha_ratio', 'slow_fast_ratio',
    'mean', 'std', 'variance', 'skewness', 'kurtosis', 'rms',
    'zcr', 'hjorth_mobility', 'hjorth_complexity'
]

def compute_band_power(freqs: np.ndarray, psd: np.ndarray, low: float, high: float) -> float:
    """Computes integrated power within a specified frequency band."""
    idx_band = np.logical_and(freqs >= low, freqs <= high)
    if not np.any(idx_band):
        return 0.0
    # Trapezoidal integration of power spectral density
    freq_res = freqs[1] - freqs[0] if len(freqs) > 1 else 1.0
    return float(np.sum(psd[idx_band]) * freq_res)

def extract_epoch_features(epoch: np.ndarray, sfreq: float = 100.0) -> np.ndarray:
    """
    Extracts spectral and statistical features from a single 30s EEG epoch.
    """
    # 1. Frequency domain features via Welch PSD
    # 4-second Welch window with 50% overlap
    nperseg = min(len(epoch), int(sfreq * 4))
    freqs, psd = welch(epoch, fs=sfreq, nperseg=nperseg, noverlap=nperseg // 2)

    delta_abs = compute_band_power(freqs, psd, *BANDS['delta'])
    theta_abs = compute_band_power(freqs, psd, *BANDS['theta'])
    alpha_abs = compute_band_power(freqs, psd, *BANDS['alpha'])
    beta_abs  = compute_band_power(freqs, psd, *BANDS['beta'])
    
    total_power = delta_abs + theta_abs + alpha_abs + beta_abs + 1e-10

    # Relative band powers
    delta_rel = delta_abs / total_power
    theta_rel = theta_abs / total_power
    alpha_rel = alpha_abs / total_power
    beta_rel  = beta_abs  / total_power

    # Band power ratios
    delta_theta_ratio = delta_abs / (theta_abs + 1e-8)
    theta_alpha_ratio = theta_abs / (alpha_abs + 1e-8)
    slow_fast_ratio = (delta_abs + theta_abs) / (alpha_abs + beta_abs + 1e-8)

    # 2. Time-domain statistics
    mean_val = float(np.mean(epoch))
    std_val = float(np.std(epoch))
    var_val = float(np.var(epoch))
    skew_val = float(skew(epoch)) if std_val > 1e-8 else 0.0
    kurt_val = float(kurtosis(epoch)) if std_val > 1e-8 else 0.0
    rms_val = float(np.sqrt(np.mean(epoch ** 2)))

    # Zero-crossing rate
    zero_crossings = np.nonzero(np.diff(epoch > 0))[0]
    zcr = float(len(zero_crossings) / len(epoch))

    # 3. Hjorth Parameters
    # 1st and 2nd derivatives
    d1 = np.diff(epoch)
    d2 = np.diff(d1)
    
    var_zero = var_val + 1e-10
    var_d1 = float(np.var(d1)) + 1e-10
    var_d2 = float(np.var(d2)) + 1e-10

    hjorth_mobility = float(np.sqrt(var_d1 / var_zero))
    hjorth_complexity = float((np.sqrt(var_d2 / var_d1)) / hjorth_mobility)

    features = [
        delta_abs, theta_abs, alpha_abs, beta_abs, total_power,
        delta_rel, theta_rel, alpha_rel, beta_rel,
        delta_theta_ratio, theta_alpha_ratio, slow_fast_ratio,
        mean_val, std_val, var_val, skew_val, kurt_val, rms_val,
        zcr, hjorth_mobility, hjorth_complexity
    ]

    return np.array(features, dtype=np.float32)

def extract_features_from_epochs(epochs: np.ndarray, sfreq: float = 100.0) -> Tuple[np.ndarray, List[str]]:
    """
    Extracts features for all epochs in a recording.
    Args:
        epochs: np.ndarray of shape (n_epochs, n_samples)
    Returns:
        X: np.ndarray of shape (n_epochs, n_features)
        feature_names: List of feature names
    """
    n_epochs = len(epochs)
    features_list = []

    for i in range(n_epochs):
        feat = extract_epoch_features(epochs[i], sfreq=sfreq)
        features_list.append(feat)

    X = np.vstack(features_list)
    return X, FEATURE_NAMES

