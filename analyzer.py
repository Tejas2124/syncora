import librosa
import numpy as np
import os
import csv
import matplotlib.pyplot as plt
import librosa.display

folder_path = "songs"
output_csv = "audio_features.csv"
plots_folder = "plots"

os.makedirs(plots_folder, exist_ok=True)

frame_length = 2048
hop_length = 512

def process_file(file_path):
    try:
        y, sr = librosa.load(file_path, sr=None)

        if np.max(np.abs(y)) > 0:
            y = y / np.max(np.abs(y))

        rms = librosa.feature.rms(y=y, frame_length=frame_length, hop_length=hop_length)
        avg_rms = np.mean(rms)

        energy_frames = np.array([
            np.sum(y[i:i+frame_length]**2)
            for i in range(0, len(y), hop_length)
        ])
        avg_energy = np.mean(energy_frames)

        dbfs = 20 * np.log10(np.maximum(np.abs(y), 1e-6))
        avg_dbfs = np.mean(dbfs)

        centroid = librosa.feature.spectral_centroid(
            y=y, sr=sr, n_fft=frame_length, hop_length=hop_length
        )
        avg_centroid = np.mean(centroid)

        mfccs = librosa.feature.mfcc(
            y=y, sr=sr, n_mfcc=13,
            n_fft=frame_length, hop_length=hop_length
        )
        mfcc_mean = np.mean(mfccs, axis=1)

        tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
        if isinstance(tempo, np.ndarray):
            tempo = np.mean(tempo)

        chroma = librosa.feature.chroma_stft(y=y, sr=sr)
        chroma_mean = chroma.mean(axis=1)

        major = sum(chroma_mean[i] for i in [0,2,4,5,7,9,11])
        minor = sum(chroma_mean[i] for i in [0,2,3,5,7,8,10])
        mode = "Major" if major > minor else "Minor"

        dynamic_level = np.std(rms)
        intensity = np.mean(librosa.onset.onset_strength(y=y, sr=sr))

        energy_level = avg_rms
        brightness = avg_centroid

        if tempo > 120 and dynamic_level > 0.05 and intensity > 1.5:
            mood = "Epic / Cinematic"
            confidence = 0.9
        elif tempo > 140 and energy_level > 0.15:
            mood = "Energetic / Hype"
            confidence = 0.8
        elif mode == "Minor" and tempo < 100:
            mood = "Emotional / Melancholic"
            confidence = 0.85
        elif energy_level < 0.13 and brightness < 1800:
            mood = "Dreamy / Ambient"
            confidence = 0.7
        elif mode == "Major" and tempo > 100:
            mood = "Happy / Uplifting"
            confidence = 0.75
        elif mode == "Minor" and energy_level < 0.12:
            mood = "Calm / Dark"
            confidence = 0.7
        else:
            mood = "Neutral / Mixed"
            confidence = 0.5

        row = [
            os.path.basename(file_path),
            mood,
            confidence,
            tempo,
            avg_rms,
            avg_dbfs,
            avg_centroid,
            dynamic_level,
            intensity
        ]

        row.extend(mfcc_mean)

        plt.figure(figsize=(14, 10))

        plt.subplot(4, 1, 1)
        librosa.display.waveshow(y, sr=sr)
        plt.title("Waveform")

        plt.subplot(4, 1, 2)
        rms_vals = librosa.feature.rms(y=y, frame_length=frame_length, hop_length=hop_length)[0]
        times = librosa.frames_to_time(range(len(rms_vals)), sr=sr, hop_length=hop_length)
        plt.plot(times, rms_vals)
        plt.title("RMS Energy")

        plt.subplot(4, 1, 3)
        D = librosa.amplitude_to_db(np.abs(librosa.stft(y)), ref=np.max)
        librosa.display.specshow(D, sr=sr, x_axis='time', y_axis='log')
        plt.title("Spectrogram")
        plt.colorbar(format="%+2.0f dB")

        plt.subplot(4, 1, 4)
        librosa.display.waveshow(y, sr=sr)
        beat_times = librosa.frames_to_time(beats, sr=sr)
        plt.vlines(beat_times, ymin=min(y), ymax=max(y))
        plt.title("Beats")

        plt.tight_layout()

        plot_filename = os.path.join(
            plots_folder,
            os.path.basename(file_path).replace(".mp3", ".png").replace(".wav", ".png")
        )

        plt.savefig(plot_filename)
        plt.close()

        return row

    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return None


header = [
    "filename", "mood", "confidence",
    "tempo", "rms", "dbfs", "centroid",
    "dynamics", "intensity"
] + [f"mfcc_{i+1}" for i in range(13)]


with open(output_csv, mode="w", newline="") as file:
    writer = csv.writer(file)
    writer.writerow(header)

    for filename in os.listdir(folder_path):
        if filename.endswith(".mp3") or filename.endswith(".wav"):
            full_path = os.path.join(folder_path, filename)
            print(f"Processing: {filename}")

            row = process_file(full_path)
            if row:
                writer.writerow(row)

print("CSV dataset created:", output_csv)