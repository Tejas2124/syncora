# Audio Feature Extraction and Mood Mapping Pipeline

## 1. Waveform and Framing (Time-Domain Analysis)

We begin with the raw audio signal (waveform), represented as a discrete sequence of amplitude values:

    y = [x₀, x₁, x₂, x₃, ...]

Each value corresponds to air pressure at a specific moment in time. The sampling rate (e.g., 22050 Hz) determines how many samples are taken per second.

### Framing

Audio signals are non-stationary, meaning their properties change over time. To analyze them effectively, we divide the waveform into small overlapping chunks called frames:

    y[i : i + frame_length]

- Typical frame size: 20–100 ms  
- Assumption: the signal is locally stationary within each frame  

---

## 2. Energy (Signal Power)

For each frame, we compute the energy:

    Energy = Σ (x²)

### Purpose

- Squaring removes negative values  
- Emphasizes larger amplitudes  
- Represents physical signal power  

### Interpretation

- High energy: loud or intense sound  
- Low energy: quiet or calm sound  

---

## 3. Root Mean Square (RMS)

RMS provides a normalized measure of energy:

    RMS = sqrt((1/N) Σ x²)

### Properties

- Normalized by frame size  
- Better approximation of perceived loudness than raw energy  

---

## 4. Decibel Scale (dB)

Amplitude is converted to a logarithmic scale:

    dB = 20 * log10(A)

### Why logarithmic scaling?

Human hearing is logarithmic in nature:
- Equal ratios in amplitude correspond to similar perceived differences in loudness  

### Characteristics

- 0 dB represents a reference maximum  
- Negative values indicate lower amplitudes  

---

## 5. Spectrogram (Time-Frequency Representation)

The Short-Time Fourier Transform (STFT) is applied to each frame:

    Signal (time domain) → Frequency domain

### Output Structure

- X-axis: time  
- Y-axis: frequency  
- Values: magnitude (often converted to dB)  

### Interpretation

The spectrogram shows how energy is distributed across different frequencies over time.

### Tradeoff

- Smaller frames: better time resolution, poorer frequency resolution  
- Larger frames: better frequency resolution, poorer time resolution  

---

## 6. Mel-Frequency Cepstral Coefficients (MFCC)

MFCCs are derived from the spectrogram using the following steps:

1. Convert frequency scale to Mel scale  
2. Apply logarithmic compression  
3. Apply Discrete Cosine Transform (DCT)  

---

### Mel Scale

The Mel scale models human auditory perception:

    Mel(f) = 2595 * log(1 + f / 700)

- More resolution at lower frequencies  
- Less resolution at higher frequencies  

---

### Discrete Cosine Transform (DCT)

- Reduces dimensionality  
- Captures overall spectral shape  
- Removes redundancy in the representation  

---

### Output

- Typically 13 coefficients  
- Represents timbre (texture and character of sound)  

---

## 7. Feature Interpretation and Mood Mapping

Extracted features include:

- Energy / RMS: signal strength  
- Spectral centroid: brightness  
- Tempo: speed of the track  
- MFCCs: timbral characteristics  

These features are mapped to moods using heuristic rules:

    if tempo > 120 and energy is high:
        mood = "Energetic"

---

## Limitations

- Rule-based mapping is heuristic and not mathematically derived  
- Emotional interpretation of sound is subjective  
- Results depend on chosen thresholds and dataset characteristics  

---

## Complete Pipeline

    Waveform (raw signal)
       ↓
    Framing (local analysis)
       ↓
    Energy / RMS (signal power)
       ↓
    Decibel scaling (logarithmic perception)
       ↓
    Spectrogram (frequency structure over time)
       ↓
    MFCC (compressed perceptual representation)
       ↓
    Rule-based mapping (mood classification)

---

## Conceptual Layers

| Layer        | Description                         |
|-------------|-------------------------------------|
| Waveform     | Physical signal representation      |
| Spectrogram  | Frequency structure over time       |
| MFCC         | Perceptual representation           |
| Mood         | Heuristic interpretation            |

---

## Summary

This system transforms raw audio into structured numerical features using signal processing techniques. These features are then interpreted using rule-based logic to assign semantic meaning (mood). The process follows a progression from physical signal representation to higher-level abstraction.