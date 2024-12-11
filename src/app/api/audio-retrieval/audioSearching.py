import mido
import numpy as np
# import matplotlib.pyplot as plt

SEGMENT = 20
SLIDE = 4

ATB_WEIGHT = 0.5
RTB_WEIGHT = 0.3
FTB_WEIGHT = 0.2

def extract_features(current_segment: list) -> list:
        features = []

        bins_128 = np.arange(0, 128 + 1)
        ATB = np.histogram(current_segment, bins=bins_128)[0]
        ATB = ATB / ATB.sum()

        features.extend(ATB)

        bins_255 = np.arange(-127, 128 + 1)
        RTB_current_segment = []
        for i in range(len(current_segment) - 1):
            RTB_current_segment.append(current_segment[i + 1] - current_segment[i])
        RTB = np.histogram(RTB_current_segment, bins=bins_255)[0]
        RTB = RTB / RTB.sum()

        features.extend(RTB)

        FTB_current_segment = []
        for i in range(len(current_segment) - 1):
            FTB_current_segment.append(current_segment[i + 1] - current_segment[0])
        FTB = np.histogram(FTB_current_segment, bins=bins_255)[0]
        FTB = FTB / FTB.sum()

        features.extend(FTB)

        return features

def process_audio(path: str):
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
        active_notes = {}
        disactive_notes = {}
        current_segment = []

        # Sliding window
        while end_idx < len(cumulative_ticks):

            # Sliding the end idx
            while end_idx < len(cumulative_ticks) and cumulative_ticks[end_idx] < start_window + current_segment_length:
                msg = track[end_idx]

                if isinstance(msg, mido.Message) and msg.type in ['note_on', 'note_off']:
                    if msg.type == "note_on":
                        active_notes[msg.note] = cumulative_ticks[end_idx]
                    elif msg.type in ['note_off', 'note_on']:
                        if msg.note in active_notes:
                            for _ in range(cumulative_ticks[end_idx] - active_notes[msg.note]):
                                current_segment.append(msg.note)
                            active_notes.pop(msg.note)
                end_idx += 1

            # Sliding the start idx
            while start_idx < len(cumulative_ticks) and cumulative_ticks[start_idx] < start_window:
                msg = track[start_idx]

                if isinstance(msg, mido.Message) and msg.type in ['note_on', 'note_off']:
                    if msg.type == "note_on":
                        disactive_notes[msg.note] = cumulative_ticks[start_idx]
                    elif msg.type in ['note_off', 'note_on']:
                        if msg.note in disactive_notes:
                            for _ in range(cumulative_ticks[start_idx] - disactive_notes[msg.note]):
                                current_segment.pop(0)
                            disactive_notes.pop(msg.note)

                start_idx += 1

            # Skipping if the segment is too short
            if len(current_segment) <= 20 and len(set(current_segment)) <= 2:
                start_window += slide_length
                continue
            
            # Processing
            current_feature = extract_features(current_segment)
            music_features.append(current_feature)

            # Sliding the target
            start_window += slide_length

    return music_features

def minmax_normalize(array: list) -> list:
    return (array - np.min(array)) / (np.max(array) - np.min(array))

def standard_normalize(array: list) -> list:
    return (array - np.mean(array)) / np.std(array)

def cosine_similarity(v1: np.ndarray, v2: np.ndarray) -> float:
    return np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))

def compare_features(features1: list, features2: list, atb_weight: int = ATB_WEIGHT, rtb_weight: int = RTB_WEIGHT, ftb_weight: int = FTB_WEIGHT) -> float:
    return cosine_similarity(features1[0:128], features2[0:128]) * atb_weight + cosine_similarity(features1[128:383], features2[128:383]) * rtb_weight + cosine_similarity(features1[383:638], features2[383:638]) * ftb_weight

def compare_music(music1: list, music2: list) -> float:
    max = 0
    for feature1 in music1:
        for feature2 in music2:
            score = compare_features(feature1, feature2)
            if score > max:
                max = float(score)
    return max

def find_best_match(music: list, database_features: list, database_path: list) -> list[tuple[str, float]]:
    best_scores = []

    length = len(database_features)
    for i in range(length):
        score = compare_music(music, database_features[i])
        best_scores.append((database_path[i], score))

    best_scores.sort(key=lambda x: x[1], reverse=True)
    return best_scores

# Testing
AUDIO_PATH = "./public/uploads/audio/"

database_features = []
database_path = []

target_features = process_audio(AUDIO_PATH + "peak3.mid")

for i in range(1, 51):
    print(f"{i*2}%")
    database_features.append(process_audio(AUDIO_PATH + f"x ({i}).mid"))
    database_path.append(f"x ({i}).mid")

result = find_best_match(target_features, database_features, database_path)

print(result)