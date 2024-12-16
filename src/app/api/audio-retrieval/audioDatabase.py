import os
import shutil
from basic_pitch.inference import predict_and_save
from basic_pitch import ICASSP_2022_MODEL_PATH
from audioSearching import process_audio, Features
import pickle
import codecs
import sys
# Mengatur encoding terminal menjadi UTF-8
sys.stdout = codecs.getwriter("utf-8")(sys.stdout.buffer, 'strict')
os.environ['PYTHONIOENCODING'] = 'utf-8'
DATABASE_PATH = os.path.join(os.getcwd(), "public", "uploads", "audio") + "/"
TEMP_PATH = os.path.join(os.getcwd(), "public", "uploads", "audio-temp") + "/"
PKL_PATH = os.path.join(os.getcwd(), "database", "audioDataset.pkl")

def process_database(database_path: str, temp_path: str = TEMP_PATH) -> list[tuple[str, Features]]:
    if not os.path.exists(database_path):
        return

    database = []

    files = [f for f in os.listdir(database_path) if os.path.isfile(os.path.join(database_path, f))]

    if not os.path.exists(temp_path):
        os.makedirs(temp_path)

    nonmidi_files = []
    for file_name in files:
        source_file = os.path.join(database_path, file_name)

        if os.path.isfile(source_file):
            # Check the file extension
            ext = os.path.splitext(file_name)[1].lower()

            if ext == ".mid":
                # Directly process .mid files
                database.append((file_name, process_audio(database_path + file_name)))
            elif os.path.exists(temp_path + os.path.splitext(os.path.basename(file_name))[0] + "_basic_pitch.mid"):
                database.append((file_name, process_audio(temp_path + os.path.splitext(os.path.basename(file_name))[0] + "_basic_pitch.mid")))
            else:
                # Stash the non-midi files
                nonmidi_files.append(database_path + file_name)

    # Convert non-midi files
    predict_and_save(
        audio_path_list=nonmidi_files,
        output_directory=temp_path,
        save_midi=True,
        sonify_midi=False,
        save_model_outputs=False,
        save_notes=False,
        model_or_model_path=ICASSP_2022_MODEL_PATH
    )

    for file_name in nonmidi_files:
        database.append((os.path.basename(file_name), process_audio(temp_path + os.path.splitext(os.path.basename(file_name))[0] + "_basic_pitch.mid")))

    shutil.rmtree(temp_path)

    return database

if __name__ == "__main__":
    database = process_database(DATABASE_PATH, TEMP_PATH)

    with open(PKL_PATH, "wb") as file:
        pickle.dump(database, file)
