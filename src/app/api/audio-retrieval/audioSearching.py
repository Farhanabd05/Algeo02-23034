# src/app/api/audio-retrieval/audioSearching
import os
import mido
import pickle
import numpy as np
from dataclasses import dataclass
import json
import sys

DATABASE_PATH = os.path.join(os.getcwd(), "public", "uploads", "audio")
QUERY_PATH = os.path.join(os.getcwd(), "public", "query", "audio")
PKL_PATH = os.path.join(os.getcwd(), "database", "audioDataset.pkl")

SEGMENT = 20
SLIDE = 1
ATB_WEIGHT = 0.33
RTB_WEIGHT = 0.33
FTB_WEIGHT = 0.33

database = []

@dataclass
class Features:
    ATB: list[int]
    RTB: list[int]
    FTB: list[int]
    ATB_norm: float
    RTB_norm: float
    FTB_norm: float

def extract_features(current_segment: list[int]) -> Features:
        features = Features([], [], [], 0, 0, 0)

        # extract ATB feature
        bins_128 = np.arange(0, 128 + 1)
        ATB = np.histogram(current_segment, bins=bins_128)[0]
        features.ATB = ATB / ATB.sum()

        # extract RTB feature
        bins_255 = np.arange(-127, 128 + 1)
        RTB_current_segment = []
        for i in range(len(current_segment) - 1):
            RTB_current_segment.append(current_segment[i + 1] - current_segment[i])
        RTB = np.histogram(RTB_current_segment, bins=bins_255)[0]
        features.RTB = RTB / RTB.sum()

        # extract FTB feature
        FTB_current_segment = []
        for i in range(len(current_segment) - 1):
            FTB_current_segment.append(current_segment[i + 1] - current_segment[0])
        FTB = np.histogram(FTB_current_segment, bins=bins_255)[0]
        features.FTB = FTB / FTB.sum()

        # norm features
        features.ATB_norm = np.linalg.norm(features.ATB)
        features.RTB_norm = np.linalg.norm(features.RTB)
        features.FTB_norm = np.linalg.norm(features.FTB)

        return features

def process_audio(path: str) -> list[Features]:
    midi_file = mido.MidiFile(path)

    ticks_per_beat = midi_file.ticks_per_beat
    current_segment_length = SEGMENT * ticks_per_beat
    slide_length = SLIDE * ticks_per_beat

    music_features = []

    for track_index, track in enumerate(midi_file.tracks):
        track_ticks = 0
        cumulative_ticks = []
        for msg in track:
            track_ticks += msg.time
            cumulative_ticks.append(track_ticks)
            
        start_idx = 0
        end_idx = 0
        start_window = 0
        current_segment = []

        # Sliding window
        while end_idx < len(cumulative_ticks):

            # Sliding the end idx
            while end_idx < len(cumulative_ticks) and cumulative_ticks[end_idx] < start_window + current_segment_length:
                msg = track[end_idx]

                if isinstance(msg, mido.Message) and msg.type in ['note_on', 'note_off']:
                    if msg.type == "note_on":
                        current_segment.append(msg.note)
                end_idx += 1

            if end_idx == len(cumulative_ticks):
                break

            # Sliding the start idx
            counter = 0
            while start_idx < len(cumulative_ticks) and cumulative_ticks[start_idx] < start_window:
                msg = track[start_idx]

                if isinstance(msg, mido.Message) and msg.type in ['note_on', 'note_off']:
                    if msg.type == "note_on":
                        counter += 1

                start_idx += 1
            
            current_segment = current_segment[counter:]

            # Skipping if the segment is too short
            if len(current_segment) <= 4 or len(set(current_segment)) <= 8:
                start_window += slide_length
                continue
            
            # Processing
            current_feature = extract_features(current_segment)
            music_features.append(current_feature)

            # Sliding the target
            start_window += slide_length

    return music_features

def minmax_normalize(array: list[int]) -> list:
    return (array - np.min(array)) / (np.max(array) - np.min(array))

def standard_normalize(array: list[int]) -> list:
    return (array - np.mean(array)) / np.std(array)

def cosine_similarity(v1: list[int], v2: list[int], norm1: int, norm2: int) -> float:
    return np.dot(v1, v2) / (norm1 * norm2)

def compare_features(features1: Features, features2: Features, atb_weight: int = ATB_WEIGHT, rtb_weight: int = RTB_WEIGHT, ftb_weight: int = FTB_WEIGHT) -> float:
    return cosine_similarity(features1.ATB, features2.ATB, features1.ATB_norm, features2.ATB_norm) * atb_weight + cosine_similarity(features1.RTB, features2.RTB, features1.RTB_norm, features2.RTB_norm) * rtb_weight + cosine_similarity(features1.FTB, features2.FTB, features1.FTB_norm, features2.FTB_norm) * ftb_weight

def compare_music(music1: list[Features], music2: list[Features]) -> float:
    max = 0
    for feature1 in music1:
        for feature2 in music2:
            score = compare_features(feature1, feature2)
            if score > max:
                max = float(score)
    return max

def find_best_match(music: list[Features], db: list[tuple[list[Features], list[str]]]) -> list[tuple[str, float]]:
    best_scores = []

    for file_name, features in db:
        score = compare_music(music, features)
        best_scores.append((file_name, score))

    best_scores.sort(key=lambda x: x[1], reverse=True)
    return best_scores

def search_music(music_path: str, max_result: int) -> list[tuple[str, float]]:
    if os.path.splitext(music_path)[1] != ".mid":
        music_path = os.path.splitext(music_path)[0] + "_basic_pitch.mid"

    music = process_audio(music_path)
    return find_best_match(music, database)[:max_result]

def print_results(results: list[tuple[str, float]]):
    
    json_results = [
        {
            'filename': result[0],
            'score': result[1] * 100
        }
        for result in results
    ]

    print(json.dumps(json_results))

if __name__ == "__main__":
    with open(PKL_PATH, "rb") as file:
        database: list[tuple[str, Features]] = pickle.load(file)

    query_audio_path = sys.argv[1]

    results = search_music(query_audio_path, 5)

    print_results(results)