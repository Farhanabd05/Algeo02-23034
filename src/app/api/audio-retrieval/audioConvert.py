from basic_pitch.inference import predict_and_save
from basic_pitch import ICASSP_2022_MODEL_PATH

QUERY_PATH = "./public/query/audio/"

# Input and output paths
audio_path = "input.mp3"
output_path = "output.mid"

# Convert audio to MIDI
predict_and_save(
    audio_path_list=[QUERY_PATH+audio_path],
    output_directory=QUERY_PATH,
    save_midi=True,
    sonify_midi=False,
    save_model_outputs=False,
    save_notes=False,
    model_or_model_path=ICASSP_2022_MODEL_PATH
)